# Finding the Root Cause of Permission Failures

Now that you have verified  has mode  (), let's analyze why this causes the  daemon to fail.

---

## 🔬 Root Cause Analysis

### Why Did  Fail?
1. **Service User Context**: The daemon runs under the  system account.
2. **Access Denial**: When  attempts to read or write to , Linux kernel permission checking evaluates:
   - Is  the owner? Owner bits are  (no access).
   - Is  in the group? Group bits are  (no access).
   - Is  in others? Other bits are  (no access).
3. **Result**: The kernel returns . The daemon cannot open its log file and immediately crashes.

---

## 📋 Task 2 Instructions ()

To complete the second lab task:

1. **Start the Lab Session**:
   
╔══════════════════════════════════════════════╗
║  The Last Deploy — Starting: Identify Broken…║
╚══════════════════════════════════════════════╝

⚙  Running setup commands...
  $ sudo rm -f /var/log/app-server.log

2. **Verify Root Cause**:
   Confirm that  permissions are , blocking access for .

3. **Mark Root Cause Confirmation**:
   Create the required marker file indicating root cause identification:
   

4. **Validate and Complete**:
   Run the validator check:
   

5. **Stop the Session**:
   
