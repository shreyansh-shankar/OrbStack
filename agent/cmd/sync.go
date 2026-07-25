// agent/cmd/sync.go
package cmd

import (
	"archive/zip"
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/thelastdeploy/agent/internal/cache"
	"github.com/thelastdeploy/agent/internal/config"
	"github.com/thelastdeploy/agent/internal/queue"
	"github.com/thelastdeploy/agent/internal/validator"
)

// modulesResponse matches GET /modules
type modulesResponse struct {
	Modules []moduleJSON `json:"modules"`
}

// moduleJSON matches the structured object the backend returns per module.
type moduleJSON struct {
	ID                 string   `json:"id"`
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	Topic              string   `json:"topic"`
	Difficulty         string   `json:"difficulty"`
	EstimatedMinutes   int      `json:"estimated_minutes"`
	Tags               []string `json:"tags"`
	TotalXP            int      `json:"total_xp"`
	TotalSections      int      `json:"total_sections"`
	IsOfficialVerified bool     `json:"is_official_verified"`
}

func runSync(args []string) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	var syncAll bool
	var targetModule string
	var targetLab string

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--all":
			syncAll = true
		case "-m":
			if i+1 < len(args) {
				targetModule = args[i+1]
				i++
			}
		case "-l":
			if i+1 < len(args) {
				targetLab = args[i+1]
				i++
			}
		}
	}

	if !syncAll && targetModule == "" && targetLab == "" {
		syncAll = true
	}

	tldDir := filepath.Dir(cfg.DeviceKeyPath)

	drainQueue(cfg.APIBaseURL, cfg.AuthToken, tldDir)

	// Priority 1: Sync from local challenges folder if present (dev setup)
	if _, err := os.Stat("challenges"); err == nil {
		fmt.Println("Syncing from local challenges directory...")
		return syncFromLocal(cfg.ChallengesDir, targetModule, targetLab)
	}

	// Priority 2: Sync from GitHub by default
	fmt.Printf("Syncing from GitHub repository %s...\n", cfg.ChallengesRepo)
	err = syncFromGitHub(cfg.ChallengesRepo, cfg.ChallengesDir, targetModule, targetLab)
	if err == nil {
		return nil
	}
	fmt.Fprintf(os.Stderr, "GitHub sync failed: %v. Falling back to backend API...\n", err)

	// Priority 3: Sync from API backend
	return syncFromAPI(cfg.APIBaseURL, cfg.ChallengesDir, targetModule)
}

// drainQueue attempts to POST any queued results to the API.
func drainQueue(apiBaseURL, authToken, tldDir string) bool {
	entries, err := queue.LoadAll(tldDir)
	if err != nil || len(entries) == 0 {
		client := &http.Client{Timeout: 3 * time.Second}
		resp, err := client.Get(apiBaseURL + "/health")
		if err != nil {
			return false
		}
		resp.Body.Close()
		return resp.StatusCode < 500
	}

	fmt.Printf("Flushing %d queued result(s) to API...\n", len(entries))
	reachable := false
	for _, entry := range entries {
		err, retry := postQueuedEntry(apiBaseURL, authToken, entry)
		if err != nil {
			fmt.Fprintf(os.Stderr, "  ✗ %s (queued %s ago): %v\n",
				entry.LabID,
				time.Since(entry.QueuedAt).Round(time.Second),
				err,
			)
			if !retry {
				fmt.Fprintf(os.Stderr, "  (Deleting permanently due to server rejection)\n")
				queue.Delete(tldDir, entry.LabID, entry.QueuedAt)
			}
			continue
		}
		reachable = true
		if err := queue.Delete(tldDir, entry.LabID, entry.QueuedAt); err != nil {
			fmt.Fprintf(os.Stderr, "  warn: could not remove queue entry: %v\n", err)
		} else {
			fmt.Printf("  ✓ %s (queued %s ago) — synced\n",
				entry.LabID,
				time.Since(entry.QueuedAt).Round(time.Second),
				)
		}
	}
	return reachable
}

func postQueuedEntry(apiBaseURL, authToken string, entry *queue.Entry) (error, bool) {
	data, err := json.MarshalIndent(entry, "", "  ")
	if err != nil {
		return err, false
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest(http.MethodPost, apiBaseURL+"/results", bytes.NewReader(data))
	if err != nil {
		return err, false
	}
	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", "Bearer "+authToken)
	}

	resp, err := client.Do(req)
	if err != nil {
		return err, true
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		retry := resp.StatusCode >= 500 || resp.StatusCode == http.StatusRequestTimeout || resp.StatusCode == http.StatusTooManyRequests
		return fmt.Errorf("API returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body))), retry
	}
	return nil, false
}

func syncFromGitHub(repo string, challengesDir string, targetModule string, targetLab string) error {
	url := fmt.Sprintf("https://github.com/%s/archive/refs/heads/main.zip", repo)
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download ZIP from GitHub: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GitHub returned HTTP status %d", resp.StatusCode)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read ZIP response: %w", err)
	}

	zipReader, err := zip.NewReader(bytes.NewReader(bodyBytes), int64(len(bodyBytes)))
	if err != nil {
		return fmt.Errorf("failed to parse ZIP file: %w", err)
	}

	// Pre-scan pass: Read all YAML versions from the ZIP in-memory
	zipLabVersions := make(map[string]int)
	zipSectionVersions := make(map[string]int)
	zipModuleVersions := make(map[string]int)

	for _, file := range zipReader.File {
		parts := strings.Split(filepath.ToSlash(file.Name), "/")
		challengesIdx := -1
		for idx, part := range parts {
			if part == "challenges" && idx == 1 {
				challengesIdx = idx
				break
			}
		}
		if challengesIdx == -1 {
			continue
		}
		relParts := parts[challengesIdx+1:]
		if len(relParts) == 0 {
			continue
		}
		if len(relParts) == 2 && relParts[1] == "module.yaml" {
			moduleID := relParts[0]
			if data, err := readZipFileContents(file); err == nil {
				zipModuleVersions[moduleID] = parseYAMLVersion(data)
			}
		} else if len(relParts) == 4 && relParts[1] == "sections" && relParts[3] == "section.yaml" {
			moduleID := relParts[0]
			sectionID := relParts[2]
			key := fmt.Sprintf("%s/sections/%s", moduleID, sectionID)
			if data, err := readZipFileContents(file); err == nil {
				zipSectionVersions[key] = parseYAMLVersion(data)
			}
		} else if len(relParts) == 6 && relParts[1] == "sections" && relParts[3] == "labs" && relParts[5] == "lab.yaml" {
			moduleID := relParts[0]
			sectionID := relParts[2]
			labID := relParts[4]
			key := fmt.Sprintf("%s/sections/%s/labs/%s", moduleID, sectionID, labID)
			if data, err := readZipFileContents(file); err == nil {
				zipLabVersions[key] = parseYAMLVersion(data)
			}
		}
	}

	var parentModule string
	var parentSection string

	if targetLab != "" {
		for _, file := range zipReader.File {
			parts := strings.Split(filepath.ToSlash(file.Name), "/")
			challengesIdx := -1
			for idx, part := range parts {
				if part == "challenges" && idx == 1 {
					challengesIdx = idx
					break
				}
			}
			if challengesIdx == -1 {
				continue
			}
			relParts := parts[challengesIdx+1:]
			if len(relParts) >= 6 && relParts[1] == "sections" && relParts[3] == "labs" && relParts[4] == targetLab {
				parentModule = relParts[0]
				parentSection = relParts[2]
				break
			}
		}
		if parentModule == "" {
			return fmt.Errorf("lab %q not found in repository", targetLab)
		}
	}

	syncedModules := make(map[string]bool)

	for _, file := range zipReader.File {
		parts := strings.Split(filepath.ToSlash(file.Name), "/")
		challengesIdx := -1
		for idx, part := range parts {
			if part == "challenges" && idx == 1 {
				challengesIdx = idx
				break
			}
		}
		if challengesIdx == -1 {
			continue
		}

		relParts := parts[challengesIdx+1:]
		if len(relParts) == 0 {
			continue
		}

		subpath := strings.Join(relParts, "/")
		moduleID := relParts[0]

		if targetModule != "" && moduleID != targetModule {
			continue
		}
		if targetLab != "" {
			if moduleID != parentModule {
				continue
			}
			if len(relParts) == 2 && relParts[1] == "module.yaml" {
				// extract
			} else if len(relParts) >= 4 && relParts[1] == "sections" && relParts[2] == parentSection {
				if len(relParts) == 4 && (relParts[3] == "section.yaml" || relParts[3] == "content.md") {
					// extract
				} else if len(relParts) >= 6 && relParts[3] == "labs" && relParts[4] == targetLab {
					// extract
				} else {
					continue
				}
			} else {
				continue
			}
		}

		// Smart differential sync: skip extraction if local version matches zip version
		if !shouldExtractFile(file, relParts, challengesDir, zipModuleVersions, zipSectionVersions, zipLabVersions) {
			syncedModules[moduleID] = true
			continue
		}

		destPath := filepath.Clean(filepath.Join(challengesDir, subpath))
		if !strings.HasPrefix(destPath, filepath.Clean(challengesDir)+string(os.PathSeparator)) && destPath != filepath.Clean(challengesDir) {
			continue
		}

		if file.FileInfo().IsDir() {
			os.MkdirAll(destPath, 0755)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
			return fmt.Errorf("failed to create directory: %w", err)
		}

		srcFile, err := file.Open()
		if err != nil {
			return fmt.Errorf("failed to open zip file entry: %w", err)
		}

		destFile, err := os.OpenFile(destPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.Mode())
		if err != nil {
			srcFile.Close()
			return fmt.Errorf("failed to open destination file: %w", err)
		}

		if _, err := io.Copy(destFile, srcFile); err != nil {
			destFile.Close()
			srcFile.Close()
			return fmt.Errorf("failed to copy file contents: %w", err)
		}
		destFile.Close()
		srcFile.Close()

		syncedModules[moduleID] = true
	}

	if len(syncedModules) == 0 {
		return fmt.Errorf("no valid modules synced")
	}

	fmt.Printf("\nSynced %d module(s) to %s\n", len(syncedModules), challengesDir)
	for m := range syncedModules {
		fmt.Printf("  ✓ %s\n", m)
	}
	return nil
}

func syncFromLocal(challengesDir, targetModule, targetLab string) error {
	entries, err := os.ReadDir("challenges")
	if err != nil {
		return fmt.Errorf("no local ./challenges/ directory found: %w", err)
	}

	var parentModule string
	var parentSection string
	if targetLab != "" {
		found := false
		for _, e := range entries {
			if !e.IsDir() {
				continue
			}
			modID := e.Name()
			secDir := filepath.Join("challenges", modID, "sections")
			sections, err := os.ReadDir(secDir)
			if err != nil {
				continue
			}
			for _, sec := range sections {
				if !sec.IsDir() {
					continue
				}
				labsDir := filepath.Join(secDir, sec.Name(), "labs")
				labs, err := os.ReadDir(labsDir)
				if err != nil {
					continue
				}
				for _, l := range labs {
					if l.IsDir() && l.Name() == targetLab {
						parentModule = modID
						parentSection = sec.Name()
						found = true
						break
					}
				}
				if found {
					break
				}
			}
			if found {
				break
			}
		}
		if parentModule == "" {
			return fmt.Errorf("lab %q not found in local challenges", targetLab)
		}
	}

	count := 0
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		moduleID := e.Name()

		if targetModule != "" && moduleID != targetModule {
			continue
		}
		if targetLab != "" && moduleID != parentModule {
			continue
		}

		yamlPath := filepath.Join("challenges", moduleID, "module.yaml")
		data, err := os.ReadFile(yamlPath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "warn: skipping %s (no module.yaml): %v\n", moduleID, err)
			continue
		}

		// Smart version check: only copy module.yaml if changed
		dstModuleYAML := filepath.Join(challengesDir, moduleID, "module.yaml")
		if getLocalYAMLVersion(yamlPath) != getLocalYAMLVersion(dstModuleYAML) {
			if err := cache.SaveRaw(challengesDir, moduleID, data); err != nil {
				fmt.Fprintf(os.Stderr, "warn: failed to save %s: %v\n", moduleID, err)
				continue
			}
		}

		syncLocalSections(moduleID, challengesDir, parentSection, targetLab)
		fmt.Printf("  ✓ %s\n", moduleID)
		count++
	}

	if count == 0 {
		return fmt.Errorf("no valid modules synced")
	}
	fmt.Printf("\nSynced %d local module(s) to %s\n", count, challengesDir)
	return nil
}

func syncLocalSections(moduleID, challengesDir, parentSection, targetLab string) {
	srcSectionsDir := filepath.Join("challenges", moduleID, "sections")
	dstSectionsDir := filepath.Join(challengesDir, moduleID, "sections")

	sections, err := os.ReadDir(srcSectionsDir)
	if err != nil {
		return
	}

	for _, sec := range sections {
		if !sec.IsDir() {
			continue
		}

		if targetLab != "" && sec.Name() != parentSection {
			continue
		}

		srcSecDir := filepath.Join(srcSectionsDir, sec.Name())
		dstSecDir := filepath.Join(dstSectionsDir, sec.Name())

		// Smart version check: only copy section if version changed
		srcSecYAML := filepath.Join(srcSecDir, "section.yaml")
		dstSecYAML := filepath.Join(dstSecDir, "section.yaml")
		if getLocalYAMLVersion(srcSecYAML) != getLocalYAMLVersion(dstSecYAML) {
			os.MkdirAll(dstSecDir, 0755)
			for _, fname := range []string{"section.yaml", "content.md"} {
				if data, err := os.ReadFile(filepath.Join(srcSecDir, fname)); err == nil {
					os.WriteFile(filepath.Join(dstSecDir, fname), data, 0644)
				}
			}
		}

		// Sync labs inside this section.
		srcLabsDir := filepath.Join(srcSecDir, "labs")
		labs, err := os.ReadDir(srcLabsDir)
		if err != nil {
			continue
		}
		for _, l := range labs {
			if !l.IsDir() {
				continue
			}
			if targetLab != "" && l.Name() != targetLab {
				continue
			}

			// Smart version check: only copy lab files if version changed
			srcLabYAML := filepath.Join(srcLabsDir, l.Name(), "lab.yaml")
			dstLabYAML := filepath.Join(challengesDir, moduleID, "sections", sec.Name(), "labs", l.Name(), "lab.yaml")
			needSync := getLocalYAMLVersion(srcLabYAML) != getLocalYAMLVersion(dstLabYAML)
			if !needSync {
				// If versions match, verify if the validator script was modified locally
				srcValPath := filepath.Join(srcLabsDir, l.Name(), "validator.sh")
				if _, err := os.Stat(srcValPath); os.IsNotExist(err) {
					srcValPath = filepath.Join(srcLabsDir, l.Name(), "validator.py")
				}
				dstValPath := filepath.Join(challengesDir, moduleID, "sections", sec.Name(), "labs", l.Name(), "validator.sh")
				if _, err := os.Stat(dstValPath); os.IsNotExist(err) {
					dstValPath = filepath.Join(challengesDir, moduleID, "sections", sec.Name(), "labs", l.Name(), "validator.py")
				}

				srcHash, _ := validator.Sha256Sum(srcValPath)
				dstHash, _ := validator.Sha256Sum(dstValPath)
				if srcHash != "" && srcHash != dstHash {
					needSync = true
				}
			}
			if needSync {
				syncLabFiles(moduleID, sec.Name(), l.Name(), challengesDir)
			}
		}
	}
}

func syncLabFiles(moduleID, sectionID, labID, challengesDir string) {
	srcDir := filepath.Join("challenges", moduleID, "sections", sectionID, "labs", labID)
	dstDir := filepath.Join(challengesDir, moduleID, "sections", sectionID, "labs", labID)
	os.MkdirAll(dstDir, 0755)

	entries, err := os.ReadDir(srcDir)
	if err != nil {
		return
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		fname := e.Name()
		if data, err := os.ReadFile(filepath.Join(srcDir, fname)); err == nil {
			info, _ := e.Info()
			os.WriteFile(filepath.Join(dstDir, fname), data, info.Mode())
		}
	}
}

func syncFromAPI(apiBaseURL, challengesDir, targetModule string) error {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(apiBaseURL + "/modules")
	if err != nil {
		return fmt.Errorf("API unreachable: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	if len(body) > 0 && body[0] == '<' {
		return fmt.Errorf("port %s is taken by another service (got HTML, not our API)", apiBaseURL)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var mr modulesResponse
	if err := json.Unmarshal(body, &mr); err != nil {
		return fmt.Errorf("API response not recognised: %w", err)
	}

	if len(mr.Modules) == 0 {
		fmt.Println("No modules returned from API.")
		return nil
	}

	count := 0
	for _, m := range mr.Modules {
		if targetModule != "" && m.ID != targetModule {
			continue
		}
		data, err := json.MarshalIndent(m, "", "  ")
		if err != nil {
			fmt.Fprintf(os.Stderr, "warn: failed to marshal %s: %v\n", m.ID, err)
			continue
		}
		if err := cache.SaveModuleJSON(challengesDir, m.ID, data); err != nil {
			fmt.Fprintf(os.Stderr, "warn: failed to save %s: %v\n", m.ID, err)
			continue
		}
		syncLocalSections(m.ID, challengesDir, "", "")
		fmt.Printf("  ✓ %s\n", m.ID)
		count++
	}

	fmt.Printf("\nSynced %d module(s) to %s\n", count, challengesDir)
	return nil
}

// --- Smart Syncing Helpers ---

func parseYAMLVersion(data []byte) int {
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		// must be root level indentation
		if len(line) > 0 && (line[0] == ' ' || line[0] == '\t') {
			continue
		}
		idx := strings.Index(trimmed, ":")
		if idx == -1 {
			continue
		}
		key := strings.TrimSpace(trimmed[:idx])
		val := strings.TrimSpace(trimmed[idx+1:])
		if key == "version" {
			v, _ := strconv.Atoi(val)
			return v
		}
	}
	return 1
}

func getLocalYAMLVersion(path string) int {
	data, err := os.ReadFile(path)
	if err != nil {
		return 0 // force sync if file does not exist
	}
	return parseYAMLVersion(data)
}

func readZipFileContents(file *zip.File) ([]byte, error) {
	rc, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer rc.Close()
	return io.ReadAll(rc)
}

func shouldExtractFile(file *zip.File, relParts []string, challengesDir string, zipModuleVersions, zipSectionVersions, zipLabVersions map[string]int) bool {
	if len(relParts) == 0 {
		return false
	}
	moduleID := relParts[0]

	// 1. Is it a lab file?
	if len(relParts) >= 5 && relParts[1] == "sections" && relParts[3] == "labs" {
		labID := relParts[4]
		sectionID := relParts[2]
		labKey := fmt.Sprintf("%s/sections/%s/labs/%s", moduleID, sectionID, labID)
		localLabYAMLPath := filepath.Join(challengesDir, moduleID, "sections", sectionID, "labs", labID, "lab.yaml")
		zipVer := zipLabVersions[labKey]
		if zipVer == 0 {
			zipVer = 1
		}
		localVer := getLocalYAMLVersion(localLabYAMLPath)

		// If it's the validator file, verify its integrity hash
		if len(relParts) == 6 && (relParts[5] == "validator.sh" || relParts[5] == "validator.py") {
			localValPath := filepath.Join(challengesDir, moduleID, "sections", sectionID, "labs", labID, relParts[5])
			if _, err := os.Stat(localValPath); os.IsNotExist(err) {
				return true // missing, must extract
			}
			zipData, err := readZipFileContents(file)
			if err == nil {
				// Normalize CRLF to LF and trim
				normalizedZip := strings.ReplaceAll(string(zipData), "\r\n", "\n")
				normalizedZip = strings.TrimRightFunc(normalizedZip, func(r rune) bool {
					return r == '\n' || r == '\r' || r == ' ' || r == '\t'
				})
				hZip := sha256.New()
				hZip.Write([]byte(normalizedZip))
				zipHash := hex.EncodeToString(hZip.Sum(nil))

				localHash, err := validator.Sha256Sum(localValPath)
				if err != nil || localHash != zipHash {
					return true // hash mismatch, force extract
				}
			}
		}

		return zipVer != localVer
	}

	// 2. Is it a section file?
	if len(relParts) >= 3 && relParts[1] == "sections" {
		sectionID := relParts[2]
		sectionKey := fmt.Sprintf("%s/sections/%s", moduleID, sectionID)
		localSecYAMLPath := filepath.Join(challengesDir, moduleID, "sections", sectionID, "section.yaml")
		zipVer := zipSectionVersions[sectionKey]
		if zipVer == 0 {
			zipVer = 1
		}
		localVer := getLocalYAMLVersion(localSecYAMLPath)
		return zipVer != localVer
	}

	// 3. Is it a module level file?
	localModYAMLPath := filepath.Join(challengesDir, moduleID, "module.yaml")
	zipVer := zipModuleVersions[moduleID]
	if zipVer == 0 {
		zipVer = 1
	}
	localVer := getLocalYAMLVersion(localModYAMLPath)
	return zipVer != localVer
}