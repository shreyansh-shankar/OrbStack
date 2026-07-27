#!/bin/bash
# validator.sh — linux-processes-services / 07-debug-failed-service / lnx-recover-broken-web-service
set -euo pipefail

UNIT_FILE="$HOME/.config/systemd/user/thelastdeploy-broken.service"

if [ ! -f "$UNIT_FILE" ]; then
  echo "FAIL: Unit file $UNIT_FILE not found."
  exit 1
fi

# Check if unit file was corrected
if ! grep -q "ExecStart=/bin/sleep 3600" "$UNIT_FILE"; then
  echo "FAIL: The executable path in $UNIT_FILE has not been corrected to '/bin/sleep 3600'."
  exit 1
fi

# Check if service is active
if ! systemctl --user is-active thelastdeploy-broken.service &>/dev/null; then
  echo "FAIL: The user-level service 'thelastdeploy-broken.service' is not running."
  echo "Did you run 'systemctl --user daemon-reload' and start it?"
  exit 1
fi

echo "PASS: Failing service successfully debugged and running."
exit 0
