# Verifying Application Recovery & Service Health

Once file permissions are restored, the final step in incident response is verifying service recovery and end-to-end functionality.

---

## 🔄 Verification Checklist

1. **Verify Log Readability**: Confirm non-root users can read .
2. **Restart Application Service**: Ensure  starts without  errors.
3. **Check End-to-End Response**: Query the local HTTP endpoint to confirm  responses replace the earlier .

---

## 📋 Task 4 Instructions ()

To complete the final lab task:

1. **Start the Lab Session**:
   
╔══════════════════════════════════════════════╗
║  The Last Deploy — Starting: Verify Applicat…║
╚══════════════════════════════════════════════╝

⚙  Running setup commands...
  $ sudo rm -f /var/log/app-server.log

2. **Confirm Application Recovery**:
   Create the required marker file confirming full service restoration:
   

3. **Validate and Complete**:
   Run  to complete the lab:
   

4. **Stop the Session**:
   
