# task_logging
# task_logging

# TASK LOGGING PROTOCOL
You must maintain project continuity across devices using `TASK_LOG.md`:

1. AT TASK START:
   - Always read `TASK_LOG.md` to restore context, understand what was done in previous sessions, and identify current priorities.

2. AT TASK COMPLETION (Before declaring "Done"):
   - Append a new concise entry to `TASK_LOG.md` under `## Session History` using this format:
     ### [Date/Time] - <Task Name>
     - **Goal:** <1-line summary>
     - **Changes:** <Bulleted list of modified files and key updates>
     - **Blockers / Notes:** <Any quirks, broken tests, or pending issues>
     - **Next Steps:** <Concrete items for the next session>
   - Keep updates concise and bulleted (do not write long essays) to conserve prompt tokens.
   - Update the `## [Current Project State]` section at the top of the file if the architecture or environment changed.
