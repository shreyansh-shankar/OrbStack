// internal/lab/session.go
package lab

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// Session represents an active lab session written to ~/.tld/session.json
type Session struct {
	LabID         string    `json:"lab_id"`
	ModuleID      string    `json:"module_id"`
	SectionID     string    `json:"section_id"`
	StartedAt     time.Time `json:"started_at"`
	ValidatorPath string    `json:"validator_path"`
	SetupType     string    `json:"setup_type"`
	ContainerID   string    `json:"container_id,omitempty"`
}

func sessionPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".tld", "session.json"), nil
}

func WriteSession(s *Session) error {
	path, err := sessionPath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return err
	}
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func ReadSession() (*Session, error) {
	path, err := sessionPath()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("no active lab session — run: tld start <lab-id>")
		}
		return nil, err
	}
	var s Session
	if err := json.Unmarshal(data, &s); err != nil {
		return nil, fmt.Errorf("corrupt session file: %w", err)
	}
	return &s, nil
}

func ClearSession() error {
	path, err := sessionPath()
	if err != nil {
		return err
	}
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func SessionExists() bool {
	path, _ := sessionPath()
	_, err := os.Stat(path)
	return err == nil
}
