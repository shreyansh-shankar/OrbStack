// cmd/publish.go
package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/thelastdeploy/agent/internal/config"
)

type BuilderLabInput struct {
	ID               string   `json:"id"`
	Title            string   `json:"title"`
	Order            int      `json:"order"`
	XP               int      `json:"xp"`
	EstimatedMinutes *int     `json:"estimated_minutes"`
	SetupType        *string  `json:"setup_type"`
	SeedCommands     []string `json:"seed_commands"`
	ValidatorScript  *string  `json:"validator_script"`
	CleanupScript    *string  `json:"cleanup_script"`
}

type BuilderSectionInput struct {
	ID      string            `json:"id"`
	Title   string            `json:"title"`
	Order   int               `json:"order"`
	XP      int               `json:"xp"`
	Content *string           `json:"content"`
	Labs    []BuilderLabInput `json:"labs"`
}

type BuilderModuleInput struct {
	ID               string                 `json:"id"`
	Title            string                 `json:"title"`
	Description      *string                `json:"description"`
	Topic            string                 `json:"topic"`
	Difficulty       string                 `json:"difficulty"`
	EstimatedMinutes *int                   `json:"estimated_minutes"`
	Tags             []string               `json:"tags"`
	Sections         []BuilderSectionInput `json:"sections"`
}

func runPublish(args []string) error {
	if len(args) < 1 {
		return fmt.Errorf("missing module folder path. Usage: tld publish <folder-path>")
	}
	folderPath := args[0]

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	if cfg.AuthToken == "" {
		return fmt.Errorf("you must be logged in to publish. Run 'tld login' first")
	}

	fmt.Printf("Preparing to publish module from folder: %s\n", folderPath)

	module, err := parseModuleDirectory(folderPath)
	if err != nil {
		return fmt.Errorf("parse folder structure: %w", err)
	}

	// Double check that we override XP to 0 locally as required by safety guidelines
	module.EstimatedMinutes = intPtr(0)
	for i := range module.Sections {
		module.Sections[i].XP = 0
		for j := range module.Sections[i].Labs {
			module.Sections[i].Labs[j].XP = 0
		}
	}

	payload, err := json.Marshal(module)
	if err != nil {
		return fmt.Errorf("serialize module structure: %w", err)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest(http.MethodPost, cfg.APIBaseURL+"/builder/modules", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.AuthToken)

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("network request failed: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("server returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	fmt.Printf("\n\x1b[32m✓ Module '%s' successfully published!\x1b[0m\n", module.ID)
	fmt.Println("It is now live but unverified (rewards 0 XP).")
	fmt.Println("You can view it on the syllabus builder page /builder.")

	// Auto-copy to local repository challenges/ directory if running in dev environment
	if _, err := os.Stat("challenges"); err == nil {
		destDir := filepath.Join("challenges", module.ID)
		fmt.Printf("\nDetected local developer repository. Syncing to: %s...\n", destDir)
		os.RemoveAll(destDir)
		if err := copyDir(folderPath, destDir); err != nil {
			fmt.Printf("Warning: failed to copy to codebase challenges folder: %v\n", err)
		} else {
			fmt.Println("✓ Copied challenge config to codebase challenges directory successfully.")
		}
	}

	return nil
}

func copyDir(src string, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		targetPath := filepath.Join(dst, relPath)
		if info.IsDir() {
			return os.MkdirAll(targetPath, info.Mode())
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(targetPath, data, info.Mode())
	})
}

// Simple key-value text lines helper to parse YAML files without import overhead
type yamlMap map[string]string

func readSimpleYAML(path string) (yamlMap, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	res := make(yamlMap)
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		idx := strings.Index(trimmed, ":")
		if idx == -1 {
			continue
		}
		key := strings.TrimSpace(trimmed[:idx])
		val := strings.Trim(strings.TrimSpace(trimmed[idx+1:]), `"'`)
		res[key] = val
	}
	return res, nil
}

func parseModuleDirectory(root string) (*BuilderModuleInput, error) {
	modYamlPath := filepath.Join(root, "module.yaml")
	modData, err := readSimpleYAML(modYamlPath)
	if err != nil {
		return nil, fmt.Errorf("read module.yaml: %w", err)
	}

	id := modData["id"]
	title := modData["title"]
	topic := modData["topic"]
	difficulty := modData["difficulty"]

	if id == "" || title == "" || topic == "" || difficulty == "" {
		return nil, fmt.Errorf("module.yaml is missing required fields (id, title, topic, difficulty)")
	}

	description := modData["description"]
	var estMin *int
	if minStr, ok := modData["estimated_minutes"]; ok {
		if val, err := strconv.Atoi(minStr); err == nil {
			estMin = &val
		}
	}

	tags := []string{}
	if tagsStr, ok := modData["tags"]; ok {
		for _, tag := range strings.Split(tagsStr, ",") {
			trimmed := strings.TrimSpace(tag)
			if trimmed != "" {
				tags = append(tags, trimmed)
			}
		}
	}

	sectionsDir := filepath.Join(root, "sections")
	secEntries, err := os.ReadDir(sectionsDir)
	if err != nil {
		return nil, fmt.Errorf("read sections/ directory: %w", err)
	}

	sections := []BuilderSectionInput{}
	orderSec := 1

	for _, secEntry := range secEntries {
		if !secEntry.IsDir() {
			continue
		}
		secFolder := filepath.Join(sectionsDir, secEntry.Name())
		secYamlPath := filepath.Join(secFolder, "section.yaml")
		if _, err := os.Stat(secYamlPath); os.IsNotExist(err) {
			continue
		}

		secData, err := readSimpleYAML(secYamlPath)
		if err != nil {
			return nil, fmt.Errorf("read section.yaml in %s: %w", secEntry.Name(), err)
		}

		secID := secData["id"]
		secTitle := secData["title"]
		if secID == "" || secTitle == "" {
			return nil, fmt.Errorf("section.yaml in %s is missing required fields (id, title)", secEntry.Name())
		}

		// Read content.md
		var content *string
		contentMdPath := filepath.Join(secFolder, "content.md")
		if mdBytes, err := os.ReadFile(contentMdPath); err == nil {
			cStr := string(mdBytes)
			content = &cStr
		}

		// Read labs
		labsDir := filepath.Join(secFolder, "labs")
		labs := []BuilderLabInput{}
		if _, err := os.Stat(labsDir); err == nil {
			labEntries, err := os.ReadDir(labsDir)
			if err == nil {
				orderLab := 1
				for _, labEntry := range labEntries {
					if !labEntry.IsDir() {
						continue
					}
					labFolder := filepath.Join(labsDir, labEntry.Name())
					labYamlPath := filepath.Join(labFolder, "lab.yaml")
					if _, err := os.Stat(labYamlPath); os.IsNotExist(err) {
						continue
					}

					labData, err := readSimpleYAML(labYamlPath)
					if err != nil {
						return nil, fmt.Errorf("read lab.yaml in %s: %w", labEntry.Name(), err)
					}

					labID := labData["id"]
					labTitle := labData["title"]
					if labID == "" || labTitle == "" {
						return nil, fmt.Errorf("lab.yaml in %s is missing required fields (id, title)", labEntry.Name())
					}

					var labEstMin *int
					if labMinStr, ok := labData["estimated_minutes"]; ok {
						if val, err := strconv.Atoi(labMinStr); err == nil {
							labEstMin = &val
						}
					}

					// Setup commands parsing from raw file (we read it key value or line by line for seed_commands)
					setupType := "none"
					seedCmds := []string{}

					labRawBytes, err := os.ReadFile(labYamlPath)
					if err == nil {
						rawYaml := string(labRawBytes)
						if strings.Contains(rawYaml, "type: shell") {
							setupType = "shell"
						}
						// simple list parser for seed_commands
						lines := strings.Split(rawYaml, "\n")
						inSeedCmds := false
						for _, line := range lines {
							trimmed := strings.TrimSpace(line)
							if strings.HasPrefix(trimmed, "seed_commands:") {
								inSeedCmds = true
								continue
							}
							if inSeedCmds {
								// if it starts with a key/value pattern that is not a list indicator, stop
								if strings.Contains(trimmed, ":") && !strings.HasPrefix(trimmed, "-") {
									inSeedCmds = false
									continue
								}
								if strings.HasPrefix(trimmed, "-") {
									cmd := strings.Trim(strings.TrimSpace(trimmed[1:]), `"'`)
									if cmd != "" {
										seedCmds = append(seedCmds, cmd)
									}
								}
							}
						}
					}

					// Read validator script
					var valScript *string
					valPath := filepath.Join(labFolder, "validator.sh")
					if _, err := os.Stat(valPath); os.IsNotExist(err) {
						valPath = filepath.Join(labFolder, "validator.py")
					}
					if valBytes, err := os.ReadFile(valPath); err == nil {
						vStr := string(valBytes)
						valScript = &vStr
					}

					// Read cleanup script
					var cleanScript *string
					cleanPath := filepath.Join(labFolder, "cleanup.sh")
					if cleanBytes, err := os.ReadFile(cleanPath); err == nil {
						cStr := string(cleanBytes)
						cleanScript = &cStr
					}

					labs = append(labs, BuilderLabInput{
						ID:               labID,
						Title:            labTitle,
						Order:            orderLab,
						XP:               0,
						EstimatedMinutes: labEstMin,
						SetupType:        &setupType,
						SeedCommands:     seedCmds,
						ValidatorScript:  valScript,
						CleanupScript:    cleanScript,
					})
					orderLab++
				}
			}
		}

		sections = append(sections, BuilderSectionInput{
			ID:      secID,
			Title:   secTitle,
			Order:   orderSec,
			XP:      0,
			Content: content,
			Labs:    labs,
		})
		orderSec++
	}

	return &BuilderModuleInput{
		ID:               id,
		Title:            title,
		Description:      &description,
		Topic:            topic,
		Difficulty:       difficulty,
		EstimatedMinutes: estMin,
		Tags:             tags,
		Sections:         sections,
	}, nil
}

func intPtr(val int) *int {
	return &val
}
