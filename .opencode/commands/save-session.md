---
description: Save durable session knowledge and update logs
agent: build
---

Finalize this session for the playwright project.

1. Update `C:\Expero\opencode\shared\shared-memory.md`
   - add only durable reusable knowledge
   - deduplicate
   - do not add temporary notes, secrets, or one-off noise

2. Update `C:\Expero\opencode\playwright\session-log.md`
   - add a short structured entry:
     - date
     - task/report
     - main failures
     - root causes
     - changes applied
     - branch info
     - result

3. Keep both files concise and practical.

---
description: Save durable session knowledge and update logs
agent: build
---

Finalize this session for the playwright project.

1. Update `C:\Expero\opencode\shared\shared-memory.md`
   - add only durable reusable knowledge
   - deduplicate
   - do not add temporary notes, secrets, or one-off noise

2. Update `C:\Expero\opencode\playwright\session-log.md`
   - add a short structured entry:
     - date
     - task/report
     - main failures
     - root causes
     - changes applied
     - branch info
     - result

3. Keep both files concise and practical.

4. Save OpenCode session state to git
   - change directory to `C:\Expero\opencode`
   - review changed files with `git status --short`
   - stage all changes:
     - `git add .`
   - create commit:
     - `git commit -m "open code update: <shortest report>"`
   - push changes:
     - `git push`

Rules:
- This git step applies only to OpenCode session history / shared memory repository updates
- Use the shortest clear commit summary based on the session
- Do not include extra explanation in commit message
- If there is nothing to commit, report that and stop
- Show git command output