## Logs with journalctl

Modern systemd-based Linux systems log system and service messages to a centralized, binary logging daemon called **systemd-journald**. We inspect these logs using the `journalctl` utility.

---

## 1. Querying Logs with `journalctl`

Because the journal logs are stored in a binary format, you cannot read them using standard text viewers like `cat` or `less` directly. `journalctl` formats and displays these logs for you.

- **View all logs**:
  ```bash
  journalctl
  ```
- **Filter by Systemd Service**:
  ```bash
  journalctl -u nginx.service
  ```
- **Filter by User-level Service**:
  ```bash
  journalctl --user -u my-service.service
  ```

---

## 2. Common Filtering Flags

- **Follow logs in real-time (`-f`)**:
  ```bash
  journalctl -f -u nginx
  ```
- **Limit output lines (`-n`)**:
  ```bash
  # View the last 20 log entries
  journalctl -n 20 -u nginx
  ```
- **Filter by Time (`--since` / `--until`)**:
  ```bash
  journalctl --since "1 hour ago"
  journalctl --since "2026-06-12 12:00:00"
  ```
- **Filter by Log Priority (`-p`)**:
  ```bash
  # Show only errors (priority 3) and above (emerg, alert, crit, err)
  journalctl -p err -u nginx
  ```

---

## Lab Tasks

### Task 1: Retrieve a secret logged by a service
1. Start the lab in your terminal:
   ```bash
   tld start lnx-find-service-error
   ```
2. The setup script created and ran a user-level service named `thelastdeploy-logger.service` which logged a secret key to the journal.
3. Inspect the user-level systemd journal logs specifically for `thelastdeploy-logger.service`.
4. Locate the logged line containing `SECRET_LOG_KEY=...` and save the exact key value on a single line to a file named `secret_key.txt` inside a new directory named `logs-test` in your home directory.
5. Verify the task:
   ```bash
   tld check
   ```
