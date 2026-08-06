// agent/internal/device/device.go
package device

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
)

// Key returns the 32-byte device key, generating and storing it on first call.
//
// Security rule: the key is generated locally using crypto/rand and never
// leaves the machine. It lives at ~/.tld/device.key with permissions 0600.
// We use it only to sign validator results so the backend can verify they came
// from a real run on this device — not from someone manually crafting a POST.
//
// Think of it like a session secret in an Express app, except it persists across
// restarts and is unique per machine.
func Key(keyPath string) ([]byte, error) {
	// Expand ~ if present
	if len(keyPath) >= 2 && keyPath[:2] == "~/" {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}
		keyPath = filepath.Join(home, keyPath[2:])
	}

	data, err := os.ReadFile(keyPath)
	if err == nil && len(data) == 64 {
		// Key already exists and looks valid (64 hex chars = 32 bytes)
		return data, nil
	}

	// Generate a new 32-byte random key, store as 64-char hex string.
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return nil, fmt.Errorf("generate device key: %w", err)
	}
	hexKey := []byte(hex.EncodeToString(raw))

	if err := os.MkdirAll(filepath.Dir(keyPath), 0700); err != nil {
		return nil, fmt.Errorf("create key dir: %w", err)
	}
	// 0600 = only the owner can read or write. No group, no world.
	if err := os.WriteFile(keyPath, hexKey, 0600); err != nil {
		return nil, fmt.Errorf("write device key: %w", err)
	}

	fmt.Printf("  Generated device key: %s\n", keyPath)
	return hexKey, nil
}
