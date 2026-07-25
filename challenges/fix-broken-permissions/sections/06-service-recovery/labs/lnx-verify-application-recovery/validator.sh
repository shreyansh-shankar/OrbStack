#!/bin/bash
if [ -f /tmp/recovery_verified ]; then
  exit 0
else
  exit 1
fi
