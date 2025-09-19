# AquaDo - A Modern Task Management App

This is a Next.js starter project built in Firebase Studio, which has evolved into a sophisticated task management application named **AquaDo**.

## Core Philosophy

AquaDo is built on a simple yet powerful philosophy: **Clearly separating the urgency of a deadline from the intention of a daily plan.** It empowers users to first capture everything, then consciously curate a focused plan for each day, enhanced by intelligent, AI-powered scheduling.

Unlike other apps that can become cluttered digital junk drawers, AquaDo guides you toward mindful productivity through three core concepts:

1.  **Strict Distinction Between Due Date & Start Time**:
    *   **Due Date (截止日期)**: This is a hard deadline. It defines *when* a task absolutely must be completed. It's about commitment.
    *   **Start Time (开始时间)**: This is a flexible planning tool exclusively for the "My Day" view. It defines *when* you plan to *begin* working on a task today. It's about execution.

2.  **"My Day" as the Daily Cockpit**:
    *   The "My Day" view is your command center for the day. It's a curated, focused list of tasks you intend to accomplish.
    *   Tasks don't appear here automatically (unless they are due today and you choose to add them). This intentional act of planning prevents overwhelm.
    *   **AI Smart Schedule**: This is AquaDo's signature feature. With a single click, it analyzes your daily routine, task durations, and deadlines to intelligently assign a start time to every task in your "My Day" view, transforming a simple to-do list into an actionable schedule.

3.  **Flexible & Contextual Organization**:
    *   **Views for Every Need**: Beyond "My Day," AquaDo provides dedicated views for what's **Upcoming** (due today/tomorrow) and a full **Calendar** view for long-term planning.
    *   **Classic Organization**: Structure your tasks with traditional **Lists** (e.g., Work, Personal) and **Tags** (e.g., #urgent, #project-aqua) for powerful, cross-functional filtering.

## Comparison with Other Apps

### vs. Microsoft To Do

*   **Similarities**: The "My Day" concept is inspired by Microsoft To Do, providing a clean slate for daily planning.
*   **Key Differences**:
    *   **AI Scheduling**: Microsoft To Do suggests tasks to add to your day, but AquaDo takes it a step further. Our "Smart Schedule" doesn't just suggest *what* to do, but *when* to do it, creating a concrete, timed schedule for your entire day.
    *   **Clearer Time-Blocking**: AquaDo's explicit `startTime` is designed for time-blocking, whereas To Do's "Reminders" are more about notifications.

### vs. Sorted³

*   **Similarities**: Both apps excel at merging tasks and calendars to create a daily schedule.
*   **Key Differences**:
    *   **Automation & Simplicity**: Sorted³ is famous for its powerful (but sometimes complex) gestures and manual "auto-schedule" feature. AquaDo's AI "Smart Schedule" is a one-click process that requires less manual input. It leverages AI to understand your natural language schedule (e.g., "I work from 9 to 5 with a lunch break") instead of requiring you to configure time blocks manually.
    *   **Flexibility**: AquaDo allows for "unscheduled" tasks to coexist within the "My Day" view. This provides a more flexible buffer for tasks that you want to accomplish today but don't need to assign to a specific time slot, offering a middle-ground between a rigid schedule and a simple list.
