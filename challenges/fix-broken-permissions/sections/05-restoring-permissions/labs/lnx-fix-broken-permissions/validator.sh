#!/bin/bash
set -euo pipefail

if [ ! -r /var/log/app-server.log ]; then
  echo "FAIL: /var/log/app-server.log is not readable. Run: sudo chmod 644 /var/log/app-server.log"
  exit 1
fi

echo "PASS: Restored readable permissions on /var/log/app-server.log!"
exit 0
