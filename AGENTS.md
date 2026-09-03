# AGENTS.md — Repo instructions for AI coding agents

Purpose
-------
Short, actionable guidance for AI coding agents to be immediately productive in this repo.

Quick start
-----------
- Install dependencies: `npm install`
- Run tests: `npm test` (also `npm run test:watch`, `npm run test:coverage`)
- Type-check / build: `npm run build`

Key files and locations
-----------------------
- Project README: [README.md](README.md)
- Package scripts and deps: [package.json](package.json)
- Jest config: [Jest/jest.config.cjs](Jest/jest.config.cjs) and [jest.config.cjs](jest.config.cjs)
- TypeScript config: [tsconfig.json](tsconfig.json)
- Source: [src/](src)
- Tests: [test/](test) — tests match `*.test.ts`
- Mocks / fixtures: [src/mocks/](src/mocks) and [test/fixtures.ts](test/fixtures.ts)

Conventions & recommendations
-----------------------------
- Use the `link, don't embed` principle: link to docs instead of copying large sections.
- Run tests and type-checking before proposing code changes (`npm test`, `npm run build`).
- Jest is configured with `ts-jest`; tests run against TypeScript sources without a separate build step.
- Global environment expectations: Node.js 18+ (global `fetch` used by checkout gateway).
- Keep changes minimal and focused; prefer fixing root causes over surface patches.

Common tasks for agents
-----------------------
- Locate and run unit tests for a failing spec: run `npm test` then open the failing test file under `test/`.
- When adding instructions or skills: update this file (`AGENTS.md`) rather than creating a duplicate `.github/copilot-instructions.md`.
- When editing code: run affected tests and update test expectations or mocks as needed.

If you update this file
-----------------------
Please keep entries concise and link to existing docs (`README.md`, `package.json`, `jest.config.cjs`) rather than duplicating them.
