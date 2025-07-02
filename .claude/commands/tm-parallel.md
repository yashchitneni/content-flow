# Task Master Dynamic Parallel Execution

# Task Master Dynamic Parallel Execution

Intelligently fetch and execute the highest priority independent tasks from Task Master.

$ARGUMENTS

## Pre-flight Check:

**FIRST: Verify task-master-ai MCP is configured**
- Check `~/.cursor/mcp.json` for global task-master-ai configuration
- If not found globally, check `.cursor/mcp.json` in current project
- Confirm the MCP server is properly connected and responding

## Execution Instructions:

1. **Connect to task-master-ai MCP** and fetch all pending tasks

2. **Identify Independent Tasks**:
   - Use `task-master list` to see all tasks
   - Check each task's dependencies array
   - Select only tasks where dependencies is empty [] or all dependencies are already completed
   - Sort by priority: high → medium → low

3. **Create Execution Batch**:
   - Take up to 4 highest-priority independent tasks
   - If only 1-3 independent tasks exist, use those
   - If no independent tasks, report what's blocking progress

4. **Execute in Parallel with Multiple Agents**:
   
   **CRITICAL: Each task MUST be handled by a separate, independent agent working simultaneously**
   
   For EACH selected task, spawn a dedicated agent that will:
   
   a) **Create a Git worktree** for isolated development:
      ```bash
      git worktree add -b task-[task_id] ../worktree-task-[task_id] main
      cd ../worktree-task-[task_id]
      ```
   
   b) **Update task status** immediately:
      ```
      task-master setTaskStatus [task_id] "in-progress"
      ```
   
   c) **Work independently** on the task:
      - This agent focuses ONLY on their assigned task
      - No awareness of other parallel agents
      - Complete implementation in their worktree
      - Commit changes with clear messages referencing task_id
   
   d) **Complete their task**:
      - Run tests in the worktree
      - Commit all changes
      - Mark task as ready for merge

   **Parallel Execution Flow:**
   ```mermaid
   graph TD
       A[Task Master] -->|List tasks| B[Filter Independent]
       B --> C[Select Top 4]
       C --> D[Spawn Parallel Agents]
       D --> E1[Agent 1: Task A<br/>Worktree A]
       D --> E2[Agent 2: Task B<br/>Worktree B]
       D --> E3[Agent 3: Task C<br/>Worktree C]
       D --> E4[Agent 4: Task D<br/>Worktree D]
       E1 --> F[Merge All]
       E2 --> F
       E3 --> F
       E4 --> F
       F --> G[Update Status: Completed]

5. **Merge & Cleanup Phase** (After all agents complete):

Once ALL parallel agents have finished:

a) **Return to main branch**:
   ```bash
   cd [main-project-directory]
   git checkout main
   ```

b) **Merge each worktree** one by one:
   ```bash
   # For each completed task
   git merge task-[task_id] -m "Merge task [task_id]: [description]"
   ```

c) **Resolve any merge conflicts**:
   - If conflicts arise, intelligently resolve them
   - Ensure all features from all tasks are preserved
   - Run tests after each merge

d) **Clean up worktrees**:
   ```bash
   git worktree remove ../worktree-task-[task_id]
   git branch -d task-[task_id]
   ```

e) **Update task-master status**:
   ```
   task-master setTaskStatus [task_id] "completed"
   ```

6. **Final Validation**:
- Run full test suite on main branch
- Ensure all parallel work is integrated correctly
- Provide summary of all completed tasks
- Suggest next batch of tasks

## Multi-Agent Execution Rules:
- **TRUE PARALLELISM**: Agents work simultaneously, not sequentially
- **ISOLATION**: Each agent works in their own worktree
- **NO CROSS-TALK**: Agents don't communicate during execution
- **INDEPENDENT COMMITS**: Each agent commits their own work
- **COORDINATED MERGE**: Only the coordinator handles merging

## Smart Behaviors:
- Always respect task dependencies
- Prioritize high-priority tasks first
- Work with available tasks (1-4) rather than waiting for exactly 4
- Each agent gets appropriate context for their specific task
- Merge conflicts are resolved intelligently, preserving all work

## If no independent tasks available:
Show dependency tree and what needs to be completed first