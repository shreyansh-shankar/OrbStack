#!/bin/bash
rm -f /tmp/checked_logs
sudo rm -f /var/log/app-server.log 2>/dev/null || true
exit 0
