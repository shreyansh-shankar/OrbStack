// cmd/root.go
package cmd

import (
	"fmt"
	"os"
)

func Execute() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(0)
	}

	switch os.Args[1] {
	case "sync":
		if err := runSync(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "sync:", err)
			os.Exit(1)
		}
	case "start":
		if err := runStart(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "start:", err)
			os.Exit(1)
		}
	case "stop":
		if err := runStop(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "stop:", err)
			os.Exit(1)
		}
	case "check":
		if err := runCheck(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "check:", err)
			os.Exit(1)
		}
	case "status":
		if err := runStatus(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "status:", err)
			os.Exit(1)
		}
	case "login":
		if err := runLogin(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "login:", err)
			os.Exit(1)
		}
	case "logout":
		if err := runLogout(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "logout:", err)
			os.Exit(1)
		}
	case "publish":
		if err := runPublish(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "publish:", err)
			os.Exit(1)
		}
	case "doctor":
		if err := runDoctor(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, "doctor:", err)
			os.Exit(1)
		}
	case "help", "--help", "-h":
		printUsage()
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n", os.Args[1])
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("\x1b[1;36m" + ` _________  ___       ________     
|\___   ___\\  \     |\   ___ \    
\|___ \  \_\ \  \    \ \  \_|\ \   
     \ \  \ \ \  \    \ \  \ \\ \  
      \ \  \ \ \  \____\ \  \_| \ \ 
       \ \__\ \ \_______\ \_______\
        \|__|  \|_______|\|_______|

    T H E   L A S T   D E P L O Y` + "\x1b[0m")
	fmt.Println(`The Last Deploy — local DevOps practice platform

Usage:
  tld <command> [args]

Commands:
  sync --all            Download all modules and labs
  sync -m <module-id>   Sync a specific module
  sync -l <lab-id>      Sync a specific lab
  start <lab-id>        Start a lab environment (non-blocking)
  stop                  Stop the running lab and local server
  check                 Run the validator and report pass/fail
  status                Show auth, synced content, and active lab
  login                 Authenticate with The Last Deploy API
  logout                Remove saved credentials
  publish <folder-path> Publish a local module directory to the builder API
  doctor                Check if your system is ready to run TLD labs
  help                  Show this help message`)
}
