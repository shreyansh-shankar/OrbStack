// internal/validator/validator.go
package validator

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/thelastdeploy/agent/internal/device"
)

// Result holds the outcome of a validation run.
type Result struct {
	LabID         string    `json:"lab_id"`
	SectionID     string    `json:"section_id"`
	Passed        bool      `json:"passed"`
	Output        string    `json:"output"`
	RanAt         time.Time `json:"ran_at"`
	Signature     string    `json:"signature"`
	ValidatorHash string    `json:"validator_hash"`
}

// Run executes the validator script and returns a signed Result.
// labID and sectionID are included in the HMAC payload so the backend can
// verify the signature covers the specific lab that was validated.
func Run(labID, sectionID, scriptPath, deviceKeyPath string) (*Result, error) {
	if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("validator script not found: %s", scriptPath)
	}

	valHash, err := Sha256Sum(scriptPath)
	if err != nil {
		return nil, fmt.Errorf("calculate validator hash: %w", err)
	}

	os.Chmod(scriptPath, 0755)

	var cmd *exec.Cmd
	labDir := filepath.Dir(scriptPath)

	if strings.HasSuffix(scriptPath, ".py") {
		pythonBin, err := GetPythonInterpreter(labDir)
		if err != nil {
			return nil, fmt.Errorf("python environment error: %w", err)
		}
		cmd = exec.Command(pythonBin, scriptPath)
	} else {
		cmd = exec.Command("/bin/bash", scriptPath)
	}

	cmd.Dir = labDir
	outBytes, err := cmd.CombinedOutput()
	output := strings.TrimSpace(string(outBytes))
	passed := err == nil

	result := &Result{
		LabID:         labID,
		SectionID:     sectionID,
		Passed:        passed,
		Output:        output,
		RanAt:         time.Now(),
		ValidatorHash: valHash,
	}

	key, err := device.Key(deviceKeyPath)
	if err != nil {
		return nil, fmt.Errorf("device key: %w", err)
	}
	result.Signature = sign(result, key)
	return result, nil
}

func Sha256Sum(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	// Normalize CRLF to LF
	normalized := strings.ReplaceAll(string(data), "\r\n", "\n")
	// Trim trailing whitespace/newlines
	normalized = strings.TrimRightFunc(normalized, func(r rune) bool {
		return r == '\n' || r == '\r' || r == ' ' || r == '\t'
	})

	h := sha256.New()
	h.Write([]byte(normalized))
	return hex.EncodeToString(h.Sum(nil)), nil
}

func GetPythonInterpreter(labDir string) (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("user home dir: %w", err)
	}
	venvPath := filepath.Join(home, ".tld", "venv")
	pythonBin := filepath.Join(venvPath, "bin", "python3")
	pipBin := filepath.Join(venvPath, "bin", "pip")

	if filepath.Separator == '\\' {
		pythonBin = filepath.Join(venvPath, "Scripts", "python.exe")
		pipBin = filepath.Join(venvPath, "Scripts", "pip.exe")
	}

	// 1. Check if venv exists, if not create it
	if _, err := os.Stat(pythonBin); os.IsNotExist(err) {
		fmt.Println("🐍 Bootstrapping Python virtual environment (~/.tld/venv)...")
		if err := os.MkdirAll(venvPath, 0755); err != nil {
			return "", fmt.Errorf("create venv dir: %w", err)
		}
		if _, err := exec.LookPath("python3"); err != nil {
			return "", fmt.Errorf("python3 is not installed or not in PATH — please install Python to run this lab")
		}
		cmd := exec.Command("python3", "-m", "venv", venvPath)
		if out, err := cmd.CombinedOutput(); err != nil {
			return "", fmt.Errorf("failed to create virtual environment: %w\n%s", err, string(out))
		}
		fmt.Println("  ✓ Virtual environment ready.")
	}

	// 2. Check for requirements.txt in labDir
	reqPath := filepath.Join(labDir, "requirements.txt")
	if _, err := os.Stat(reqPath); err == nil {
		markerPath := filepath.Join(venvPath, fmt.Sprintf(".installed-%s", filepath.Base(labDir)))
		reqInfo, _ := os.Stat(reqPath)
		markerInfo, markerErr := os.Stat(markerPath)

		if markerErr != nil || reqInfo.ModTime().After(markerInfo.ModTime()) {
			fmt.Println("📦 Installing lab requirements...")
			cmd := exec.Command(pipBin, "install", "-r", reqPath)
			if out, err := cmd.CombinedOutput(); err != nil {
				return "", fmt.Errorf("failed to install requirements: %w\n%s", err, string(out))
			}
			os.WriteFile(markerPath, []byte(time.Now().String()), 0644)
			fmt.Println("  ✓ Dependencies verified.")
		}
	}

	return pythonBin, nil
}

// sign produces an HMAC-SHA256 over the result fields (excluding Signature).
func sign(r *Result, key []byte) string {
	payload := fmt.Sprintf("%s:%s:%v:%s:%s:%s",
		r.LabID,
		r.SectionID,
		r.Passed,
		r.Output,
		r.ValidatorHash,
		r.RanAt.UTC().Format(time.RFC3339),
	)
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(payload))
	return hex.EncodeToString(mac.Sum(nil))
}

// Verify checks whether a Result's signature is valid against the local device key.
func Verify(r *Result, deviceKeyPath string) (bool, error) {
	key, err := device.Key(deviceKeyPath)
	if err != nil {
		return false, err
	}
	expected := sign(r, key)
	return hmac.Equal([]byte(r.Signature), []byte(expected)), nil
}

// MarshalResult serialises a result to JSON for sending to the API.
func MarshalResult(r *Result) ([]byte, error) {
	return json.MarshalIndent(r, "", "  ")
}
