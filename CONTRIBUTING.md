# Contributing to System Design & Frontend Engineering Hub

Thank you for your interest in contributing to this repository!

## Guidelines
1. **Markdown Standards**: Use clear GitHub-flavored markdown. Avoid dense walls of text; prefer bullet points, comparison tables, and Mermaid flowcharts.
2. **Code Quality**: When contributing to `DesignProblems/`, ensure all code passes typechecking, linting, formatting, and tests:
   ```bash
   cd DesignProblems
   pnpm check:all   # Runs typecheck + lint + format:check + test
   ```
3. **Architecture Decision Records (ADRs)**: New architectural proposals must be placed in `DesignProblems/adr/` following the `{00x}-{date}-{slug}.md` naming standard.
4. **Git Operations**: Please handle commits and PRs through standard Git branching workflows.
