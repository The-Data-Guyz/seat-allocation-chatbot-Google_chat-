# GitHub repository setup

## Recommended repository settings

- Create the repository as **private**.
- Suggested name: `seat-allocation-chatbot`.
- Do not initialise it with another README, `.gitignore`, or licence because these files are already included.
- Enable branch protection for `main` after the first push.
- Require pull requests, at least one approval, and the `validate` status check.
- Restrict direct pushes to `main`.
- Enable secret scanning and dependency alerts where available.

## First push using Git

From the extracted project directory:

```bash
git init
git branch -M main
git add .
git commit -m "chore: initialise seat allocation chatbot repository"
git remote add origin https://github.com/YOUR-ORGANISATION/seat-allocation-chatbot.git
git push -u origin main
```

Use the SSH remote form instead when that is your organisation's standard:

```bash
git remote add origin git@github.com:YOUR-ORGANISATION/seat-allocation-chatbot.git
```

## First push using GitHub CLI

After authenticating with `gh auth login`:

```bash
git init
git branch -M main
git add .
git commit -m "chore: initialise seat allocation chatbot repository"
gh repo create YOUR-ORGANISATION/seat-allocation-chatbot \
  --private \
  --source=. \
  --remote=origin \
  --push
```

## After the first push

1. Configure branch protection and required review rules.
2. Rename `.github/CODEOWNERS.example` to `.github/CODEOWNERS` after inserting the correct team.
3. Confirm the validation workflow passes.
4. Add the repository URL to the internal project record.
5. Store deployment IDs and spreadsheet IDs in the organisation's approved operational documentation, not in GitHub source files.
