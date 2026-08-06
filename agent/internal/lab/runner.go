// internal/lab/runner.go
package lab

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/thelastdeploy/agent/internal/cache"
	"github.com/thelastdeploy/agent/internal/validator"
)

// Start sets up the lab environment. Non-blocking — returns immediately
// after writing session.json so the terminal stays free.
func Start(lab *cache.Lab) error {
	if SessionExists() {
		existing, _ := ReadSession()
		if existing != nil {
			return fmt.Errorf("lab '%s' is already running — run 'tld stop' first", existing.LabID)
		}
	}

	fmt.Printf("\n╔══════════════════════════════════════════════╗\n")
	fmt.Printf("║  The Last Deploy — Starting: %-16s║\n", truncate(lab.Title, 16))
	fmt.Printf("╚══════════════════════════════════════════════╝\n\n")

	session := &Session{
		LabID:         lab.ID,
		ModuleID:      lab.ModuleID,
		SectionID:     lab.SectionID,
		StartedAt:     time.Now(),
		ValidatorPath: lab.ValidatorPath,
		SetupType:     lab.SetupType,
	}

	switch lab.SetupType {
	case "shell", "":
		if err := runShellSetup(lab); err != nil {
			return err
		}
	case "docker":
		containerID, err := StartDocker(lab)
		if err != nil {
			return err
		}
		session.ContainerID = containerID
	case "kind":
		if err := StartKind(lab); err != nil {
			return err
		}
		if err := runShellSetup(lab); err != nil {
			return err
		}
	default:
		return fmt.Errorf("unknown setup type: %q (must be shell, docker, or kind)", lab.SetupType)
	}

	if _, err := os.Stat(session.ValidatorPath); err == nil {
		os.Chmod(session.ValidatorPath, 0755)
	}

	if err := WriteSession(session); err != nil {
		return fmt.Errorf("write session: %w", err)
	}

	printLab(lab)
	return nil
}

// Stop tears down the lab environment and clears the session.
func Stop() error {
	session, err := ReadSession()
	if err != nil {
		return err
	}

	fmt.Printf("Stopping lab: %s\n", session.LabID)
	elapsed := time.Since(session.StartedAt).Round(time.Second)
	fmt.Printf("Session duration: %s\n\n", elapsed)

	if session.ValidatorPath != "" {
		labDir := filepath.Dir(session.ValidatorPath)

		// 1. cleanup.sh
		cleanupSh := filepath.Join(labDir, "cleanup.sh")
		if _, err := os.Stat(cleanupSh); err == nil {
			fmt.Println("🧹 Running cleanup script (cleanup.sh)...")
			os.Chmod(cleanupSh, 0755)
			if err := runShellCommand(cleanupSh); err != nil {
				fmt.Fprintf(os.Stderr, "warn: cleanup.sh failed: %v\n", err)
			}
		}

		// 2. cleanup.py
		cleanupPy := filepath.Join(labDir, "cleanup.py")
		if _, err := os.Stat(cleanupPy); err == nil {
			fmt.Println("🧹 Running cleanup script (cleanup.py)...")
			os.Chmod(cleanupPy, 0755)
			pythonBin, err := validator.GetPythonInterpreter(labDir)
			if err != nil {
				fmt.Fprintf(os.Stderr, "warn: failed to get Python environment for cleanup: %v. Falling back to system python3.\n", err)
				pythonBin = "python3"
			}
			cmd := exec.Command(pythonBin, cleanupPy)
			cmd.Dir = labDir
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr
			if err := cmd.Run(); err != nil {
				fmt.Fprintf(os.Stderr, "warn: cleanup.py failed: %v\n", err)
			}
		}
	}

	switch session.SetupType {
	case "docker":
		if err := StopDocker(session.ContainerID); err != nil {
			fmt.Fprintf(os.Stderr, "warn: %v\n", err)
		}
	case "kind":
		if err := StopKind(session.LabID); err != nil {
			fmt.Fprintf(os.Stderr, "warn: %v\n", err)
		}
	}

	if err := ClearSession(); err != nil {
		return fmt.Errorf("clear session: %w", err)
	}

	fmt.Println("✓ Lab stopped. Environment cleaned up.")
	fmt.Println("  Run 'tld sync --all' to see available labs.")
	return nil
}

func runShellSetup(lab *cache.Lab) error {
	if len(lab.SeedCommands) == 0 {
		return nil
	}
	fmt.Println("⚙  Running setup commands...")
	for _, command := range lab.SeedCommands {
		if err := runShellCommand(command); err != nil {
			return fmt.Errorf("seed command failed [%s]: %w", command, err)
		}
	}
	fmt.Println()
	return nil
}

func runShellCommand(command string) error {
	fmt.Printf("  $ %s\n", command)
	cmd := exec.Command("bash", "-c", command)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func printLab(lab *cache.Lab) {
	fmt.Printf("📋 Lab:      %s\n", lab.Title)
	fmt.Printf("   ID:          %s\n", lab.ID)
	fmt.Printf("   Module:      %s\n", lab.ModuleID)
	fmt.Printf("   Section:     %s\n", lab.SectionID)
	fmt.Printf("   Type:        %s\n", lab.SetupType)
	fmt.Printf("   XP reward:   %d\n", lab.XP)
	fmt.Printf("   Est. time:   ~%d minutes\n\n", lab.EstimatedMins)
	fmt.Printf("──────────────────────────────────────────────\n")
	fmt.Printf("When you're done, run:  tld check\n")
	fmt.Printf("To stop the lab:        tld stop\n")
	fmt.Printf("──────────────────────────────────────────────\n\n")
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max-1] + "…"
}
