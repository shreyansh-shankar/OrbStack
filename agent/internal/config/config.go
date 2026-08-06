// internal/config/config.go
package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	APIBaseURL     string
	DeviceKeyPath  string
	ChallengesDir  string
	AuthToken      string
	ChallengesRepo string
}

const defaultAPIBaseURL = "https://api.thelastdeploy.com"
const defaultChallengesRepo = "thelastdeploy/thelastdeploy"

func Load() (*Config, error) {
	path, err := configPath()
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return nil, fmt.Errorf("create config dir: %w", err)
	}
	data, err := os.ReadFile(path)
	if err == nil {
		return parse(string(data)), nil
	}
	if !os.IsNotExist(err) {
		return nil, fmt.Errorf("read config: %w", err)
	}
	cfg := defaults()
	if err := write(path, cfg); err != nil {
		return nil, fmt.Errorf("write default config: %w", err)
	}
	return cfg, nil
}

func Save(cfg *Config) error {
	path, err := configPath()
	if err != nil {
		return err
	}
	return write(path, cfg)
}

func TLDDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".tld"), nil
}

func configPath() (string, error) {
	dir, err := TLDDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "config.yaml"), nil
}

func defaults() *Config {
	home, _ := os.UserHomeDir()
	return &Config{
		APIBaseURL:     defaultAPIBaseURL,
		DeviceKeyPath:  filepath.Join(home, ".tld", "device.key"),
		ChallengesDir:  filepath.Join(home, ".tld", "challenges"),
		ChallengesRepo: defaultChallengesRepo,
	}
}

func parse(raw string) *Config {
	cfg := defaults()
	for _, line := range strings.Split(raw, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		idx := strings.Index(line, ":")
		if idx == -1 {
			continue
		}
		key := strings.TrimSpace(line[:idx])
		val := strings.Trim(strings.TrimSpace(line[idx+1:]), `"'`)
		switch key {
		case "api_base_url":
			if val != "" {
				cfg.APIBaseURL = val
			}
		case "device_key_path":
			if val != "" {
				cfg.DeviceKeyPath = expandHome(val)
			}
		case "challenges_dir":
			if val != "" {
				cfg.ChallengesDir = expandHome(val)
			}
		case "challenges_repo":
			if val != "" {
				cfg.ChallengesRepo = val
			}
		case "auth_token":
			cfg.AuthToken = val
		}
	}
	return cfg
}

func write(path string, cfg *Config) error {
	authLine := ""
	if cfg.AuthToken != "" {
		authLine = fmt.Sprintf("auth_token: %s\n", cfg.AuthToken)
	}
	content := fmt.Sprintf("# The Last Deploy — agent configuration\n# Generated automatically on first run. Safe to edit.\napi_base_url: %s\ndevice_key_path: %s\nchallenges_dir: %s\nchallenges_repo: %s\n%s",
		cfg.APIBaseURL, cfg.DeviceKeyPath, cfg.ChallengesDir, cfg.ChallengesRepo, authLine)
	return os.WriteFile(path, []byte(content), 0600)
}

func expandHome(p string) string {
	if !strings.HasPrefix(p, "~/") {
		return p
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return p
	}
	return filepath.Join(home, p[2:])
}
