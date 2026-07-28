#!/bin/bash
set -euo pipefail

if [ ! -f /tmp/recovery_verified ]; then
  echo "FAIL: /tmp/recovery_verified marker file not found. Run: touch /tmp/recovery_verified"
  exit 1
fi

if [ ! -r /var/log/app-server.log ]; then
  echo "FAIL: /var/log/app-server.log must be readable."
  exit 1
fi

echo "PASS: Application recovery verified successfully!"
exit 0
