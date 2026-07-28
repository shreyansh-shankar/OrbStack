# Investigating System Logs & File Permissions

In this section, you will begin hands-on troubleshooting by checking system logs and inspecting file mode permissions.

---

## 🛠️ Step-by-Step Troubleshooting Workflow

### Step 1: Check System File Mode
Check the permission details of the application log file `/var/log/app-server.log`:
```bash
ls -la /var/log/app-server.log
```

Expected output showing broken permissions:
```text
---------- 1 root root 1024 Jul 28 03:14 /var/log/app-server.log
```
> ⚠️ **Notice:** The mode `----------` (`000`) means **no read or write access** is granted to any user or group!

---

## 📋 Task 1 Instructions (`lnx-investigate-permission-issue`)

To complete the first lab task:

1. **Start the Lab Session**:
   ```bash
   tld start lnx-investigate-permission-issue
   ```

2. **Inspect the Log File**:
   Verify that `/var/log/app-server.log` exists and note its permission status (`----------`).

3. **Record Log Inspection**:
   Create the required marker file to confirm you investigated the log permissions:
   ```bash
   touch /tmp/checked_logs
   ```

4. **Validate and Complete**:
   Run the check tool to verify your task:
   ```bash
   tld check
   ```

5. **Stop the Session**:
   ```bash
   tld stop
   ```
