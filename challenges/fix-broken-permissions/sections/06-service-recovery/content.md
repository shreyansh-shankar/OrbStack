# Verifying Application Recovery & Service Health

Once file permissions are restored, the final step in incident response is verifying service recovery and end-to-end functionality.

---

## 🔄 Verification Checklist

1. **Verify Log Readability**: Confirm non-root users can read `/var/log/app-server.log`.
2. **Restart Application Service**: Ensure `app-server.service` starts without `Permission denied` errors.
3. **Check End-to-End Response**: Query the local HTTP endpoint to confirm `200 OK` responses replace the earlier `502 Bad Gateway`.

---

## 📋 Task 4 Instructions (`lnx-verify-application-recovery`)

To complete the final lab task:

1. **Start the Lab Session**:
   ```bash
   tld start lnx-verify-application-recovery
   ```

2. **Confirm Application Recovery**:
   Create the required marker file confirming full service restoration:
   ```bash
   touch /tmp/recovery_verified
   ```

3. **Validate and Complete**:
   Run `tld check` to complete the lab:
   ```bash
   tld check
   ```

4. **Stop the Session**:
   ```bash
   tld stop
   ```
