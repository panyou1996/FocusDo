# AquaDo - A Modern Task Management App

# AquaDo - 智能任务管理应用

A sophisticated task management application built with Next.js and Firebase, featuring intelligent scheduling to help users organize their day with minimal effort.

## Table of Contents
- [Recent Features](#recent-features)
- [Core Philosophy](#core-philosophy)
- [AI Smart Schedule - 智能调度功能](#ai-smart-schedule---智能调度功能)
- [页面组件说明](#页面组件说明)
- [Comparison with Other Apps](#comparison-with-other-apps)

## Recent Features

### Completed Tasks Page
- Added a dedicated page to view all completed tasks at `/completed`
- Added navigation link in the sidebar for easy access to completed tasks

### Cleanup
- Removed debug and test pages and directories
- Cleaned up unused code and files

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

## AI Smart Schedule - 智能调度功能

### 功能概述

AquaDo的AI智能调度是一项强大的功能，它能够一键为您的"My Day"任务分配最佳的开始时间，将简单的待办事项列表转化为可执行的日程表。该功能充分考虑了您的工作习惯、任务优先级和时间偏好，帮助您更高效地规划每一天。

### 如何使用智能调度

1. 在"My Day"视图中，添加您计划当天完成的任务
2. 点击界面上的"智能调度"按钮
3. 系统将自动分析您的任务和时间偏好，为每个任务分配最佳的开始时间
4. 查看并调整调度结果（如有需要）

### 智能调度的工作原理

AI智能调度功能基于以下核心逻辑工作：

1. **任务筛选**：首先筛选出标记为"My Day"且尚未完成、未设置开始时间的任务

2. **空闲时间生成**：根据您的工作时间偏好（上午、下午、晚上）生成7天的空闲时间块

3. **固定事件处理**：考虑您日历中已有的固定事件，自动避开这些时间段

4. **任务优先级排序**：按照以下规则对任务进行智能排序：
   - 符合当前时间偏好的任务优先
   - 重要任务优先
   - 有截止日期的任务优先
   - 截止日期早的任务优先
   - 持续时间长的任务优先

5. **任务智能分配**：将排序后的任务分配到最合适的空闲时间块中，优先考虑时间偏好匹配的任务

### 任务类型推断系统

智能调度功能能够自动推断任务类型，以便更好地匹配您的时间偏好：

- **会议 (meeting)**：包含"meeting"或"call"关键词的任务
- **学习 (learning)**：包含"read"或"study"关键词的任务
- **创意 (creative)**：包含"write"或"create"关键词的任务
- **分析 (analytical)**：包含"review"或"analyze"关键词的任务
- **通用 (general)**：不属于以上类别的其他任务

### 调度偏好设置

您可以通过调度偏好设置自定义智能调度的行为：

1. **工作时间设置**：
   - 上午开始时间
   - 上午结束时间
   - 下午开始时间
   - 下午结束时间
   - 晚上开始时间
   - 晚上结束时间

2. **任务类型偏好**：
   - 上午偏好的任务类型
   - 下午偏好的任务类型
   - 晚上偏好的任务类型

## 页面组件说明

AquaDo应用包含多个页面组件，每个组件都有其特定功能和实现原理。以下是对每个页面组件的详细说明：

### 1. My Day 页面

#### 功能概述
"我的一天"页面是AquaDo应用的核心界面，作为用户每天的任务控制台。它显示今天的日期、日程安排和用户计划当天完成的任务列表。

#### 实现原理
- **数据获取**：通过`useTasks`钩子获取所有任务和事件数据
- **数据筛选**：筛选出标记为`isMyDay`且未完成的任务，以及今天和明天的事件
- **视图切换**：支持`compact`和`detailed`两种视图模式，通过`ViewModeToggle`组件实现
- **时间排序**：合并事件和有开始时间的任务，并按时间进行排序

#### 关键按钮及功能
- **智能调度**按钮：点击后调用`autoPlanTasks`函数，根据用户偏好和现有日程为任务自动分配最佳开始时间
- **视图切换**按钮：在紧凑视图和详细视图之间切换
- **添加任务**按钮：打开添加任务对话框

#### 核心代码结构
```tsx
// 筛选My Day任务
const myDayTasks = tasks.filter(task => task.isMyDay && !task.completed);

// 合并事件和任务并排序
scheduledItems = [...events, ...tasks].sort((a, b) => a.time.getTime() - b.time.getTime());

// 智能调度功能
onClick={async () => {
  const result = await autoPlanTasks(tasks, events, handleScheduleUpdate);
}}
```

### 2. Inbox 页面

#### 功能概述
收件箱页面是任务的默认收集点，显示所有尚未分类到特定列表的任务。

#### 实现原理
- **数据获取**：通过`useTasks`钩子获取所有任务数据
- **任务筛选**：使用`useMemo`优化性能，筛选出没有特定列表和未完成的任务
- **任务列表渲染**：渲染`TaskList`组件显示筛选后的任务

#### 关键按钮及功能
- **添加任务**按钮：打开添加任务对话框
- **任务项**：点击任务项可以展开详情，标记完成或编辑任务

### 3. Calendar 页面

#### 功能概述
日历页面提供月视图的日期展示，方便用户查看和管理未来的任务和事件。

#### 实现原理
- **日期计算**：计算当前月份的日期范围和布局
- **任务关联**：将任务与对应的日期关联显示
- **导航功能**：支持月份切换导航

#### 关键按钮及功能
- **月份导航**按钮：切换到上一个或下一个月
- **日期格子**：点击日期可以查看当天的详细任务
- **任务点**：日历上显示的任务标记，指示该日期有任务

### 4. Upcoming 页面

#### 功能概述
即将到来页面按时间顺序显示今天和明天到期的任务，帮助用户关注近期需要完成的任务。

#### 实现原理
- **数据获取**：通过`useTasks`钩子获取所有任务数据
- **任务分类**：将任务分为今天到期和明天到期两个类别
- **时间排序**：每个类别内的任务按时间顺序排序

#### 关键按钮及功能
- **任务项**：点击任务项可以展开详情，标记完成或编辑任务
- **添加到My Day**按钮：将任务添加到"我的一天"列表

### 5. Completed 页面

#### 功能概述
已完成页面专门显示所有已完成的任务，方便用户回顾和查看历史完成的工作。

#### 实现原理
- **数据获取**：通过`useTasks`钩子获取所有任务数据
- **任务筛选**：筛选出所有标记为`completed`的任务
- **时间排序**：按完成时间倒序排列，最新完成的任务显示在前面

#### 关键按钮及功能
- **任务项**：显示已完成的任务详情
- **删除任务**按钮：从已完成列表中移除任务

### 6. Important 页面

#### 功能概述
重要页面显示所有标记为重要的任务，帮助用户关注优先级高的工作。

#### 实现原理
- **数据获取**：通过`useTasks`钩子获取所有任务数据
- **任务筛选**：筛选出标记为`important`的任务

#### 关键按钮及功能
- **任务项**：显示重要任务详情，支持标记完成和编辑
- **重要性切换**：可以取消任务的重要标记

### 7. Lists 页面

#### 功能概述
列表页面允许用户按自定义列表查看和管理任务，例如工作、个人等不同类别。

#### 实现原理
- **动态路由**：使用`[listId]`动态路由参数识别当前查看的列表
- **数据获取**：通过`useTasks`钩子获取所有任务数据
- **任务筛选**：根据`listId`筛选属于特定列表的任务

#### 关键按钮及功能
- **列表切换**：在侧边栏切换不同列表
- **添加任务到列表**：向当前列表添加新任务
- **任务项**：显示列表中的任务详情

### 8. Tags 页面

#### 功能概述
标签页面允许用户按标签查看和管理任务，提供更灵活的任务分类方式。

#### 实现原理
- **动态路由**：使用`[tagId]`动态路由参数识别当前查看的标签
- **数据获取**：通过`useTasks`钩子获取所有任务数据
- **任务筛选**：筛选包含特定标签的任务

#### 关键按钮及功能
- **标签切换**：在侧边栏切换不同标签
- **添加任务**：向当前标签添加新任务
- **任务项**：显示带有特定标签的任务详情

### 9. ScheduleView 组件

#### 功能概述
ScheduleView组件是智能调度功能的核心UI组件，它可视化地显示用户的日程安排、空闲时间和任务分配。

#### 实现原理
- **时间槽生成**：生成6:00到23:00的时间槽
- **空闲时间计算**：计算用户的空闲时间段，考虑工作时间偏好和已有的固定事件
- **任务布局**：计算重叠任务的布局信息，合理展示在时间轴上
- **智能调度集成**：集成智能调度功能，允许用户一键分配任务

#### 关键按钮及功能
- **智能调度**按钮：调用`smartAutoPlanTasks`函数进行任务智能分配
- **偏好设置**按钮：打开调度偏好设置对话框
- **任务拖动**：支持通过拖动调整任务时间

### 10. 主布局组件

#### 功能概述
主布局组件提供应用的基本框架，包括侧边栏导航、页面切换动画和添加任务功能。

#### 实现原理
- **布局结构**：包含侧边栏、主内容区和添加任务按钮
- **状态管理**：管理侧边栏的展开/折叠状态
- **动画效果**：实现页面切换时的平滑过渡动画
- **任务上下文**：通过`TasksProvider`提供任务数据上下文

#### 关键按钮及功能
- **侧边栏切换**：切换侧边栏的展开和折叠状态
- **全局添加任务**按钮：在任何页面快速添加新任务
- **导航链接**：点击侧边栏的链接切换到不同页面

3. **其他设置**：
   - 休息间隔（分钟）
   - 每日最大任务数

### 技术实现细节

智能调度功能基于先进的本地调度算法实现，无需依赖外部API，确保了响应速度和数据隐私：

- 使用`date-fns`库处理日期和时间计算
- 采用贪心算法进行任务分配，优先满足最佳匹配
- 实现了空闲时间块的切割和合并逻辑，处理已存在的事件和任务
- 支持连续7天的任务规划，提供中长期的时间管理视角

### 常见问题

#### 为什么会显示"没有需要调度的任务"？

这表示当前没有标记为"My Day"且未完成、未设置开始时间的任务。请先向"My Day"视图添加任务，然后再尝试智能调度。

#### 为什么有些任务没有被调度？

这可能是因为：
- 没有足够的空闲时间来安排所有任务
- 任务持续时间超出了可用的空闲时间块
- 您设置了每日最大任务数限制

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
