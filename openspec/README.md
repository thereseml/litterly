# OpenSpec

This repository uses OpenSpec to keep durable product requirements and planned changes next to the implementation.

## Set up the OpenSpec workflows

Install the OpenSpec CLI using the official [installation guide](https://openspec.dev/docs/installation), then run this from the repository root:

```sh
openspec init --scope project --tools opencode
```

The project-scoped setup installs the OpenSpec skills under `.agents/skills/`, which OpenCode can discover. Commit those generated workflow files when setting up the project. OpenSpec's project context and capability specs are already kept in `openspec/`.

## Working on a change

Use the OpenSpec propose workflow before implementing a feature or a substantial behavior change. Review the proposal, scenarios, technical design, and task list before applying them. After implementation, verify the change against the spec and sync any lasting requirement changes into `openspec/specs/` before archiving it.

For a small typo or a narrowly scoped maintenance fix, use judgment; a full proposal is not required.

## Scope and accuracy

The specs under `openspec/specs/` describe behavior currently implemented in the repository. Planned ideas are not treated as shipped features. Keep unresolved choices—such as the exact subscription price, payment channel, and buyer-page visibility rules—open until explicitly decided.
