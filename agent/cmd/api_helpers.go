// agent/cmd/api_helpers.go
package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// postJSONRequest sends a JSON POST request to the API with authorization headers and timeout.
// It returns error, shouldRetry boolean, and decoded response JSON body map if available.
func postJSONRequest(apiBaseURL, endpoint, authToken string, payload interface{}, timeout time.Duration) (error, bool, map[string]interface{}) {
	data, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return err, false, nil
	}

	client := &http.Client{Timeout: timeout}
	req, err := http.NewRequest(http.MethodPost, apiBaseURL+endpoint, bytes.NewReader(data))
	if err != nil {
		return err, false, nil
	}

	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", "Bearer "+authToken)
	}

	resp, err := client.Do(req)
	if err != nil {
		return err, true, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		retry := resp.StatusCode >= 500 || resp.StatusCode == http.StatusRequestTimeout || resp.StatusCode == http.StatusTooManyRequests
		return fmt.Errorf("API returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body))), retry, nil
	}

	var respBody map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&respBody)

	return nil, false, respBody
}
