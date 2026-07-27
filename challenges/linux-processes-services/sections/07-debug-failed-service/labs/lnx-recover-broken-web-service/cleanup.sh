#!/bin/bash
# Auto-generated cleanup script

echo "Stopping and disabling user service thelastdeploy-broken..."
systemctl --user stop thelastdeploy-broken.service || true
systemctl --user disable thelastdeploy-broken.service || true
rm -f "$HOME/.config/systemd/user/thelastdeploy-broken.service"
systemctl --user daemon-reload

echo "Cleanup completed!"
