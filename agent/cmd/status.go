// cmd/status.go
package cmd

import (
	"fmt"
	"path/filepath"
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
	if cfg.AuthToken != "" {
		fmt.Println("● Auth")
		fmt.Println("  Authenticated: yes")
		fmt.Println("  Run 'tld logout' to sign out.")
	} else {
		fmt.Println("● Auth")
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
		modules, _ := cache.ListModules(cfg.ChallengesDir)
		for _, id := range modules {
			m, err := cache.LoadModule(cfg.ChallengesDir, id)
			if err != nil {
				continue
			}
			labs, _ := cache.LoadLabsForModule(cfg.ChallengesDir, id)
			fmt.Printf("  ├─ %s (%s) — %d lab(s)\n", m.ID, m.Title, len(labs))
		}
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
