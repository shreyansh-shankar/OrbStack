// internal/lab/kind.go
package lab

import (
	"fmt"
	"os/exec"

	"github.com/thelastdeploy/agent/internal/cache"
)

func StartKind(lab *cache.Lab) error {
	if err := checkKindInstalled(); err != nil {
		return err
	}
	clusterName := "tld-" + lab.ID
	fmt.Printf("  Creating kind cluster: %s\n", clusterName)
	out, err := exec.Command("kind", "create", "cluster", "--name", clusterName).CombinedOutput()
	if err != nil {
		return fmt.Errorf("kind create cluster failed: %w\n%s", err, string(out))
	}
	fmt.Printf("  ✓ Cluster ready: %s\n", clusterName)
	fmt.Printf("  Run: kubectl cluster-info --context kind-%s\n", clusterName)
	return nil
}

func StopKind(labID string) error {
	if err := checkKindInstalled(); err != nil {
		return nil
	}
	clusterName := "tld-" + labID
	fmt.Printf("  Deleting kind cluster: %s\n", clusterName)
	out, err := exec.Command("kind", "delete", "cluster", "--name", clusterName).CombinedOutput()
	if err != nil {
		if isNotExistError(string(out)) {
			return nil
		}
		return fmt.Errorf("kind delete cluster failed: %w\n%s", err, string(out))
	}
	return nil
}

func checkKindInstalled() error {
	if _, err := exec.LookPath("kind"); err != nil {
		return fmt.Errorf(
			"'kind' is not installed\n" +
				"  Install it with: brew install kind\n" +
				"  Or: https://kind.sigs.k8s.io/docs/user/quick-start/#installation",
		)
	}
	return nil
}

func isNotExistError(output string) bool {
	return contains(output, "not found") || contains(output, "no kind clusters found")
}

func contains(s, sub string) bool {
	if len(sub) == 0 {
		return true
	}
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
