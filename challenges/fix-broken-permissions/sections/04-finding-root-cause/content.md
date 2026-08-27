# Finding the Root Cause of Permission Failures

Now that you have verified `/var/log/app-server.log` has mode `000`, let's analyze why this causes the `webapp` daemon to fail.

---

## 🔬 Root Cause Analysis

### Why Did `webapp` Fail?
1. **Service User Context**: The daemon runs under the `webapp` system account.
2. **Access Denial**: When `webapp` attempts to read or write to `/var/log/app-server.log`, Linux kernel permission checking evaluates:
   - Is `webapp` the owner? Owner bits are `---` (no access).
   - Is `webapp` in the group? Group bits are `---` (no access).
   - Is `webapp` in others? Other bits are `---` (no access).
3. **Result**: The kernel returns `EACCES`. The daemon cannot open its log file and immediately crashes.

---

## 📋 Task 2 Instructions

To complete the second lab task:

1. **Start the Lab Session**:
   ```bash
   tld start lnx-identify-broken-permissions
   ```

2. **Verify Root Cause**:
   Confirm that `/var/log/app-server.log` permissions are `000`, blocking access for `webapp`.

3. **Mark Root Cause Confirmation**:
   Create the required marker file `/tmp/found_root_cause` indicating root cause identification

4. **Validate and Complete**:
   Run the validator check:
   ```bash
   tld check
   ```
   

5. **Stop the Session**:
   ```bash
   tld stop
   ```
