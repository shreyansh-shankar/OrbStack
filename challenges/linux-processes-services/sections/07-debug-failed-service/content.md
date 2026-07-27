## Debug a Failed Service

When a system or application service fails to start or crashes, DevOps engineers use a systematic troubleshooting workflow to inspect statuses, read error logs, fix configurations, and safely restart the service.

---

## 1. Troubleshooting Workflow

When a service crashes or refuses to start, follow these three steps:

### Step A: Check Status
Run `systemctl status` or `systemctl --user status` to see the exit code and recent logs:
```bash
systemctl status my-service
# Active: failed (Result: exit-code)
# Main PID: 4510 (code=exited, status=203/EXEC)
```
*(Common status code `203/EXEC` indicates that the path to the executable file specified in `ExecStart` is invalid or cannot be found.)*

### Step B: Inspect Journal Logs
If status details are truncated, query full error logs using `journalctl`:
```bash
journalctl -n 50 --no-pager -u my-service
```
*(Look closely at the error messages output by the process stdout/stderr immediately before it exited).*

### Step C: Fix Config and Reload
If you modify a service's configuration file (stored in `/etc/systemd/system/` or `~/.config/systemd/user/`), systemd will continue using the old cached copy until you instruct it to reload the configuration files:
```bash
# System services
sudo systemctl daemon-reload

# User-level services
systemctl --user daemon-reload
```
Once reloaded, attempt to start the service again:
```bash
systemctl start my-service
```

---

## Lab Tasks

### Task 1: Fix a failing user service
1. Start the lab in your terminal:
   ```bash
   tld start lnx-recover-broken-web-service
   ```
2. The setup script created a user-level service named `thelastdeploy-broken.service` which is failing to start.
3. Troubleshoot why it is failing. Identify the syntax/configuration error in its unit file located at `~/.config/systemd/user/thelastdeploy-broken.service`.
4. Fix the unit file (the correct executable path to sleep should be `/bin/sleep 3600`).
5. Reload the user systemd manager daemon and start the service successfully.
6. Verify the task:
   ```bash
   tld check
   ```
