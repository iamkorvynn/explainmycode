Below is a clean, structured “master prompt” you can give to an AI UI/code generator (like v0, Cursor, Bolt, etc.) to build the final ExplainMyCode interface exactly as you described. I merged your initial spec + final feature map into one consistent product prompt.

You can copy-paste this directly.

Master Prompt — ExplainMyCode IDE

Design and build a premium AI-powered coding IDE called “ExplainMyCode.”

The product is an AI mentor for programmers that explains code, detects bugs, highlights assumptions, and visualizes algorithms.

The interface should feel like a hybrid of:

VS Code

GitHub Copilot

ChatGPT

The UI should be a modern SaaS developer platform with a clean futuristic dark theme.

Focus on developer productivity, clarity, and a premium experience.

Overall Layout

The interface must use a 3-panel IDE layout similar to professional code editors.

┌─────────────┬──────────────────────┬────────────────────┐
│             │                      │  AI MENTOR         │
│    FILE     │                      ├────────────────────┤
│   MANAGER   │   CODE EDITOR        │ Comments │ Explain │
│             │   (Monaco style)     │ Bugs │ Assumptions  │
│  - folders  │                      │ Summary            │
│  - files    │                      ├────────────────────┤
│             ├──────────────────────┤  Explanation Area  │
│             │  TERMINAL            │                    │
└─────────────┴──────────────────────┴────────────────────┘
│  🟢  Am I On Track — FULL WIDTH bottom status bar       │
└─────────────────────────────────────────────────────────┘
Top Navigation Bar
[⚡ ExplainMyCode]   [▶ Run Code]   [🔮 Algorithm Viz]   [📊 Analysis]   [👤 User]

Buttons:

Run Code
Runs the program and prints output in the terminal.

Algorithm Viz
Opens the algorithm visualization page.

Analysis
Opens the code analysis dashboard.

User
Profile/settings.

Left Sidebar — File Manager

A VS Code–style file explorer.

Features:

• folder tree structure
• collapsible folders
• file icons
• create new file button
• search files field

Example:

src/
 ├ algorithms/
 │  ├ binary_search.py
 │  ├ quick_sort.py
 ├ main.py
 ├ utils.py
Center Panel — Code Editor

A Monaco-style editor with:

• syntax highlighting
• line numbers
• active line highlight
• scrollable code area
• cursor selection
• file tabs

Languages supported:

Python
JavaScript
C++
Java

Bottom Panel — Terminal

A terminal console for program output.

Features:

• program output
• error logs
• clear terminal button
• auto scroll

Example:

> Running main.py

Output:
Hello World
Right Panel — AI Mentor

The AI Mentor panel contains 5 tabs.

Tabs must appear at the top of the panel.

Comments | Summary | Explanation | Bugs | Assumptions

The panel should be scrollable.

AI Mentor Tabs
Comments (Real-time)

Line-by-line comments generated automatically while typing.

Updates every 1.5 seconds pause.

Each line shows a card.

Example:

Line 3 — Loop iterates through array
Line 7 — Condition checks if value exists

Color coding:

Blue → informational
Green → important logic
Yellow → warning

Powered by Groq.

Summary

A short paragraph explaining what the entire program does.

Example:

This program performs binary search on a sorted list
to efficiently locate a target value.

Generated when the user clicks Explain Code.

Explanation (Section-Based)

Large code must be split into logical sections.

Example:

Lines 1-4 — Setup
Lines 5-10 — Loop
Lines 11-15 — Return value

User clicks a section button → detailed explanation appears.

Small programs can be explained fully.

Bugs

Displays detected bugs as cards.

Example:

🐛 Line 7 — Runtime Bug
Division by zero possible if b = 0

⚠️ Line 12 — Logic Bug
Loop runs one extra time (off-by-one)
Assumptions

Shows hidden assumptions in the code.

Example:

📌 Input Assumption
Assumes user never enters negative numbers

📌 Data Assumption
Assumes array is already sorted
Am I On Track Bar

Full width bar at the bottom of the IDE.

Displays real-time feedback about the code.

Examples:

🟢 Looks good! Your loop logic is correct
Python • 12 lines • 0 bugs

🟡 Warning — variable defined but unused
Python • 8 lines • 1 warning

🔴 Error — division by zero on line 7
Python • 15 lines • 1 error

Updates automatically every 1.5 seconds pause.

Powered by Groq.

Color transitions must animate smoothly.

Algorithm Visualization Page

Separate page for algorithm animations.

User selects an algorithm.

Examples:

Bubble Sort
Binary Search
DFS / BFS
Merge Sort

The page must show step-by-step animations.

Controls:

Play
Pause
Step
Reset

Examples:

Sorting bars animation
Binary search pointer movement
Recursion tree diagrams
Graph traversal visualization

Code Analysis Page

A dashboard showing code metrics.

Cards should display:

Total Lines
Functions
Detected Algorithms
Code Quality Score

Additional panels:

Code Summary

Primary Language
Code Style
Documentation status

Detected Algorithms

Example:

Binary Search — O(log n)
Bubble Sort — O(n²)
Linear Search — O(n)

Complexity Analysis

Bar chart:

Functions
Loops
Conditions
Recursion

Code Quality Score

Circular progress indicator.

Optimization Suggestions

Example cards:

Use mid = left + (right-left)//2
Add docstrings to functions
Add type hints
Validate input values
Design System

Color palette:

Background: #020617
Panels: #111827
Borders: #1f2937
Primary accent: #22c55e
Secondary accent: #3b82f6
Text: #e5e7eb

Typography:

Modern developer font
Clear hierarchy
Readable spacing

UI Components

Use reusable components:

Buttons
Tabs
Cards
Code blocks
Panels
Inputs
Terminal console

Micro Interactions

Buttons glow on hover
Panels slide smoothly
AI responses fade in
Active tab highlighted
Loading animation for AI processing

Example animation:

AI analyzing code...
Scanning functions...
Detecting algorithms...
Generating explanation...
Empty State

When the editor has no code:

Welcome to ExplainMyCode

Paste or write code to get instant AI explanations.

Supported languages:
Python • JavaScript • C++ • Java

Include a Try Sample Code button.

Backend APIs Used

The system should integrate these APIs:

Groq → real-time comments + On Track bar
Claude → summary, explanations, bugs, assumptions
Judge0 → code execution for terminal

Goal

Create a polished AI-powered developer IDE that feels like a real product combining:

VS Code
GitHub Copilot
ChatGPT

The system should feel like a smart programming mentor that explains and analyzes code in real time.

If you want, I can also give you a second prompt specifically for generating the full backend architecture (FastAPI + Groq + Claude + Judge0) so your AI IDE actually works end-to-end.