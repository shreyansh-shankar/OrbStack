// internal/localserver/server.go
//
// Security: binding to 127.0.0.1 means only reachable from this machine.
package localserver

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/thelastdeploy/agent/internal/lab"
	"github.com/thelastdeploy/agent/internal/validator"
)

const addr = "127.0.0.1:7842"

var (
	deviceKeyPath string
	shutdownOnce  sync.Once
	shutdownFn    context.CancelFunc
)

type Server struct {
	httpServer *http.Server
}

func New(keyPath string) *Server {
	deviceKeyPath = keyPath
	mux := http.NewServeMux()
	s := &Server{}
	mux.HandleFunc("/health", s.handleHealth)
	mux.HandleFunc("/status", s.handleStatus)
	mux.HandleFunc("/check", s.handleCheck)
	mux.HandleFunc("/session", s.handleSession)
	s.httpServer = &http.Server{
		Addr:         addr,
		Handler:      corsMiddleware(mux),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
	}
	return s
}

// StartBackground starts the server as a background process and blocks the
// calling goroutine until Shutdown() is called or the server errors.
// Call this inside a goroutine from cmd/start.go.
func (s *Server) StartBackground() error {
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("cannot bind %s: %w", addr, err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	shutdownFn = cancel

	errCh := make(chan error, 1)
	go func() {
		if err := s.httpServer.Serve(ln); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	select {
	case <-ctx.Done():
		shutCtx, c := context.WithTimeout(context.Background(), 3*time.Second)
		defer c()
		return s.httpServer.Shutdown(shutCtx)
	case err := <-errCh:
		return err
	}
}

// Shutdown signals the running background server to stop gracefully.
func Shutdown() {
	shutdownOnce.Do(func() {
		if shutdownFn != nil {
			shutdownFn()
		}
	})
}

// IsRunning checks if the local server is already accepting connections.
func IsRunning() bool {
	conn, err := net.DialTimeout("tcp", addr, 500*time.Millisecond)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"version": "1.0.0",
	})
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	session, err := lab.ReadSession()
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{"active": false})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"active":     true,
		"lab_id":     session.LabID,
		"module_id":  session.ModuleID,
		"section_id": session.SectionID,
		"started_at": session.StartedAt,
		"elapsed":    time.Since(session.StartedAt).Round(time.Second).String(),
		"setup_type": session.SetupType,
	})
}

func (s *Server) handleSession(w http.ResponseWriter, r *http.Request) {
	session, err := lab.ReadSession()
	if err != nil {
		writeError(w, http.StatusNotFound, "no active lab session")
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"lab_id":         session.LabID,
		"module_id":      session.ModuleID,
		"section_id":     session.SectionID,
		"validator_path": session.ValidatorPath,
		"started_at":     session.StartedAt,
	})
}

func (s *Server) handleCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "POST required")
		return
	}
	session, err := lab.ReadSession()
	if err != nil {
		writeError(w, http.StatusBadRequest, "no active lab session")
		return
	}
	result, err := validator.Run(session.LabID, session.SectionID, session.ValidatorPath, deviceKeyPath)
	if err != nil {
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("validator error: %v", err))
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"lab_id":     result.LabID,
		"section_id": result.SectionID,
		"passed":     result.Passed,
		"output":     result.Output,
		"ran_at":     result.RanAt,
		"signature":  result.Signature,
	})
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, o := range []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
			"https://thelastdeploy.sh",
		} {
			if origin == o {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
				break
			}
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}