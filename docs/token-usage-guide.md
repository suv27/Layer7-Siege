# Token Usage Guide for Layer7 Siege Development

## Overview

This guide explains how to efficiently use tokens while developing Layer7 Siege to avoid running out of tokens during day-to-day work.

## Current Token Usage

### Session Summary
- **Total Files Created:** 20+
- **Backend Components:** 8 files (types, engines, scenarios, routes, managers)
- **Frontend Components:** 6 files (types, components, pages)
- **Documentation:** 3 files (README, architecture, token guide)
- **Configuration:** 5 files (package.json, Docker, configs)

### Token Efficiency Tips

### 1. **Batch Independent Operations**

When performing multiple independent operations, execute them in parallel rather than sequentially. This significantly reduces token usage by avoiding repeated context loading.

**Good:**
```bash
# Run multiple file reads in parallel
read_file file1.ts
read_file file2.ts
read_file file3.ts
```

**Bad:**
```bash
# Sequential reads waste tokens
read_file file1.ts
# wait for result
read_file file2.ts
# wait for result
read_file file3.ts
```

### 2. **Use Multi-Edit for Multiple Changes**

When making multiple edits to the same file, use `multi_edit` instead of individual `edit` calls.

**Good:**
```typescript
multi_edit({
  file_path: "file.ts",
  edits: [
    { old_string: "foo", new_string: "bar" },
    { old_string: "baz", new_string: "qux" },
  ]
})
```

**Bad:**
```typescript
edit({ file_path: "file.ts", old_string: "foo", new_string: "bar" })
edit({ file_path: "file.ts", old_string: "baz", new_string: "qux" })
```

### 3. **Read Files Before Editing**

Always read a file before editing it to avoid errors and wasted tokens on failed edits.

### 4. **Minimize Context Loading**

- Only read files that are directly relevant to the current task
- Use specific search patterns instead of reading entire directories
- Avoid reading the same file multiple times in a session

### 5. **Plan Before Executing**

- Think through the implementation approach before making tool calls
- Group related operations together
- Use the todo_list tool to track progress and avoid redundant work

## Development Workflow Best Practices

### Backend Development

1. **Start with Types:** Define data models first to establish the foundation
2. **Build Core Engines:** Implement pure functions (rule matcher, traffic generator)
3. **Add Scenarios:** Create scenario definitions with traffic patterns
4. **Wire Routes:** Connect engines to API endpoints
5. **Test:** Write unit tests for core logic

### Frontend Development

1. **Define Types:** Share types with backend where possible
2. **Build Components:** Create reusable components (visualizer, rule builder)
3. **Create Pages:** Assemble components into pages
4. **Add State Management:** Use React hooks for local state
5. **Integrate API:** Connect to backend endpoints

### Testing Strategy

1. **Unit Tests:** Test pure functions in isolation
2. **Integration Tests:** Test API endpoints
3. **E2E Tests:** Test complete user flows (Playwright)

## Token-Saving Techniques

### 1. **Use Specific Search Patterns**

Instead of reading entire directories, use targeted searches:

```typescript
// Instead of reading all files
list_dir("/src")

// Use specific patterns
grep_search({ SearchPath: "/src", Query: "interface Rule" })
find_by_name({ SearchDirectory: "/src", Pattern: "*.test.ts" })
```

### 2. **Limit Output Size**

When reading large files, use offset and limit parameters:

```typescript
read_file({
  file_path: "large-file.ts",
  offset: 1,
  limit: 100
})
```

### 3. **Avoid Redundant Context**

- Don't re-read files that haven't changed
- Use file paths instead of repeating content
- Reference previously read files by name

### 4. **Consolidate Responses**

- Group related information in single responses
- Use bullet points instead of verbose explanations
- Focus on actionable next steps

## Common Token-Wasting Patterns to Avoid

### ❌ Sequential File Operations
```typescript
// Wastes tokens on repeated context
read_file("file1.ts")
read_file("file2.ts")
read_file("file3.ts")
```

### ✅ Parallel File Operations
```typescript
// Efficient single context load
read_file("file1.ts")
read_file("file2.ts")
read_file("file3.ts")
```

### ❌ Verbose Explanations
```typescript
// "I'm going to read the file now to check the contents..."
// "Now I'm going to edit the file to add the function..."
```

### ✅ Direct Action
```typescript
// Read file, then immediately edit with brief explanation
```

### ❌ Repeated Context Loading
```typescript
// Reading the same file multiple times
read_file("config.ts")
// ... do work ...
read_file("config.ts") // redundant
```

### ✅ Cache Context
```typescript
// Read once, reference by name
read_file("config.ts")
// ... do work ...
// Reference "config.ts" without re-reading
```

## Project-Specific Token Optimization

### Layer7 Siege Specifics

1. **Scenario Definitions:** These are large files. Read them once and reference by ID
2. **Rule Matcher:** This is core logic - test it thoroughly before moving on
3. **Traffic Generator:** Can be complex - build incrementally with tests
4. **SSE Implementation:** Keep it simple - avoid over-engineering
5. **Frontend Components:** Build one component at a time, test before moving to next

### Recommended Order for Maximum Efficiency

1. **Backend Types & Core Logic** (highest value per token)
   - Data models
   - Rule matcher (pure function)
   - Traffic generator
   - Unit tests

2. **Backend Integration** (medium value)
   - Simulation engine
   - API routes
   - Scenario definitions

3. **Frontend Core** (high value)
   - Type definitions
   - Traffic visualizer
   - Rule builder

4. **Frontend Integration** (medium value)
   - Scenario selection page
   - Simulation controls
   - Results panel

5. **Testing & Polish** (lower priority)
   - Integration tests
   - E2E tests
   - UI refinements

## Monitoring Token Usage

### Signs You're Approaching Token Limits

- Responses become shorter
- System suggests summarizing
- Context is automatically summarized

### What to Do When Approaching Limits

1. **Prioritize:** Focus on highest-value features
2. **Simplify:** Use simpler implementations
3. **Defer:** Leave non-critical features for later
4. **Document:** Add TODO comments for future work

### Automatic Summarization

The system will automatically summarize your work if you run out of tokens. This includes:
- Files created
- Key implementation decisions
- Current state of the project
- Next steps

**Note:** This is not a failure - it's a safety feature. Work will continue efficiently after summarization.

## Best Practices Summary

1. **Batch operations** - Execute independent tasks in parallel
2. **Multi-edit** - Use for multiple changes to same file
3. **Read before edit** - Always verify file contents
4. **Minimize context** - Only load what you need
5. **Plan ahead** - Think through approach before executing
6. **Be concise** - Avoid verbose explanations
7. **Use patterns** - Follow established patterns from similar code
8. **Test incrementally** - Test as you build, not at the end

## Conclusion

By following these guidelines, you can efficiently develop Layer7 Siege without running out of tokens. The key is to be intentional about tool usage, batch independent operations, and minimize redundant context loading.

Remember: The system will automatically summarize if needed, so focus on making progress rather than worrying about token counts.
