# Finding the Root Cause of Permission Failures

Now that you have verified `/var/log/app-server.log` has mode `000` (`----------`), let's analyze why this causes the `appuser` daemon to fail.

---

## 🔬 Root Cause Analysis

### Why Did `app-server.service` Fail?
1. **Service User Context**: The daemon runs under the `appuser` system account.
2. **Access Denial**: When `appuser` attempts to read or write to `/var/log/app-server.log`, Linux kernel permission checking evaluates:
   - Is `appuser` the owner? Owner bits are `---` (no access).
   - Is `appuser` in the group? Group bits are `---` (no access).
   - Is `appuser` in others? Other bits are `---` (no access).
3. **Result**: The kernel returns `EACCES (Permission denied)`. The daemon cannot open its log file and immediately crashes.

---

## 📋 Task 2 Instructions (`lnx-identify-broken-permissions`)

To complete the second lab task:

1. **Start the Lab Session**:
   ```bash
   tld start lnx-identify-broken-permissions
   ```

2. **Verify Root Cause**:
   Confirm that `/var/log/app-server.log` permissions are `000`, blocking access for `appuser`.

3. **Mark Root Cause Confirmation**:
   Create the required marker file indicating root cause identification:
   ```bash
   touch /tmp/found_root_cause
   ```

4. **Validate and Complete**:
   Run the validator check:
   ```bash
   tld check
   ```

5. **Stop the Session**:
   ```bash
   tld stop
   ```
