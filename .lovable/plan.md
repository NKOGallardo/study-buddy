

## Plan: User-created subjects with Lucide icons

### Goal
Replace the hardcoded 6 subjects with a per-user, fully customizable subject list. New users start with an empty SUBJECTS list and add their own. Each subject has: **name, Lucide icon, color, weekly goal**. Renames preserve old sessions; deleting a subject also removes its sessions (with a confirm dialog).

### 1. Database — new `subjects` table
Migration creates:
- `subjects` table: `id`, `user_id`, `name`, `slug` (lowercase, used as the subject key in sessions/topics/goals), `icon` (Lucide icon name string e.g. `"Atom"`), `color` (HSL string e.g. `"262 83% 58%"`), `weekly_goal` (int hours), `sort_order`, timestamps
- RLS: users can CRUD only their own rows
- Unique constraint on `(user_id, slug)` so renames stay consistent
- Trigger updates `updated_at`
- **Existing 195 sessions stay intact** — they reference subject by text slug (`physics`, `math`, etc.). Old hardcoded sessions remain queryable; the user simply won't see those subjects in the sidebar until they create matching ones (or we offer a one-click "Import legacy subjects" button — see §4).

### 2. Types refactor — `src/types/study.ts`
- `Subject` becomes `string` (was a union of 6) — represents the slug
- New `SubjectDefinition` interface: `{ id, slug, name, icon, color, weeklyGoal, sortOrder }`
- Remove `SUBJECTS`, `SUBJECT_COLORS`, `SUBJECT_TEXT_COLORS` constants — colors now come from the DB row as inline `style={{ background: 'hsl(var)' }}`
- Keep `Difficulty`, `Mood`, `Status`, `DAYS_OF_WEEK`

### 3. New hook — `src/hooks/useSubjects.ts`
Splits subject management out of `useStudyData.ts` (which is already 411 lines). Provides:
- `subjects: SubjectDefinition[]`
- `addSubject(name, icon, color, weeklyGoal)` — auto-generates slug
- `updateSubject(id, updates)` — rename allowed; if name changes, slug stays the same so sessions don't break
- `deleteSubject(id)` — confirm dialog in UI; cascades delete of `study_sessions`, `topics`, `subject_goals` for that slug
- `reorderSubjects(ids[])` — for drag-reorder later
- `getSubjectBySlug(slug)` — for resolving session.subject → display data

### 4. UI — Subject management

**a) `AppSidebar.tsx`**
- Replace static `SUBJECTS` map with `useSubjects()` 
- Show empty state: "No subjects yet — click + to add your first one"
- Add a small `+` button next to the "Subjects" section header → opens `SubjectDialog`
- Each subject row: render Lucide icon (dynamic import via `icons` map) tinted with the subject's color

**b) New `src/components/subjects/SubjectDialog.tsx`**
- Used for both create + edit
- Fields: Name (zod-validated, 1–40 chars), Icon picker (grid of ~30 curated Lucide icons: Atom, Calculator, Wrench, FlaskConical, BookOpen, Globe, Code, Music, Palette, Dumbbell, Brain, Microscope, etc.), Color picker (10 preset HSL swatches + custom), Weekly goal hours (slider 1–40)
- Live preview chip showing icon + name + color

**c) New `src/components/subjects/SubjectManager.tsx`**
- Embedded in `SettingsPage.tsx`
- Lists all subjects with edit / delete buttons
- Delete confirms: "Delete 'Physics'? This will also remove all study sessions, topics, and goals for this subject."

**d) `SubjectPage.tsx`, `Dashboard.tsx`, `SubjectProgress.tsx`, `QuickAddSession.tsx`, `ReminderDialog.tsx`, `AnalyticsPage.tsx`, `CalendarPage.tsx`, `SearchPage.tsx`**
- Replace all `SUBJECTS.map(...)` with `subjects` from the hook
- Replace `SUBJECT_COLORS[s]` / `SUBJECT_TEXT_COLORS[s]` with inline styles using the subject's `color` value
- Render icons via a `<SubjectIcon name={subject.icon} />` helper

**e) Empty states**
- Dashboard: if no subjects, show CTA "Create your first subject" → opens dialog
- QuickAddSession: disabled until at least 1 subject exists, with hint
- Sidebar Subjects section: same CTA

### 5. Cleanup of `useStudyData.ts`
- Remove `weeklyGoals` state and `updateWeeklyGoal` (now lives on the subject row itself via `useSubjects`)
- Remove `getDefaultGoals` defaults — start empty
- `goals` (notes + topics per subject) keeps working but keyed by slug from `useSubjects`
- `getWeeklyHoursBySubject` and `getSessionsBySubject` accept the slug string

### 6. Tailwind config
- Remove the hardcoded `physics`, `math`, `electronics`, etc. color tokens from `tailwind.config.ts` (they're now per-row in the DB)
- Keep semantic tokens (`primary`, `accent`, etc.) untouched

### Out of scope (can do later)
- Drag-to-reorder subjects
- Importing the legacy 6 subjects in one click (can add a "Restore default subjects" button in Settings if you want)
- Sharing subject templates between users

### Files touched
**New:** `src/hooks/useSubjects.ts`, `src/components/subjects/SubjectDialog.tsx`, `src/components/subjects/SubjectManager.tsx`, `src/components/subjects/SubjectIcon.tsx`  
**Modified:** `src/types/study.ts`, `src/hooks/useStudyData.ts`, `src/components/layout/AppSidebar.tsx`, `src/pages/SettingsPage.tsx`, `src/pages/Dashboard.tsx`, `src/pages/SubjectPage.tsx`, `src/pages/AnalyticsPage.tsx`, `src/pages/CalendarPage.tsx`, `src/pages/SearchPage.tsx`, `src/pages/PomodoroPage.tsx`, `src/components/dashboard/SubjectProgress.tsx`, `src/components/dashboard/StatsCards.tsx`, `src/components/dashboard/RecentActivity.tsx`, `src/components/study/QuickAddSession.tsx`, `src/components/reminders/ReminderDialog.tsx`, `src/components/reminders/ReminderList.tsx`, `tailwind.config.ts`  
**DB:** new `subjects` table migration

