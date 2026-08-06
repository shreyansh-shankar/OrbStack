// internal/queue/queue.go
//
// File-based offline queue at ~/.tld/queue/
// Each file is one signed validator result that failed to POST to the API.
package queue

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// Entry is what we write to disk — a signed validator result keyed by lab_id.
type Entry struct {
	LabID         string    `json:"lab_id"`
	SectionID     string    `json:"section_id"`
	Passed        bool      `json:"passed"`
	Output        string    `json:"output"`
	RanAt         time.Time `json:"ran_at"`
	Signature     string    `json:"signature"`
	QueuedAt      time.Time `json:"queued_at"`
	ValidatorHash string    `json:"validator_hash"`
}

// Save writes an entry to ~/.tld/queue/<lab-id>-<unix>.json
func Save(tldDir string, e *Entry) error {
	dir := filepath.Join(tldDir, "queue")
	if err := os.MkdirAll(dir, 0700); err != nil {
		return fmt.Errorf("create queue dir: %w", err)
	}
	e.QueuedAt = time.Now()
	filename := fmt.Sprintf("%s-%d.json", e.LabID, e.QueuedAt.Unix())
	data, err := json.MarshalIndent(e, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal entry: %w", err)
	}
	return os.WriteFile(filepath.Join(dir, filename), data, 0600)
}

// LoadAll reads every pending entry from ~/.tld/queue/
func LoadAll(tldDir string) ([]*Entry, error) {
	dir := filepath.Join(tldDir, "queue")
	entries, err := os.ReadDir(dir)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("read queue dir: %w", err)
	}
	var out []*Entry
	for _, e := range entries {
		if e.IsDir() || filepath.Ext(e.Name()) != ".json" {
			continue
		}
		data, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			fmt.Fprintf(os.Stderr, "warn: skipping queue file %s: %v\n", e.Name(), err)
			continue
		}
		var entry Entry
		if err := json.Unmarshal(data, &entry); err != nil {
			fmt.Fprintf(os.Stderr, "warn: corrupt queue file %s: %v\n", e.Name(), err)
			continue
		}
		out = append(out, &entry)
	}
	return out, nil
}

// Delete removes a specific entry file after it has been successfully posted.
func Delete(tldDir, labID string, queuedAt time.Time) error {
	filename := fmt.Sprintf("%s-%d.json", labID, queuedAt.Unix())
	path := filepath.Join(tldDir, "queue", filename)
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("delete queue entry: %w", err)
	}
	return nil
}

// Count returns how many entries are pending.
func Count(tldDir string) int {
	entries, _ := LoadAll(tldDir)
	return len(entries)
}
