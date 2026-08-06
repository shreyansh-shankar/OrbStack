// cmd/login.go
package cmd

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"time"

	"github.com/thelastdeploy/agent/internal/config"
)

type DeviceCodeResponse struct {
	DeviceCode      string `json:"device_code"`
	UserCode        string `json:"user_code"`
	VerificationURI string `json:"verification_uri"`
	ExpiresIn       int    `json:"expires_in"`
	Interval        int    `json:"interval"`
}

func runLogin(args []string) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}

	// 1. Request device authorization codes from backend
	fmt.Println("Requesting device authorization code...")
	resp, err := client.Post(cfg.APIBaseURL+"/cli/device-code", "application/json", nil)
	if err != nil {
		return fmt.Errorf("could not reach API at %s: %w", cfg.APIBaseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to get device code (HTTP %d): %s", resp.StatusCode, string(body))
	}

	var codeResp DeviceCodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&codeResp); err != nil {
		return fmt.Errorf("parse device code response: %w", err)
	}

	verificationURL := fmt.Sprintf("%s?code=%s", codeResp.VerificationURI, codeResp.UserCode)

	fmt.Printf("\nTo authenticate the CLI with DevLab:\n")
	fmt.Printf("  1. Navigate to: \x1b[36m%s\x1b[0m\n", verificationURL)
	fmt.Printf("  2. Confirm permission using the User Code: \x1b[1;33m%s\x1b[0m\n\n", codeResp.UserCode)

	// Attempt to open browser automatically
	openBrowser(verificationURL)

	// 2. Poll /cli/token for verification success
	pollInterval := time.Duration(codeResp.Interval) * time.Second
	if pollInterval <= 0 {
		pollInterval = 3 * time.Second
	}

	expiresIn := time.Duration(codeResp.ExpiresIn) * time.Second
	if expiresIn <= 0 {
		expiresIn = 300 * time.Second
	}

	startTime := time.Now()
	payload, _ := json.Marshal(map[string]string{
		"device_code": codeResp.DeviceCode,
	})

	fmt.Println("Waiting for authorization in browser...")

	for {
		if time.Since(startTime) > expiresIn {
			return errors.New("authorization request has expired; please run 'tld login' again")
		}

		time.Sleep(pollInterval)

		tokenResp, err := client.Post(cfg.APIBaseURL+"/cli/token", "application/json", bytes.NewReader(payload))
		if err != nil {
			// Network error, just retry
			continue
		}
		defer tokenResp.Body.Close()

		body, err := io.ReadAll(tokenResp.Body)
		if err != nil {
			continue
		}

		if tokenResp.StatusCode == http.StatusOK {
			// Success! Parse tokens
			var loginResp struct {
				AccessToken string `json:"access_token"`
				TokenType   string `json:"token_type"`
				DeviceKey   string `json:"device_key"`
			}
			if err := json.Unmarshal(body, &loginResp); err != nil {
				return fmt.Errorf("parse token response: %w", err)
			}

			// Persist auth token
			cfg.AuthToken = loginResp.AccessToken
			if err := config.Save(cfg); err != nil {
				return fmt.Errorf("save config: %w", err)
			}

			// If backend issued a device key, write it to ~/.tld/device.key
			if loginResp.DeviceKey != "" {
				if err := os.WriteFile(cfg.DeviceKeyPath, []byte(loginResp.DeviceKey), 0600); err != nil {
					return fmt.Errorf("save device key: %w", err)
				}
				fmt.Printf("  Device key saved: %s\n", cfg.DeviceKeyPath)
			}

			fmt.Println("\n\x1b[32m✓ Logged in successfully!\x1b[0m")
			fmt.Println("  Your results will now be tied to your account and XP will be awarded.")
			return nil
		}

		if tokenResp.StatusCode == http.StatusBadRequest {
			var errBody struct {
				Error            string `json:"error"`
				ErrorDescription string `json:"error_description"`
			}
			if err := json.Unmarshal(body, &errBody); err == nil {
				switch errBody.Error {
				case "authorization_pending":
					// Continue polling
					continue
				case "slow_down":
					pollInterval += 2 * time.Second
					continue
				case "expired_token":
					return errors.New("authorization request has expired; please run 'tld login' again")
				case "access_denied":
					return errors.New("authorization was denied by the user")
				default:
					return fmt.Errorf("authentication error: %s (%s)", errBody.Error, errBody.ErrorDescription)
				}
			}
		}

		return fmt.Errorf("server returned unexpected status code %d: %s", tokenResp.StatusCode, string(body))
	}
}

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	}
	if err == nil {
		fmt.Println("  Opened default browser automatically...")
	}
}
