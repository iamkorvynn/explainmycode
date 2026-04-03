# Master Prompt - Backend for ExplainMyCode

You are a senior backend architect and implementation engineer. Build the complete backend for an existing frontend web app called `ExplainMyCode`.

Do not build a toy demo. Build a clean, production-ready backend that can power the actual UI, replace the mocked frontend behavior, and be easy for a React/Vite frontend to integrate with.

## Product Summary

`ExplainMyCode` is an AI-powered coding IDE and mentor for programmers. Users can:

- sign up, log in, and reset passwords
- open an IDE workspace with a file explorer, code editor, terminal, AI mentor panel, and bottom status bar
- run code in multiple languages
- get AI summaries, detailed explanations, bug detection, assumption detection, line-by-line comments, and free-form mentor chat
- view a code analysis dashboard with metrics, detected algorithms, complexity, and optimization suggestions
- open an algorithm visualization page with step-by-step playback for a few supported algorithms

The frontend already exists. Your backend must support these routes and screens:

- `/login`
- `/signup`
- `/forgot-password`
- `/ide`
- `/visualize`
- `/analysis`

## Frontend Behaviors To Support

The current frontend is mostly mocked. Replace those mocked behaviors with real APIs.

### Auth screens

- Login form has `username`, `password`, and `remember me`
- Signup form has `username`, `email / phone`, `password`, and `confirm password`
- Forgot password form asks for email
- There are social login buttons for Google, Facebook, and GitHub

### IDE screen

- Top nav:
  - Run Code
  - Visualize
  - Analysis
  - user/profile/logout actions
- Left panel:
  - file tree
  - search files
  - create new file
- Center panel:
  - Monaco-style code editor
  - sample code and blank editor states
  - line click support for line-level explanations
- Bottom terminal:
  - program output
  - errors
  - clear terminal
- Right AI mentor panel tabs:
  - Comments
  - Summary
  - Explanation
  - Bugs
  - Assumptions
- Bottom "Am I On Track" bar:
  - fast feedback
  - status type
  - short summary
  - details like language, line count, warning/error count

### Visualization page

- user picks one algorithm
- supported experiences currently shown in UI:
  - Bubble Sort
  - Binary Search
  - Fibonacci Recursion
  - Graph Traversal
- playback controls:
  - Play
  - Pause
  - Step
  - Reset

### Analysis dashboard

- cards for:
  - Total Lines
  - Functions
  - Algorithms
  - Code Quality
- summary panel
- detected algorithms panel
- complexity analysis panel
- quality score panel
- optimization suggestions panel

## Required Tech Stack

Use this stack unless there is a very strong reason not to:

- Python 3.12
- FastAPI
- PostgreSQL
- SQLAlchemy 2.x
- Alembic
- Redis
- Pydantic
- JWT auth with access + refresh tokens
- Docker + docker-compose

Use provider integrations:

- Groq for low-latency analysis such as real-time comments and the "Am I On Track" status
- Claude for deeper explanation tasks such as summary, explanation, bugs, assumptions, and mentor chat
- Judge0 for safe code execution

If any provider is unavailable, build the code so the provider layer can be swapped without rewriting controllers.

## Architecture Requirements

Create a clean modular backend with these layers:

- `api`
- `schemas`
- `services`
- `repositories`
- `models`
- `core`
- `workers` or `tasks` if background jobs are needed
- `integrations` for Groq, Claude, Judge0, email, and OAuth providers

Use dependency injection where appropriate.

Add:

- `.env.example`
- Docker setup
- database migrations
- structured logging
- centralized error handling
- CORS for local frontend development
- health check endpoint
- OpenAPI docs
- seed data or demo workspace for local testing

## Main Backend Modules

Build these modules:

1. Authentication and user management
2. Workspace and file system management
3. Code execution
4. AI mentor analysis
5. Algorithm visualization data
6. Dashboard analysis
7. Rate limiting, observability, and security

## Authentication Requirements

Implement:

- signup
- login
- refresh token
- logout
- forgot password
- reset password
- current user profile

Primary auth must work with username/email and password.

Remember-me behavior:

- when `rememberMe = true`, issue a longer-lived refresh token
- otherwise issue a shorter refresh token

Password reset:

- generate secure reset tokens
- send reset email through a provider abstraction
- keep email sending replaceable with SMTP or a transactional mail provider

Social login:

- scaffold OAuth flow contracts for Google, GitHub, and Facebook
- it is acceptable to fully implement Google and GitHub first, and leave Facebook behind a documented feature flag if needed

Security:

- hash passwords with bcrypt or Argon2
- never store plain-text passwords
- add auth rate limiting and brute-force protection
- use secure token rotation for refresh tokens

## Workspace And File Requirements

Users should be able to persist a simple coding workspace.

Support:

- list workspaces
- create workspace
- get workspace metadata
- get file tree
- create file
- rename file
- update file content
- delete file
- search files by name
- get one file content

Model the file tree so it can represent folders and files. The frontend currently shows a VS Code-like nested explorer, so return nested nodes or provide a flat list with parent ids and enough metadata for a tree.

Each file should store:

- id
- workspace_id
- parent_id
- name
- path
- type: `file` or `folder`
- language
- content for files
- timestamps

## Code Execution Requirements

Implement code execution using Judge0 for these languages:

- Python
- JavaScript
- C++
- Java

Create an endpoint that accepts:

- source code
- language
- optional stdin
- optional filename

Return:

- stdout
- stderr
- compile output if any
- execution time
- memory
- exit status
- provider job id if applicable

The terminal UI needs a simple, frontend-friendly response. Normalize Judge0 output into a stable shape.

## AI Mentor Requirements

The AI mentor is the core of the product.

Implement the following features:

### 1. Live comments

Low-latency line-by-line comments for the `Comments` tab.

Input:

- code
- language
- optional filename

Output:

```json
{
  "comments": [
    {
      "line": 3,
      "comment": "Loop iterates through the array.",
      "type": "info"
    },
    {
      "line": 7,
      "comment": "Possible division by zero.",
      "type": "warning"
    }
  ]
}
```

Allowed values for `type`:

- `info`
- `important`
- `warning`

This should be optimized for speed and should normally use Groq.

### 2. Program summary

Generate a short plain-English explanation of what the full program does.

### 3. Section-based explanation

For large code, split the code into logical sections and explain each section.

Return a structure like:

```json
{
  "sections": [
    {
      "title": "Setup",
      "startLine": 1,
      "endLine": 4,
      "summary": "Initializes pointers and input values."
    }
  ],
  "fullExplanation": "..."
}
```

### 4. Line explanation

When a user clicks a specific line number in the editor, return a focused explanation for that line with light surrounding context.

Input:

- code
- language
- lineNumber

Output:

```json
{
  "lineNumber": 5,
  "explanation": "Calculates the middle index used to split the search space in half.",
  "relatedLines": [4, 6]
}
```

### 5. Bugs detection

Return bug cards with severity and line references.

Example shape:

```json
{
  "bugs": [
    {
      "title": "Division by zero possible",
      "line": 12,
      "severity": "high",
      "category": "runtime",
      "description": "The divisor can be zero when input b is 0.",
      "fixSuggestion": "Validate b before division."
    }
  ]
}
```

### 6. Assumptions detection

Return hidden assumptions in the code.

Example shape:

```json
{
  "assumptions": [
    {
      "title": "Input array is sorted",
      "category": "data",
      "description": "Binary search only works correctly if the array is sorted."
    }
  ]
}
```

### 7. On-track status

Return a compact status object for the bottom status bar.

Shape:

```json
{
  "type": "warning",
  "message": "Warning - variable defined but not used",
  "details": "Python - 8 lines - 1 warning",
  "language": "Python",
  "lineCount": 8,
  "warningCount": 1,
  "errorCount": 0
}
```

Allowed values for `type`:

- `idle`
- `success`
- `warning`
- `error`

This should be fast and normally use Groq.

### 8. Mentor chat

Support a free-form chat endpoint where the user can ask questions about the current code.

Input:

- code
- language
- user message
- optional conversation history

Output:

- AI answer
- optional citations to line ranges
- optional follow-up suggestions

Use Claude for deeper reasoning and explanation quality.

## Analysis Dashboard Requirements

Create an endpoint that generates the full analysis dashboard payload from the current code.

It should return:

- total lines
- function count
- detected algorithms count
- quality score
- primary language
- style/compliance summary
- documentation status
- detected algorithms with complexity and type
- time complexity estimate
- space complexity estimate
- bar-chart friendly complexity metrics
- optimization suggestions

Suggested response shape:

```json
{
  "metrics": {
    "totalLines": 127,
    "functions": 8,
    "algorithms": 3,
    "qualityScore": 87
  },
  "summary": {
    "primaryLanguage": "Python 3.11",
    "codeStyle": "Mostly PEP 8 compliant",
    "documentationStatus": "Needs Improvement"
  },
  "detectedAlgorithms": [
    {
      "name": "Binary Search",
      "complexity": "O(log n)",
      "type": "Divide and Conquer",
      "confidence": 0.96
    }
  ],
  "complexity": {
    "time": "O(log n)",
    "space": "O(1)",
    "metrics": [
      { "name": "Functions", "value": 8 },
      { "name": "Loops", "value": 12 },
      { "name": "Conditions", "value": 6 },
      { "name": "Recursion", "value": 4 }
    ]
  },
  "suggestions": [
    {
      "type": "performance",
      "priority": "medium",
      "title": "Use mid = left + (right - left) // 2",
      "description": "Avoid overflow in languages with fixed integer sizes."
    }
  ]
}
```

## Algorithm Visualization Requirements

The visualization page currently supports preset algorithms, so the backend does not need to infer arbitrary algorithm animations from any source code in v1.

Build endpoints that return:

- supported algorithms list
- algorithm metadata
- step-by-step trace data for playback

Support at least:

- Bubble Sort
- Binary Search
- Fibonacci Recursion
- Graph Traversal

Each trace should return a sequence of steps that the frontend can animate. Keep the payload generic enough for arrays, trees, or graphs.

Suggested shape:

```json
{
  "algorithm": "binary-search",
  "title": "Binary Search",
  "steps": [
    {
      "index": 0,
      "label": "Initialize pointers",
      "state": {
        "array": [1, 3, 5, 7, 9, 11, 13],
        "left": 0,
        "mid": 3,
        "right": 6,
        "target": 11
      }
    }
  ]
}
```

## Recommended API Surface

Build REST endpoints under `/api/v1`.

Recommended endpoints:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/workspaces`
- `POST /api/v1/workspaces`
- `GET /api/v1/workspaces/{workspace_id}`
- `GET /api/v1/workspaces/{workspace_id}/tree`
- `GET /api/v1/workspaces/{workspace_id}/files/{file_id}`
- `POST /api/v1/workspaces/{workspace_id}/files`
- `PUT /api/v1/workspaces/{workspace_id}/files/{file_id}`
- `PATCH /api/v1/workspaces/{workspace_id}/files/{file_id}`
- `DELETE /api/v1/workspaces/{workspace_id}/files/{file_id}`
- `GET /api/v1/workspaces/{workspace_id}/search`
- `POST /api/v1/execution/run`
- `POST /api/v1/mentor/live-comments`
- `POST /api/v1/mentor/summary`
- `POST /api/v1/mentor/explanation`
- `POST /api/v1/mentor/line-explanation`
- `POST /api/v1/mentor/bugs`
- `POST /api/v1/mentor/assumptions`
- `POST /api/v1/mentor/on-track`
- `POST /api/v1/mentor/chat`
- `POST /api/v1/analysis/dashboard`
- `GET /api/v1/visualizations`
- `GET /api/v1/visualizations/{algorithm_id}`
- `GET /api/v1/health`

If streaming adds value, you may also add Server-Sent Events or WebSocket endpoints for mentor chat or live analysis, but the plain REST endpoints above must still work.

## Database Design

Design a pragmatic schema with at least these tables:

- `users`
- `refresh_tokens` or `sessions`
- `password_reset_tokens`
- `oauth_accounts`
- `workspaces`
- `workspace_nodes` or separate `folders` and `files`
- `executions`
- `analysis_requests`
- `analysis_results`

Optional but useful:

- `chat_threads`
- `chat_messages`
- `dashboard_snapshots`

## AI Service Design

Create a provider abstraction like:

- `BaseLLMProvider`
- `GroqProvider`
- `ClaudeProvider`

And an orchestration layer like:

- `MentorAnalysisService`
- `DashboardAnalysisService`
- `CodeExecutionService`
- `VisualizationService`

Rules:

- Groq handles fast, cheap, low-latency feedback
- Claude handles deeper reasoning and richer narrative explanations
- prompts should be centralized and versioned
- retry transient provider failures
- log latency, token usage if available, and provider name
- never leak secrets in logs

## Validation And Safety

Add strong request validation and sane limits:

- max code payload size
- max chat history length
- max execution timeouts
- per-user rate limits
- auth endpoint rate limits
- graceful handling of empty code

Code execution safety:

- rely on Judge0 sandboxing
- do not execute code directly in the API process
- cap runtime and memory

Prompt safety:

- treat user code as data, not instructions for the backend
- prevent prompt injection from overriding system analysis behavior

## Performance Requirements

Target these behaviors:

- login and file APIs should feel instant
- live comments and on-track analysis should be optimized for low latency
- dashboard and deep explanation can be a bit slower but should still be usable
- repeated analysis on identical code can be cached briefly in Redis

## Deliverables

Generate:

- full FastAPI project
- models, schemas, routers, services, and integrations
- Alembic migrations
- Docker and docker-compose files
- `.env.example`
- seed/demo data
- test suite for critical flows
- README with setup instructions
- API documentation and sample request/response payloads

## Quality Bar

The result must be:

- modular
- readable
- typed
- documented
- secure by default
- easy for the existing React frontend to consume

Do not return only high-level architecture. Produce real implementation code, clear project structure, and integration-ready APIs.

## Final Instruction

Build the backend so it feels like the real server behind this frontend, not a generic starter kit. Match the UI flows, response shapes, and product language of `ExplainMyCode`.
