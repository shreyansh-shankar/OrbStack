#!/bin/bash
if [ -f /tmp/checked_logs ]; then
  exit 0
else
  exit 1
fi
