// cmd/version.go
package cmd

import (
	"fmt"
	"runtime"
)

var Version = "v1.1.0"

func runVersion(args []string) error {
	fmt.Printf("tld CLI %s (%s/%s)\n", Version, runtime.GOOS, runtime.GOARCH)
	return nil
}
