#!/bin/bash
# validator.sh — linux-processes-services / 05-systemd-and-services / lnx-start-service
set -euo pipefail

# Check if service is active
if ! systemctl --user is-active thelastdeploy-user.service &>/dev/null; then
  echo "FAIL: The user-level service 'thelastdeploy-user.service' is not active."
  exit 1
fi

echo "PASS: User-level service started successfully."
exit 0
