#!/bin/bash
set -euo pipefail

if [ ! -f /tmp/found_root_cause ]; then
  echo "FAIL: /tmp/found_root_cause marker file not found. Run: touch /tmp/found_root_cause"
  exit 1
fi

if [ -r /var/log/app-server.log ]; then
  echo "FAIL: Log file permissions should still be broken (000) during root cause identification."
  exit 1
fi

echo "PASS: Root cause identified successfully."
exit 0
