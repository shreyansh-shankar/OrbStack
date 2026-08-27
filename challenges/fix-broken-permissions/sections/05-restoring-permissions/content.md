# Restoring Correct Linux Permissions

With the root cause identified, you must now restore appropriate read permissions so `webapp` (and system logging utilities) can access `/var/log/app-server.log`.

---

## 🛠️ Recommended Permission Mode

Log files should generally be configured with mode `644`:
- **User (Owner)**: `rw-` — Read and Write
- **Group**: `r--` — Read only
- **Others**: `r--` — Read only

### Applying `644`:
```bash
sudo chmod 644 /var/log/app-server.log
```

### Verifying the Change:
```text
-rw-r--r-- 1 root root 0 Jul 28 21:24 /var/log/app-server.log
```
---

## 📋 Task 3 Instructions

To complete the third lab task:

1. **Start the Lab Session**:
   ```bash
   tld start lnx-fix-broken-permissions
   ```
2. **Restore Permissions**:
   Apply read permissions `644` to `/var/log/app-server.log`
   

3. **Validate and Complete**:
   Verify that `/var/log/app-server.log` is readable (`644` mode):
   ```bash
   tld check
   ```
   

4. **Stop the Session**:
   ```bash
   tld stop
   ```
   
