# Project boundaries

This repository contains two separate projects:

- The parent portfolio site lives at the repository root.
- The Chop application lives entirely in `chop/`.

## Mandatory Chop isolation rule

When a task is scoped to the Chop application, treat `chop/` as the only writable project scope.

- Do not modify, format, rename, move, delete, or regenerate any file outside `chop/`.
- Do not change the parent site's HTML, CSS, JavaScript, images, configuration, dependencies, or content.
- Do not run repository-root commands that could rewrite or format parent-site files.
- Ignore unrelated parent-site issues discovered while working on Chop.

An edit outside `chop/` is allowed only when it is technically required for Chop routing, hosting, or deployment and cannot be implemented inside `chop/`. Before making such an edit:

1. State which root-level file must change and why.
2. Keep the change as small and isolated as possible.
3. Do not alter unrelated parent-site behavior or content.
4. Report the root-level change explicitly in the final response.

Files such as `.github/workflows/pages.yml`, `404.html`, and root build scripts are integration files, not general permission to change the parent project. Modify them only when the current Chop task strictly requires it.
