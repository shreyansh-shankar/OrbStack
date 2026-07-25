#!/bin/bash
if [ -f /tmp/found_root_cause ]; then
  exit 0
else
  exit 1
fi
