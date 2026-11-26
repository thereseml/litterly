---
name: commit-messages
description: Use when writing or reviewing Git commit messages in the Litterly project; follow meaningful Conventional Commit subjects and bodies.
---

# Commit Messages

Write commit messages that explain a change clearly to teammates and future maintainers. Follow the article's guidance on meaningful messages and Conventional Commits:

https://medium.com/@iambonitheuri/the-art-of-writing-meaningful-git-commit-messages-a56887a4cb49

## Format

Use this structure:

```text
<type>[optional scope]: <imperative description>

[optional body explaining what changed and why]

[optional footer(s)]
```

Use a relevant type:

- `feat`: Add user-visible functionality.
- `fix`: Correct a bug.
- `refactor`: Restructure code without changing behavior.
- `perf`: Improve performance.
- `test`: Add or correct tests.
- `docs`: Change documentation.
- `style`: Make formatting-only changes.
- `build`: Change dependencies, versions, or build tooling.
- `ci`: Change continuous integration.
- `ops`: Change operational infrastructure or deployment.
- `chore`: Make other maintenance changes.
- `revert`: Revert an earlier commit.

## Subject

- Keep the entire subject, including the type and optional scope, to 50 characters or fewer.
- Use the imperative mood and capitalize the first word after the colon, for example `feat(profile): Add kennel-name editing`.
- Do not end the subject with a period.
- Describe the actual change; avoid vague subjects such as `Tweak a few things`.
- Add a scope only when it makes the change clearer.

## Body

- Separate the body from the subject with a blank line.
- Explain why the change is useful and any important behavior or trade-off; do not merely repeat the subject.
- Wrap body lines at 72 characters.
- Omit the body when the subject fully explains a small, self-contained change.
- Use footers for references such as issue numbers or breaking-change notes.

## Before Committing

- Inspect `git status` and the staged diff; write the message to match only the changes being committed.
- Follow the repository's Git safety instructions: commit only when requested and do not amend a published commit.
