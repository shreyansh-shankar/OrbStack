// cmd/status.go
package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"sort"
	"time"

	"github.com/thelastdeploy/agent/internal/cache"
	"github.com/thelastdeploy/agent/internal/config"
	"github.com/thelastdeploy/agent/internal/lab"
	"github.com/thelastdeploy/agent/internal/localserver"
	"github.com/thelastdeploy/agent/internal/queue"
)

func runStatus(args []string) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	tldDir := filepath.Dir(cfg.DeviceKeyPath)

	// ── Auth ─────────────────────────────────────────────────────────────
	fmt.Println()
	fmt.Println("● Auth")
	if cfg.AuthToken != "" {
		fmt.Println("  Authenticated: yes")
		if username := fetchUsername(cfg.APIBaseURL, cfg.AuthToken); username != "" {
			fmt.Printf("  Logged in as:  %s\n", username)
		}
		fmt.Println("  Run 'tld logout' to sign out.")
	} else {
		fmt.Println("  Not logged in — run: tld login")
		fmt.Println("  (Results submitted without login earn no XP.)")
	}

	// ── Synced content ───────────────────────────────────────────────────
	fmt.Println()
	moduleCount, labCount := cache.CountAll(cfg.ChallengesDir)
	fmt.Println("● Synced content")
	fmt.Printf("  Modules: %d\n", moduleCount)
	fmt.Printf("  Labs:    %d\n", labCount)

	if moduleCount > 0 {
		fmt.Println()
		printModuleTree(cfg.ChallengesDir)
	}

	// ── Active lab session ───────────────────────────────────────────────
	fmt.Println()
	session, err := lab.ReadSession()
	if err != nil {
		fmt.Println("● Active lab")
		fmt.Println("  None — run 'tld start <lab-id>' to begin.")
	} else {
		elapsed := time.Since(session.StartedAt).Round(time.Second)
		fmt.Println("● Active lab")
		fmt.Printf("  Lab:       %s\n", session.LabID)
		fmt.Printf("  Module:    %s\n", session.ModuleID)
		fmt.Printf("  Section:   %s\n", session.SectionID)
		fmt.Printf("  Started:   %s\n", session.StartedAt.Format("15:04:05"))
		fmt.Printf("  Elapsed:   %s\n", elapsed)
		fmt.Printf("  Type:      %s\n", session.SetupType)
		if session.ContainerID != "" {
			fmt.Printf("  Container: %s\n", session.ContainerID[:12])
		}
		if localserver.IsRunning() {
			fmt.Printf("  API server: http://127.0.0.1:7842 ✓\n")
		} else {
			fmt.Printf("  API server: not running\n")
		}
	}

	// ── Queued results ───────────────────────────────────────────────────
	pending := queue.Count(tldDir)
	if pending > 0 {
		fmt.Printf("\n● Queued results: %d (run 'tld sync --all' to submit)\n", pending)
	}

	fmt.Println()
	return nil
}

// fetchUsername calls /cli/me to get the logged-in username.
// Returns empty string silently if offline or on any error.
func fetchUsername(apiBaseURL, token string) string {
	client := &http.Client{Timeout: 4 * time.Second}
	req, err := http.NewRequest(http.MethodGet, apiBaseURL+"/cli/me", nil)
	if err != nil {
		return ""
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return ""
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ""
	}

	var me struct {
		Username string `json:"username"`
	}
	if err := json.Unmarshal(body, &me); err != nil {
		return ""
	}
	return me.Username
}

// trackEntry holds a track name and all its modules.
type trackEntry struct {
	name    string
	modules []*cache.Module
}

// printModuleTree groups modules by topic and prints them as a tree.
func printModuleTree(baseDir string) {
	ids, _ := cache.ListModules(baseDir)

	// Group by topic (track)
	trackMap := make(map[string][]*cache.Module)
	for _, id := range ids {
		m, err := cache.LoadModule(baseDir, id)
		if err != nil {
			continue
		}
		topic := m.Topic
		if topic == "" {
			topic = "Other"
		}
		trackMap[topic] = append(trackMap[topic], m)
	}

	// Sorted track names
	trackNames := make([]string, 0, len(trackMap))
	for t := range trackMap {
		trackNames = append(trackNames, t)
	}
	sort.Strings(trackNames)

	fmt.Println("● Tracks")

	for ti, trackName := range trackNames {
		modules := trackMap[trackName]
		sort.Slice(modules, func(i, j int) bool {
			return modules[i].ID < modules[j].ID
		})

		isLastTrack := ti == len(trackNames)-1
		trackPrefix := "├─"
		trackContinue := "│  "
		if isLastTrack {
			trackPrefix = "└─"
			trackContinue = "   "
		}

		totalLabs := 0
		for _, m := range modules {
			labs, _ := cache.LoadLabsForModule(baseDir, m.ID)
			totalLabs += len(labs)
		}

		fmt.Printf("  %s %s  (%d module(s), %d lab(s))\n",
			trackPrefix, trackName, len(modules), totalLabs)

		for mi, m := range modules {
			labs, _ := cache.LoadLabsForModule(baseDir, m.ID)

			isLastModule := mi == len(modules)-1
			modPrefix := trackContinue + "├─"
			modContinue := trackContinue + "│  "
			if isLastModule {
				modPrefix = trackContinue + "└─"
				modContinue = trackContinue + "   "
			}

			fmt.Printf("  %s %s  (%d lab(s))\n", modPrefix, m.ID, len(labs))

			for li, l := range labs {
				isLastLab := li == len(labs)-1
				labPrefix := modContinue + "├─"
				if isLastLab {
					labPrefix = modContinue + "└─"
				}
				title := l.Title
				if title == "" {
					title = l.ID
				} else {
					// truncate long titles
					if len(title) > 48 {
						title = title[:45] + "..."
					}
					title = fmt.Sprintf("%s  [%s]", l.ID, title)
				}
				fmt.Printf("  %s %s\n", labPrefix, title)
			}
		}
	}
}
