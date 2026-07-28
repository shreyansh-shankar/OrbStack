#!/bin/bash
set -euo pipefail

if [ ! -f /tmp/checked_logs ]; then
  echo "FAIL: /tmp/checked_logs marker file not found. Run: touch /tmp/checked_logs"
  exit 1
fi

if [ -r /var/log/app-server.log ]; then
  echo "FAIL: /var/log/app-server.log should have broken (non-readable) permissions for this initial investigation lab."
  exit 1
fi

echo "PASS: Investigated broken log permissions successfully."
exit 0
