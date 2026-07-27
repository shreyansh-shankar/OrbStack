// cmd/doctor.go
package cmd

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/thelastdeploy/agent/internal/cache"
	"github.com/thelastdeploy/agent/internal/config"
)

// ── ANSI colours ─────────────────────────────────────────────────────────────

const (
	colorReset  = "\x1b[0m"
	colorGreen  = "\x1b[32m"
	colorYellow = "\x1b[33m"
	colorRed    = "\x1b[31m"
	colorBold   = "\x1b[1m"
	colorDim    = "\x1b[2m"
	colorCyan   = "\x1b[36m"
)

// ── Check result ──────────────────────────────────────────────────────────────

type checkStatus int

const (
	statusOK      checkStatus = iota
	statusWarning             // ⚠️  non-blocking
	statusError               // ❌ would cause a lab to fail
)

type checkResult struct {
	label  string
	status checkStatus
	detail string // shown inline after the icon
	hint   string // fix suggestion on a second line, if any
}

func ok(label, detail string) checkResult {
	return checkResult{label: label, status: statusOK, detail: detail}
}

func warn(label, detail, hint string) checkResult {
	return checkResult{label: label, status: statusWarning, detail: detail, hint: hint}
}

func fail(label, detail, hint string) checkResult {
	return checkResult{label: label, status: statusError, detail: detail, hint: hint}
}

// ── Entry point ───────────────────────────────────────────────────────────────

func runDoctor(_ []string) error {
	fmt.Println()
	fmt.Printf("%s%s tld doctor%s\n", colorBold, colorCyan, colorReset)
	fmt.Printf("%sChecking if your system is ready to run TLD labs...%s\n\n", colorDim, colorReset)

	cfg, cfgErr := config.Load()

	var results []checkResult

	// ── Section 1: System tools ───────────────────────────────────────────────
	printSection("System Requirements")
	results = append(results,
		checkDocker(),
		checkBash(),
		checkPython3(),
		checkKind(),
		checkKubectl(),
	)
	printResults(results)
	results = results[:0]

	// ── Section 2: TLD setup ──────────────────────────────────────────────────
	fmt.Println()
	printSection("TLD Setup")
	if cfgErr != nil {
		results = append(results,
			fail("Config file", "could not load ~/.tld/config.yaml",
				"Try reinstalling tld or run any tld command to regenerate it."),
		)
	} else {
		results = append(results,
			checkConfig(cfg),
			checkLabsSynced(cfg),
			checkAuth(cfg),
		)
	}
	printResults(results)
	results = results[:0]

	// ── Section 3: Connectivity ───────────────────────────────────────────────
	fmt.Println()
	printSection("Connectivity")
	if cfg != nil {
		results = append(results,
			checkAPI(cfg.APIBaseURL),
			checkGitHub(),
		)
	} else {
		results = append(results,
			warn("TLD API", "skipped (config unavailable)", ""),
			warn("GitHub", "skipped (config unavailable)", ""),
		)
	}
	printResults(results)

	// ── Summary ───────────────────────────────────────────────────────────────
	fmt.Println()
	printSummary()
	return nil
}

// ── Individual checks ─────────────────────────────────────────────────────────

func checkDocker() checkResult {
	path, err := exec.LookPath("docker")
	if err != nil {
		return fail("Docker", "not installed",
			"Install Docker Desktop: https://docs.docker.com/get-docker/")
	}
	// Check if the daemon is actually running
	if err := exec.Command("docker", "info").Run(); err != nil {
		return warn("Docker", fmt.Sprintf("installed (%s) but daemon is not running", path),
			"Start Docker Desktop before running docker-type labs.")
	}
	version := dockerVersion()
	return ok("Docker", fmt.Sprintf("running%s", version))
}

func dockerVersion() string {
	out, err := exec.Command("docker", "version", "--format", "{{.Client.Version}}").Output()
	if err != nil || len(out) == 0 {
		return ""
	}
	v := strings.TrimSpace(string(out))
	if v == "" {
		return ""
	}
	return fmt.Sprintf(" (v%s)", v)
}

func checkBash() checkResult {
	path, err := exec.LookPath("bash")
	if err != nil {
		return fail("bash", "not found in PATH",
			"bash is required to run shell validators. Install it via your package manager.")
	}
	return ok("bash", path)
}

func checkPython3() checkResult {
	path, err := exec.LookPath("python3")
	if err != nil {
		return warn("python3", "not installed",
			"Python labs won't work. Install Python 3: https://www.python.org/downloads/")
	}
	version := pythonVersion()
	return ok("python3", fmt.Sprintf("%s%s", path, version))
}

func pythonVersion() string {
	out, err := exec.Command("python3", "--version").Output()
	if err != nil {
		return ""
	}
	v := strings.TrimSpace(string(out))
	if strings.HasPrefix(v, "Python ") {
		return fmt.Sprintf(" (%s)", strings.TrimPrefix(v, "Python "))
	}
	return ""
}

func checkKind() checkResult {
	path, err := exec.LookPath("kind")
	if err != nil {
		return warn("kind", "not installed",
			"Kubernetes labs won't work. Install: brew install kind  or  https://kind.sigs.k8s.io")
	}
	return ok("kind", path)
}

func checkKubectl() checkResult {
	path, err := exec.LookPath("kubectl")
	if err != nil {
		return warn("kubectl", "not installed",
			"Needed to interact with Kubernetes labs. Install: https://kubernetes.io/docs/tasks/tools/")
	}
	return ok("kubectl", path)
}

func checkConfig(cfg *config.Config) checkResult {
	tldDir, err := config.TLDDir()
	if err != nil {
		return fail("Config file", "could not resolve ~/.tld directory", "")
	}
	cfgPath := filepath.Join(tldDir, "config.yaml")
	if _, err := os.Stat(cfgPath); os.IsNotExist(err) {
		return warn("Config file", "not found (will be created on next run)",
			"Run any tld command to generate it.")
	}
	return ok("Config file", cfgPath)
}

func checkLabsSynced(cfg *config.Config) checkResult {
	moduleCount, labCount := cache.CountAll(cfg.ChallengesDir)
	if moduleCount == 0 {
		return warn("Labs synced", "no content downloaded yet",
			"Run: tld sync --all")
	}
	return ok("Labs synced", fmt.Sprintf("%d module(s), %d lab(s)", moduleCount, labCount))
}

func checkAuth(cfg *config.Config) checkResult {
	if cfg.AuthToken == "" {
		return warn("Auth", "not logged in — completed labs won't earn XP",
			"Run: tld login")
	}
	return ok("Auth", "logged in")
}

func checkAPI(apiBaseURL string) checkResult {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(apiBaseURL + "/health")
	if err != nil {
		return warn("TLD API", fmt.Sprintf("unreachable (%s)", apiBaseURL),
			"Results will be queued offline and submitted next time you sync.")
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 500 {
		return warn("TLD API", fmt.Sprintf("returned HTTP %d", resp.StatusCode),
			"The API may be temporarily down. Results will be queued.")
	}
	return ok("TLD API", fmt.Sprintf("reachable (%s)", apiBaseURL))
}

func checkGitHub() checkResult {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get("https://github.com")
	if err != nil {
		return warn("GitHub", "unreachable",
			"'tld sync' will fall back to the API if GitHub is unavailable.")
	}
	defer resp.Body.Close()
	return ok("GitHub", "reachable")
}

// ── Rendering helpers ─────────────────────────────────────────────────────────

func printSection(title string) {
	fmt.Printf("%s%s%s\n", colorBold, title, colorReset)
}

var (
	totalWarnings int
	totalErrors   int
)

func printResults(results []checkResult) {
	// Measure the longest label for alignment
	labelWidth := 12
	for _, r := range results {
		if len(r.label) > labelWidth {
			labelWidth = len(r.label)
		}
	}

	for _, r := range results {
		var icon, color string
		switch r.status {
		case statusOK:
			icon = "✅"
			color = colorGreen
		case statusWarning:
			icon = "⚠️ "
			color = colorYellow
			totalWarnings++
		case statusError:
			icon = "❌"
			color = colorRed
			totalErrors++
		}

		padding := labelWidth - len(r.label)
		fmt.Printf("  %s  %s%s%s%*s  %s%s%s\n",
			icon,
			color, r.label, colorReset,
			padding, "",
			colorDim, r.detail, colorReset,
		)
		if r.hint != "" {
			// Indent the hint to align under the detail column
			fmt.Printf("         %*s  %s→ %s%s\n",
				labelWidth, "",
				colorDim, r.hint, colorReset,
			)
		}
	}
}

func printSummary() {
	fmt.Println(colorDim + "──────────────────────────────────────────────────────" + colorReset)

	if totalErrors == 0 && totalWarnings == 0 {
		fmt.Printf("%s✅  All checks passed. You're ready to run TLD labs!%s\n\n", colorGreen, colorReset)
	} else {
		if totalErrors > 0 {
			fmt.Printf("%s❌  %d error(s)%s", colorRed, totalErrors, colorReset)
			if totalWarnings > 0 {
				fmt.Printf(" and %s⚠️  %d warning(s)%s", colorYellow, totalWarnings, colorReset)
			}
		} else {
			fmt.Printf("%s⚠️  %d warning(s)%s", colorYellow, totalWarnings, colorReset)
		}
		fmt.Println(" found. Follow the hints above to fix them.\n")
	}

	// Reset so the function is safe to call multiple times (e.g. in tests)
	totalWarnings = 0
	totalErrors = 0
}
