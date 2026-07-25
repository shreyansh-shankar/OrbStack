// internal/cache/challenge.go
package cache

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type Module struct {
	ID               string
	Title            string
	Description      string
	Topic            string
	Difficulty       string
	EstimatedMinutes int
	Sections         []SectionRef
	Version          int
}

type SectionRef struct {
	ID    string
	Order int
}

type Section struct {
	ID      string
	Title   string
	Order   int
	Version int
}

type Lab struct {
	ID            string
	Title         string
	SectionID     string
	ModuleID      string
	SetupType     string
	SeedCommands  []string
	XP            int
	EstimatedMins int
	ResourcesCPU  int
	ResourcesMem  int
	ValidatorPath string
	Version       int
}

type moduleJSONFile struct {
	ID               string   `json:"id"`
	Title            string   `json:"title"`
	Description      string   `json:"description"`
	Topic            string   `json:"topic"`
	Difficulty       string   `json:"difficulty"`
	EstimatedMinutes int      `json:"estimated_minutes"`
	Tags             []string `json:"tags"`
	TotalXP          int      `json:"total_xp"`
	TotalSections    int      `json:"total_sections"`
	Version          int      `json:"version"`
}

type labJSONFile struct {
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	SetupType     string   `json:"setup_type"`
	SeedCommands  []string `json:"seed_commands"`
	XP            int      `json:"xp"`
	EstimatedMins int      `json:"estimated_minutes"`
	ResourcesCPU  int      `json:"resource_limits_cpu"`
	ResourcesMem  int      `json:"resource_limits_mem"`
	Version       int      `json:"version"`
}

func LoadModule(baseDir, moduleID string) (*Module, error) {
	moduleDir := filepath.Join(baseDir, moduleID)
	jsonPath := filepath.Join(moduleDir, "module.json")
	yamlPath := filepath.Join(moduleDir, "module.yaml")
	if _, err := os.Stat(jsonPath); err == nil {
		return parseModuleJSON(jsonPath)
	}
	return ParseModuleYAML(yamlPath)
}

func ListModules(baseDir string) ([]string, error) {
	entries, err := os.ReadDir(baseDir)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var ids []string
	for _, e := range entries {
		if e.IsDir() {
			ids = append(ids, e.Name())
		}
	}
	return ids, nil
}

func FindLab(baseDir, labID string) (*Lab, error) {
	modules, err := ListModules(baseDir)
	if err != nil {
		return nil, err
	}
	for _, modID := range modules {
		sectionsDir := filepath.Join(baseDir, modID, "sections")
		sections, err := os.ReadDir(sectionsDir)
		if err != nil {
			continue
		}
		for _, sec := range sections {
			if !sec.IsDir() {
				continue
			}
			labsDir := filepath.Join(sectionsDir, sec.Name(), "labs")
			labs, err := os.ReadDir(labsDir)
			if err != nil {
				continue
			}
			for _, l := range labs {
				if !l.IsDir() {
					continue
				}
				if l.Name() == labID {
					return loadLab(baseDir, modID, sec.Name(), labID)
				}
			}
		}
	}
	return nil, fmt.Errorf("lab '%s' not found — run 'tld sync' first", labID)
}

func LoadLabsForModule(baseDir, moduleID string) ([]*Lab, error) {
	sectionsDir := filepath.Join(baseDir, moduleID, "sections")
	sections, err := os.ReadDir(sectionsDir)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var labs []*Lab
	for _, sec := range sections {
		if !sec.IsDir() {
			continue
		}
		ls, err := LoadLabsForSection(baseDir, moduleID, sec.Name())
		if err != nil {
			continue
		}
		labs = append(labs, ls...)
	}
	return labs, nil
}

func LoadLabsForSection(baseDir, moduleID, sectionID string) ([]*Lab, error) {
	labsDir := filepath.Join(baseDir, moduleID, "sections", sectionID, "labs")
	entries, err := os.ReadDir(labsDir)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var labs []*Lab
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		lab, err := loadLab(baseDir, moduleID, sectionID, e.Name())
		if err != nil {
			fmt.Fprintf(os.Stderr, "warn: skipping lab %s: %v\n", e.Name(), err)
			continue
		}
		labs = append(labs, lab)
	}
	return labs, nil
}

func CountAll(baseDir string) (int, int) {
	modules, _ := ListModules(baseDir)
	totalLabs := 0
	for _, modID := range modules {
		labs, _ := LoadLabsForModule(baseDir, modID)
		totalLabs += len(labs)
	}
	return len(modules), totalLabs
}

func loadLab(baseDir, moduleID, sectionID, labID string) (*Lab, error) {
	labDir := filepath.Join(baseDir, moduleID, "sections", sectionID, "labs", labID)
	jsonPath := filepath.Join(labDir, "lab.json")
	yamlPath := filepath.Join(labDir, "lab.yaml")

	var lab *Lab
	if _, err := os.Stat(jsonPath); err == nil {
		l, err := parseLabJSON(jsonPath)
		if err != nil {
			return nil, err
		}
		lab = l
	} else {
		l, err := parseLabYAML(yamlPath)
		if err != nil {
			return nil, err
		}
		lab = l
	}

	lab.ID = labID
	lab.SectionID = sectionID
	lab.ModuleID = moduleID
	if lab.SetupType == "" {
		lab.SetupType = "shell"
	}
	if lab.ResourcesCPU == 0 {
		lab.ResourcesCPU = 1
	}
	if lab.ResourcesMem == 0 {
		lab.ResourcesMem = 512
	}
	shPath := filepath.Join(labDir, "validator.sh")
	pyPath := filepath.Join(labDir, "validator.py")
	if _, err := os.Stat(pyPath); err == nil {
		lab.ValidatorPath = pyPath
	} else {
		lab.ValidatorPath = shPath
	}
	return lab, nil
}

func SaveModuleJSON(baseDir, id string, data []byte) error {
	moduleDir := filepath.Join(baseDir, id)
	if err := os.MkdirAll(moduleDir, 0755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(moduleDir, "module.json"), data, 0644)
}

func SaveRaw(baseDir, id string, data []byte) error {
	moduleDir := filepath.Join(baseDir, id)
	if err := os.MkdirAll(moduleDir, 0755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(moduleDir, "module.yaml"), data, 0644)
}

func SaveLabJSON(baseDir, moduleID, sectionID, labID string, data []byte) error {
	labDir := filepath.Join(baseDir, moduleID, "sections", sectionID, "labs", labID)
	if err := os.MkdirAll(labDir, 0755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(labDir, "lab.json"), data, 0644)
}

func parseModuleJSON(path string) (*Module, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", path, err)
	}
	var jf moduleJSONFile
	if err := json.Unmarshal(data, &jf); err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}
	if jf.ID == "" {
		return nil, fmt.Errorf("module.json missing required field: id")
	}
	return &Module{
		ID:               jf.ID,
		Title:            jf.Title,
		Description:      jf.Description,
		Topic:            jf.Topic,
		Difficulty:       jf.Difficulty,
		EstimatedMinutes: jf.EstimatedMinutes,
		Version:          jf.Version,
	}, nil
}

func parseLabJSON(path string) (*Lab, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", path, err)
	}
	var jf labJSONFile
	if err := json.Unmarshal(data, &jf); err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}
	return &Lab{
		ID:            jf.ID,
		Title:         jf.Title,
		SetupType:     jf.SetupType,
		SeedCommands:  jf.SeedCommands,
		XP:            jf.XP,
		EstimatedMins: jf.EstimatedMins,
		ResourcesCPU:  jf.ResourcesCPU,
		ResourcesMem:  jf.ResourcesMem,
		Version:       jf.Version,
	}, nil
}

func ParseModuleYAML(path string) (*Module, error) {
	lines, err := readLines(path)
	if err != nil {
		return nil, err
	}
	m := &Module{}
	var inSections bool
	var currentSection *SectionRef

	for _, raw := range lines {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		indent := countIndent(raw)
		if indent == 0 {
			inSections = false
			if currentSection != nil {
				m.Sections = append(m.Sections, *currentSection)
				currentSection = nil
			}
		}
		key, val := splitKV(trimmed)
		switch {
		case indent == 0 && key == "id":
			m.ID = val
		case indent == 0 && key == "title":
			m.Title = unquote(val)
		case indent == 0 && key == "description":
			m.Description = unquote(val)
		case indent == 0 && key == "topic":
			m.Topic = val
		case indent == 0 && key == "difficulty":
			m.Difficulty = val
		case indent == 0 && key == "estimated_minutes":
			m.EstimatedMinutes, _ = strconv.Atoi(val)
		case indent == 0 && key == "version":
			m.Version, _ = strconv.Atoi(val)
		case indent == 0 && key == "sections":
			inSections = true
		case inSections && indent == 2 && strings.HasPrefix(trimmed, "- "):
			if currentSection != nil {
				m.Sections = append(m.Sections, *currentSection)
			}
			currentSection = &SectionRef{}
			rest := strings.TrimPrefix(trimmed, "- ")
			k2, v2 := splitKV(rest)
			setSectionRefField(currentSection, k2, v2)
		case inSections && indent == 4 && currentSection != nil:
			k2, v2 := splitKV(trimmed)
			setSectionRefField(currentSection, k2, v2)
		}
	}
	if currentSection != nil {
		m.Sections = append(m.Sections, *currentSection)
	}
	if m.ID == "" {
		return nil, fmt.Errorf("module.yaml missing required field: id")
	}
	return m, nil
}

func parseLabYAML(path string) (*Lab, error) {
	lines, err := readLines(path)
	if err != nil {
		return nil, err
	}
	lab := &Lab{}
	var inSetup, inSeedCmds bool

	for _, raw := range lines {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		indent := countIndent(raw)
		if indent == 0 {
			inSetup = false
			inSeedCmds = false
		}
		key, val := splitKV(trimmed)
		switch {
		case indent == 0 && key == "id":
			lab.ID = val
		case indent == 0 && key == "title":
			lab.Title = unquote(val)
		case indent == 0 && key == "xp":
			lab.XP, _ = strconv.Atoi(val)
		case indent == 0 && key == "estimated_minutes":
			lab.EstimatedMins, _ = strconv.Atoi(val)
		case indent == 0 && key == "version":
			lab.Version, _ = strconv.Atoi(val)
		case indent == 0 && key == "setup":
			inSetup = true
		case inSetup && indent == 2 && key == "type":
			lab.SetupType = val
		case inSetup && indent == 2 && key == "resource_limits_cpu":
			lab.ResourcesCPU, _ = strconv.Atoi(val)
		case inSetup && indent == 2 && key == "resource_limits_mem":
			lab.ResourcesMem, _ = strconv.Atoi(val)
		case inSetup && indent == 2 && key == "seed_commands":
			inSeedCmds = true
		case inSeedCmds && indent == 4 && strings.HasPrefix(trimmed, "- "):
			lab.SeedCommands = append(lab.SeedCommands, unquote(strings.TrimPrefix(trimmed, "- ")))
		}
	}
	if lab.ID == "" {
		return nil, fmt.Errorf("lab.yaml missing required field: id")
	}
	return lab, nil
}

func ParseSectionYAML(path string) (*Section, error) {
	lines, err := readLines(path)
	if err != nil {
		return nil, err
	}
	s := &Section{}
	for _, raw := range lines {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		if countIndent(raw) != 0 {
			continue
		}
		key, val := splitKV(trimmed)
		switch key {
		case "id":
			s.ID = val
		case "title":
			s.Title = unquote(val)
		case "order":
			s.Order, _ = strconv.Atoi(val)
		case "version":
			s.Version, _ = strconv.Atoi(val)
		}
	}
	if s.ID == "" {
		return nil, fmt.Errorf("section.yaml missing required field: id")
	}
	return s, nil
}

func readLines(path string) ([]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open %s: %w", path, err)
	}
	defer f.Close()
	var lines []string
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		lines = append(lines, sc.Text())
	}
	return lines, sc.Err()
}

func setSectionRefField(s *SectionRef, key, val string) {
	switch key {
	case "id":
		s.ID = val
	case "order":
		s.Order, _ = strconv.Atoi(val)
	}
}

func countIndent(s string) int {
	count := 0
	for _, ch := range s {
		if ch == ' ' {
			count++
		} else {
			break
		}
	}
	return count
}

func splitKV(s string) (string, string) {
	idx := strings.Index(s, ":")
	if idx == -1 {
		return s, ""
	}
	return strings.TrimSpace(s[:idx]), strings.TrimSpace(s[idx+1:])
}

func unquote(s string) string {
	s = strings.TrimSpace(s)
	if len(s) >= 2 {
		if (s[0] == '"' && s[len(s)-1] == '"') ||
			(s[0] == '\'' && s[len(s)-1] == '\'') {
			return s[1 : len(s)-1]
		}
	}
	return s
}

func IsModuleVerified(baseDir, moduleID string) bool {
	moduleDir := filepath.Join(baseDir, moduleID)
	jsonPath := filepath.Join(moduleDir, "module.json")
	if _, err := os.Stat(jsonPath); os.IsNotExist(err) {
		yamlPath := filepath.Join(moduleDir, "module.yaml")
		if _, err := os.Stat(yamlPath); err == nil {
			return true // local repository code module = verified by default
		}
		return false
	}

	bytes, err := os.ReadFile(jsonPath)
	if err != nil {
		return false
	}
	var info struct {
		IsOfficialVerified bool `json:"is_official_verified"`
	}
	if err := json.Unmarshal(bytes, &info); err != nil {
		return false
	}
	return info.IsOfficialVerified
}