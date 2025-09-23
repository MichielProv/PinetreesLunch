# Branch Protection Guide (GitHub UI)

1) Go to: Repository → Settings → Branches → "Add branch protection rule".
2) Branch name pattern: `main`.
3) Tick:
   - Require a pull request before merging (Approvals: 1)
   - Require status checks to pass before merging (select your CI workflow)
   - Require conversation resolution before merging
   - (Optional) Restrict who can push to matching branches
4) Save.

Tip: After your first CI run, revisit this page to select the exact checks (e.g., build, lint, typecheck).
