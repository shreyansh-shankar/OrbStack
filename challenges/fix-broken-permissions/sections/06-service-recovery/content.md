# Verifying Application Recovery & Service Health

Once file permissions are restored, the final step in incident response is verifying service recovery and end-to-end functionality.

---

## 🔄 Verification Checklist

1. **Verify Log Readability**: Confirm non-root users can read `/var/log/app-server.log`.
2. **Restart Application Service**: Ensure `webapp` starts without `EACCES` errors.
3. **Check End-to-End Response**: Query the local HTTP endpoint to confirm `200 OK` responses replace the earlier `502`.

---

## 📋 Task 4 Instructions

To complete the final lab task:

1. **Start the Lab Session**:
   ```bash
   tld start lnx-verify-application-recovery
   ```
2. **Confirm Application Recovery**:
   Create the required marker file `/tmp/recovery_verified` confirming full service restoration
   

3. **Validate and Complete**:
   ```bash
   tld check
   ```
   

4. **Stop the Session**:
   ```bash
   tld stop
   ```
