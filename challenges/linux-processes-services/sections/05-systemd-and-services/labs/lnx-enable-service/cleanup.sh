#!/bin/bash
# Auto-generated cleanup script

echo "Stopping and disabling user service thelastdeploy-user..."
systemctl --user stop thelastdeploy-user.service || true
systemctl --user disable thelastdeploy-user.service || true
rm -f "$HOME/.config/systemd/user/thelastdeploy-user.service"
systemctl --user daemon-reload

echo "Cleanup completed!"
