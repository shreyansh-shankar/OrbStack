#!/bin/bash
# validator.sh — linux-processes-services / 05-systemd-and-services / lnx-enable-service
set -euo pipefail

# Check if service is enabled
if ! systemctl --user is-enabled thelastdeploy-user.service &>/dev/null; then
  echo "FAIL: The user-level service 'thelastdeploy-user.service' is not enabled."
  exit 1
fi

echo "PASS: User-level service enabled successfully."
exit 0
