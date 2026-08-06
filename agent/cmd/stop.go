// cmd/stop.go
package cmd

import (
	"github.com/thelastdeploy/agent/internal/lab"
	"github.com/thelastdeploy/agent/internal/localserver"
)

func runStop(args []string) error {
	// Stop the lab environment (tears down docker/kind/shell, clears session).
	if err := lab.Stop(); err != nil {
		return err
	}
	// Shut down the background local server if it is running.
	localserver.Shutdown()
	return nil
}
