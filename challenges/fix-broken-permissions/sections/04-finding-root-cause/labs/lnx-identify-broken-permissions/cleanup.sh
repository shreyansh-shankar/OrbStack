#!/bin/bash
rm -f /tmp/found_root_cause
sudo rm -f /var/log/app-server.log 2>/dev/null || true
exit 0
