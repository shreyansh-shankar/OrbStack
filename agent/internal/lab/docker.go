// internal/lab/docker.go
package lab

import (
	"fmt"
	"os/exec"
	"strings"

	"github.com/thelastdeploy/agent/internal/cache"
)

func StartDocker(lab *cache.Lab) (string, error) {
	if err := exec.Command("docker", "info").Run(); err != nil {
		return "", fmt.Errorf("docker is not running — please start Docker Desktop first")
	}
	args := buildDockerArgs(lab)
	detachArgs := append([]string{"run", "--detach"}, args...)
	outBytes, err := exec.Command("docker", detachArgs...).Output()
	if err != nil {
		return "", fmt.Errorf("docker run failed: %w", err)
	}
	containerID := strings.TrimSpace(string(outBytes))
	fmt.Printf("  ✓ Container started: %s\n", shortID(containerID))
	return containerID, nil
}

func StopDocker(containerID string) error {
	if containerID == "" {
		return nil
	}
	fmt.Printf("  Removing container %s...\n", shortID(containerID))
	out, err := exec.Command("docker", "rm", "-f", containerID).CombinedOutput()
	if err != nil {
		if strings.Contains(string(out), "No such container") {
			return nil
		}
		return fmt.Errorf("docker rm failed: %w\n%s", err, string(out))
	}
	return nil
}

func buildDockerArgs(lab *cache.Lab) []string {
	cpu := lab.ResourcesCPU
	mem := lab.ResourcesMem
	if cpu == 0 {
		cpu = 1
	}
	if mem == 0 {
		mem = 512
	}
	args := []string{
		fmt.Sprintf("--cpus=%.1f", float64(cpu)),
		fmt.Sprintf("--memory=%dm", mem),
		"--rm",
		"--name", "tld-" + lab.ID,
	}
	image := lab.ModuleID + ":latest"
	args = append(args, image)
	for _, cmd := range lab.SeedCommands {
		args = append(args, strings.Fields(cmd)...)
	}
	return args
}

func shortID(id string) string {
	if len(id) > 12 {
		return id[:12]
	}
	return id
}
