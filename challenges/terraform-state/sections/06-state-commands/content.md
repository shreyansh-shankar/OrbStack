# State Commands

Advanced state management commands allow refactoring code without destroying resources:

- `terraform state mv <OLD_ADDRESS> <NEW_ADDRESS>`: Renames a resource in state.
- `terraform state rm <ADDRESS>`: Removes a resource from state tracking without deleting real infrastructure.
- `terraform state pull`: Outputs raw state contents to stdout.

---

## Lab Tasks

### Task 1: Rename Resource using State Move
1. Start the lab in your terminal:
   ```bash
   tld start tf-state-move-resource
   ```
2. Navigate to `~/terraform-state-challenge`.
3. Complete the task requirements: State resource renamed successfully using state mv.
4. Verify the task:
   ```bash
   tld check
   ```
