# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web-based interface for the Claude Code CLI that provides streaming responses in a chat interface. The project consists of a Hono-based backend (TypeScript) and a React frontend (Vite + SWC + TailwindCSS).

**Important**: This project is no longer actively maintained (per README).

## Architecture

### Backend (`backend/`)

- **Framework**: Hono with runtime abstraction (Deno + Node.js)
- **CLI**: Commander.js for CLI arguments
- **SDK**: `@anthropic-ai/claude-code` for executing Claude Code commands
- **Logging**: `@logtape/logtape`
- **npm package**: Published as `claude-code-webui` with CLI binary at `dist/cli/node.js`

**Key files**:

- `app.ts` — Runtime-agnostic Hono app factory: registers all routes, CORS, config middleware, SPA fallback
- `cli/deno.ts` / `cli/node.ts` — Entry points for each runtime (CLI parsing + server startup)
- `cli/args.ts` — CLI argument parsing (port, host, claude-path, debug)
- `cli/validation.ts` — Universal Claude CLI path detection (PATH tracing, version validation)
- `runtime/types.ts` — Minimal `Runtime` interface abstracting platform-specific ops (process execution, HTTP serving, static files)
- `runtime/deno.ts` / `runtime/node.ts` — Runtime implementations
- `handlers/chat.ts` — Core chat handler: executes Claude via `query()`, streams `StreamResponse` objects
- `handlers/projects.ts` — Lists available project directories
- `handlers/histories.ts` — Conversation history endpoints
- `handlers/conversations.ts` — Individual conversation retrieval
- `handlers/abort.ts` — Request abort endpoint
- `middleware/config.ts` — Config middleware (makes app settings available to all handlers)
- `history/` — Conversation history processing: `parser.ts`, `grouping.ts`, `conversationLoader.ts`, `timestampRestore.ts`, `pathUtils.ts`
- `utils/logger.ts` — Structured logging wrapper
- `utils/fs.ts` / `utils/os.ts` — Platform-agnostic filesystem and OS utilities

### Frontend (`frontend/`)

- **Framework**: React 19 + Vite 7 + SWC + TypeScript + TailwindCSS v4
- **Routing**: React Router DOM v7
- **Testing**: Vitest + Testing Library (jsdom) + Playwright (E2E)

**Key files**:

- `src/App.tsx` — Root app with routing
- `src/main.tsx` — Entry point
- `src/components/ChatPage.tsx` — Main chat page
- `src/components/DemoPage.tsx` — Demo mode page
- `src/components/HistoryView.tsx` — Conversation history browser
- `src/components/ProjectSelector.tsx` — Project directory picker
- `src/components/MessageComponents.tsx` — Message rendering components (user, assistant, tool, system, plan, thinking, todo)
- `src/components/MarkdownRenderer.tsx` — Markdown rendering with rehype-sanitize
- `src/components/SettingsButton.tsx` / `SettingsModal.tsx` — Settings UI
- `src/components/TimestampComponent.tsx` — Timestamp display
- `src/components/chat/` — Chat input components: `ChatInput.tsx`, `ChatMessages.tsx`, `PermissionInputPanel.tsx`, `PlanPermissionInputPanel.tsx`, `HistoryButton.tsx`
- `src/components/messages/` — Message sub-components: `MessageContainer.tsx`, `CollapsibleDetails.tsx`
- `src/components/settings/` — Settings components: `GeneralSettings.tsx`
- `src/hooks/useClaudeStreaming.ts` — Streaming hook (delegates to `useStreamParser`)
- `src/hooks/chat/` — Chat state hooks: `useChatState.ts`, `useAbortController.ts`, `usePermissionMode.ts`, `usePermissions.ts`, `usePlanApproval.ts`
- `src/hooks/streaming/` — Streaming utilities: `useStreamParser.ts`, `useMessageProcessor.ts`
- `src/hooks/useHistoryLoader.ts` — History loading hook
- `src/hooks/useMessageConverter.ts` — Message type conversion
- `src/hooks/useSettings.ts` — Settings management
- `src/hooks/useDemoAutomation.ts` — Demo automation hook
- `src/types.ts` — Frontend message types (ChatMessage, SystemMessage, ToolMessage, ToolResultMessage, PlanMessage, ThinkingMessage, TodoMessage) + type guards
- `src/types/settings.ts` — Settings type definitions
- `src/utils/UnifiedMessageProcessor.ts` — Central message processing pipeline
- `src/utils/messageConversion.ts` — SDK message → frontend message conversion
- `src/utils/contentUtils.ts` — Content preview utilities (edit diffs, bash output, grep results)
- `src/utils/toolUtils.ts` — Tool-related utilities
- `src/utils/constants.ts` — UI/keyboard/tool constants
- `src/utils/storage.ts` — LocalStorage settings persistence
- `src/utils/environment.ts` — Environment configuration
- `src/utils/id.ts` — ID generation
- `src/utils/time.ts` — Time utilities
- `src/contexts/SettingsContext.tsx` — Settings context provider

### Shared Types (`shared/`)

- `types.ts` — `StreamResponse`, `ChatRequest`, `AbortRequest`, `ProjectInfo`, `ConversationSummary`, `ConversationHistory`

## Development Commands

All commands run from project root unless noted.

```bash
# Install dependencies
make install          # frontend only (cd frontend && npm ci)

# Development
make dev-backend      # cd backend && deno task dev
make dev-frontend     # cd frontend && npm run dev

# Quality checks (run before commit)
make check            # format-check + lint + typecheck + test + build-frontend
make format           # format both frontend and backend
make format-check     # format check both
make lint             # lint both
make typecheck        # typecheck both
make test             # test both
make build            # build both (frontend → copy-dist → backend compile)

# Individual component commands
cd frontend && npm run dev       # Frontend dev server (port 3000)
cd frontend && npm run test      # Vitest watch mode
cd frontend && npm run test:run  # Vitest run once
cd backend && deno task dev      # Backend dev (Deno)
cd backend && npm run dev        # Backend dev (tsx watch)
cd backend && npm run test       # Backend Vitest tests
cd backend && deno task build    # Backend single binary (Deno compile)
```

### Running Tests

```bash
# Frontend unit tests (Vitest + jsdom)
cd frontend && npm run test:run

# Backend tests (Vitest)
cd backend && npm run test

# Playwright E2E tests (requires running dev server)
cd frontend && npx playwright test
```

### Formatting Specific Files

```bash
make format-files FILES="frontend/src/path/to/file.tsx"
```

## Key Design Decisions

1. **Runtime Abstraction**: Backend business logic is platform-agnostic via the `Runtime` interface, with separate Deno and Node.js implementations.
2. **Universal CLI Detection**: Tracing-based approach for detecting Claude CLI across npm, pnpm, asdf, yarn installations.
3. **Raw JSON Streaming**: Backend streams unmodified SDK JSON to frontend for maximum flexibility.
4. **Modular Hook Architecture**: Frontend hooks are split by concern (streaming, history, settings, demo automation).
5. **TypeScript Throughout**: Shared types in `shared/types.ts` keep frontend/backend in sync.
6. **Project Directory Selection**: User-chosen working directories for contextual file access.

## API Endpoints

| Method | Path                                              | Description                            |
| ------ | ------------------------------------------------- | -------------------------------------- |
| GET    | `/api/projects`                                   | List available project directories     |
| POST   | `/api/chat`                                       | Chat messages with streaming responses |
| POST   | `/api/abort/:requestId`                           | Abort ongoing requests                 |
| GET    | `/api/projects/:encodedName/histories`            | Conversation histories                 |
| GET    | `/api/projects/:encodedName/histories/:sessionId` | Specific conversation history          |

## Message Types

The frontend processes Claude SDK messages through `UnifiedMessageProcessor` and renders them via type-specific components:

- **ChatMessage**: User/assistant text exchanges
- **SystemMessage**: SDK system messages (init, result, error, hooks)
- **ToolMessage**: Tool usage notifications
- **ToolResultMessage**: Tool results with structured previews (Edit diffs, Bash output, Grep results)
- **PlanMessage**: Plan approval dialog content
- **ThinkingMessage**: Claude's reasoning/thinking content
- **TodoMessage**: TodoWrite tool results with status tracking

## Permission Modes

Three modes cycle via the permission toggle button:

- `default` — Normal execution with manual approval
- `plan` — Plan mode for planning before execution
- `acceptEdits` — Auto-accept edits

## Dependency Management

**Policy**: Fixed versions (no caret `^`) for `@anthropic-ai/claude-code` across frontend and backend.

**Update procedure**:

1. Check versions: `grep "@anthropic-ai/claude-code" frontend/package.json backend/package.json`
2. Update `frontend/package.json` → `npm install`
3. Update `backend/package.json` → `npm install`
4. Update `backend/deno.json` imports → `rm deno.lock && deno cache cli/deno.ts`
5. Verify: `make check`

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Runs on push/PR to main. Tests backend + frontend across Node 20, 22, 24. Checks format, lint, typecheck, tests, and build.
- **Release** (`.github/workflows/tagpr.yml`): Automated releases via tagpr.
- **Demo comparison** (`.github/workflows/demo-comparison.yml`): Demo page validation.

## Environment

- Frontend dev: `http://localhost:3000` (proxies `/api` to backend)
- Backend dev: configurable port (default 8080)
- Port configuration: `.env` file in project root with `PORT=9000`, used via `dotenvx`
