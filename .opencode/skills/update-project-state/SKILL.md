---
name: update-project-state
description: Update todo.md and persistent memory with completed sprint/task details
---

## What I do
- Read the current todo.md to identify the active sprint or task being worked on
- Find the newly completed items (marked as [x] or newly added completed sections)
- Update todo.md with a new sprint section or mark existing items as [x] completed
- Update the persistent memory block (habit-tracker-project-overview) with the completed sprint summary
- Ensure both todo.md and memory are synchronized with the same information

## When to use me
Use this skill AFTER completing any sprint or significant task. This ensures project state is always current in both:
1. todo.md - the human-readable task tracker
2. Memory block - the AI's persistent context across sessions

## How to update todo.md
1. Read todo.md to find the current/last sprint section
2. Mark completed items with [x]
3. If starting a new sprint, create a new section with format: `## Sprint Title (Sprint N)`
4. Keep the existing structure and style consistent

## How to update persistent memory
1. Read the current memory block (habit-tracker-project-overview)
2. Add a new "Completed (Sprint N)" section with bullet points of what was done
3. Update the "Pending/In Progress" section to reflect current state
4. Use the memory_set tool to overwrite the entire block with updated content

## Rules
- Always update BOTH todo.md AND memory together - never just one
- Keep sprint summaries concise but informative
- Include specific details: files changed, bugs fixed, features added
- Follow existing conventions in todo.md and memory format
