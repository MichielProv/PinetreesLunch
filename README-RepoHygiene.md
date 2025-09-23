# Repo Hygiene Pack — How to apply

1) Copy the files into your repo:
   - `README.md` (replace your placeholder README)
   - `CHANGELOG.md`
   - `.editorconfig`
   - `.gitattributes`
   - `.github/workflows/ci.yml`
   - `.github/pull_request_template.md`
   - `.github/ISSUE_TEMPLATE/feature.md`
   - `.github/CODEOWNERS`
   - `docs/BRANCH_PROTECTION.md`
   - `docs/roadmap.md`
   - `docs/adr/0001-newbook-on-demand.md`

2) Commit:
   ```bash
   git add .
   git commit -m "docs: repo hygiene (readme, changelog, ci, templates)"
   git push
   ```

3) Enable branch protection:
   - Follow `docs/BRANCH_PROTECTION.md` in GitHub UI.

4) Confirm CI:
   - Open a PR; ensure `build` completes.
   - Then mark CI checks as "required" in Branch Protection.

5) Start using CHANGELOG + PR template on every change.
