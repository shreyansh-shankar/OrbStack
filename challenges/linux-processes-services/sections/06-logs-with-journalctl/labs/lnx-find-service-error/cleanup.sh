#!/bin/bash
# Auto-generated cleanup script

echo "Stopping and disabling user service thelastdeploy-logger..."
systemctl --user stop thelastdeploy-logger.service || true
systemctl --user disable thelastdeploy-logger.service || true
rm -f "$HOME/.config/systemd/user/thelastdeploy-logger.service"
systemctl --user daemon-reload

echo "Removing directory $HOME/logs-test..."
rm -rf "$HOME/logs-test"

echo "Cleanup completed!"
