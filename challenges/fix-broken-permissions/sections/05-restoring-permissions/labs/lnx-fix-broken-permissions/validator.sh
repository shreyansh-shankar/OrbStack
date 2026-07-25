#!/bin/bash
if [ -r /var/log/app-server.log ]; then
  exit 0
else
  exit 1
fi
