# Restoring Correct Linux Permissions

With the root cause identified, you must now restore appropriate read permissions so `appuser` (and system logging utilities) can access `/var/log/app-server.log`.

---

## 🛠️ Recommended Permission Mode

Log files should generally be configured with mode `644` (`rw-r--r--`):
- **User (Owner)**: `rw-` (`6`) — Read and Write
- **Group**: `r--` (`4`) — Read only
- **Others**: `r--` (`4`) — Read only

### Applying `chmod 644`:
```bash
sudo chmod 644 /var/log/app-server.log
```

### Verifying the Change:
```bash
ls -la /var/log/app-server.log
```

Expected output:
```text
-rw-r--r-- 1 root root 1024 Jul 28 03:14 /var/log/app-server.log
```

---

## 📋 Task 3 Instructions (`lnx-fix-broken-permissions`)

To complete the third lab task:

1. **Start the Lab Session**:
   ```bash
   tld start lnx-fix-broken-permissions
   ```

2. **Restore Permissions**:
   Apply read permissions (`644`) to `/var/log/app-server.log`:
   ```bash
   sudo chmod 644 /var/log/app-server.log
   ```

3. **Validate and Complete**:
   Run `tld check` to verify that `/var/log/app-server.log` is readable (`-r` mode):
   ```bash
   tld check
   ```

4. **Stop the Session**:
   ```bash
   tld stop
   ```
