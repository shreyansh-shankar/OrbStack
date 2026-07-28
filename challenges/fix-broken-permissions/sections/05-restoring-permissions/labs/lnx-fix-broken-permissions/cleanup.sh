#!/bin/bash
rm -f /tmp/fixed_permissions
sudo rm -f /var/log/app-server.log 2>/dev/null || true
exit 0
