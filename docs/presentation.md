# Seatly - Project Presentation

## 1. What is Seatly?

Seatly is a **seat reservation web application**. It allows users to visually browse a seat map, navigate between weekdays, select an available seat, pick a date, and confirm a reservation. Reservations are stored permanently in a Firebase Firestore cloud database.

Think of it as a booking system for a shared workspace, coworking space, or classroom with 25 fixed seats.

---

## 2. How it works (User Flow)

```
1. User opens the app
2. The seat map loads for today (or the next weekday)
3. User navigates between days using arrows or the date picker
4. User clicks an available seat
5. A reservation panel appears on the right with a mini-calendar
6. User picks a date (today up to 8 days ahead, weekdays only)
7. User clicks "Confirm Reservation"
8. The reservation is saved to Firestore
9. The seat becomes unavailable for that date
```

---

## 3. Tech Stack

| Layer         | Technology                                  |
|---------------|---------------------------------------------|
| Framework     | Next.js 15 (React 19, TypeScript)           |
| UI Components | shadcn/ui (built on Radix UI primitives)    |
| Styling       | Tailwind CSS with custom color theme        |
| Date Handling | date-fns + react-day-picker v9              |
| Database      | Firebase Firestore (cloud NoSQL)            |
| Icons         | Lucide React                                |
| Hosting       | Firebase App Hosting                        |

---

## 4. Project File Structure

```
ReservaMesa/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root HTML layout + global font + Toaster
│   │   ├── page.tsx            ← Main page: all app logic lives here
│   │   ├── globals.css         ← Theme colors (CSS variables)
│   │   └── favicon.ico
│   ├── components/
│   │   ├── seat-layout.tsx     ← Arranges 25 seats into rows
│   │   ├── seat.tsx            ← Single seat: icon, colors, click handler
│   │   ├── minimal-calendar.tsx← Reservation date picker (custom DayPicker)
│   │   └── ui/                 ← shadcn/ui library components (Button, Card, etc.)
│   ├── lib/
│   │   ├── data.ts             ← Seat definitions (IDs, initial status)
│   │   ├── firebase.ts         ← Firebase initialization + Firestore export
│   │   └── utils.ts            ← Tailwind class merge utility
│   └── hooks/
│       ├── use-toast.ts        ← Toast notification state management
│       └── use-mobile.tsx      ← Mobile detection hook
├── package.json                ← Dependencies and scripts
├── tailwind.config.ts          ← Tailwind theme with custom colors
├── next.config.ts              ← Next.js configuration
├── apphosting.yaml             ← Firebase App Hosting config
└── .env.local                  ← Firebase credentials (not in git)
```

---

## 5. File-by-File Explanation

---

### 5.1 `src/lib/data.ts` - Seat Definitions

**Purpose:** Defines the data model for seats and the initial set of 25 seats.

**Code breakdown:**
- `SeatStatus` type: a seat can be `'available'`, `'selected'`, or `'unavailable'`
- `Seat` interface: each seat has an `id` (like `"1A"`) and a `status`
- `seatIds` array: lists all 25 seat IDs in order:
  - Rows 1-3: 6 seats each (`1A`-`1F`, `2A`-`2F`, `3A`-`3F`) = 18 seats
  - Row 4: 3 seats (`4A`-`4C`) = accessibility seats
  - Row 5: 4 seats (`5A`-`5D`) = lounge/armchair seats
- `initialSeats`: maps each ID into a `Seat` object. All start as `'available'` except seat `2F` which is permanently `'unavailable'`

**Connects to:** `page.tsx` imports `initialSeats` and `Seat` type from here.

---

### 5.2 `src/lib/firebase.ts` - Firebase Initialization

**Purpose:** Initializes the Firebase app and exports a Firestore database instance.

**Code breakdown:**
- Reads Firebase config from environment variables (all prefixed `NEXT_PUBLIC_` so they're available in the browser)
- Uses `getApps().length === 0` check to prevent re-initialization during Next.js hot module replacement (HMR) in development
- Exports `db`: the Firestore database instance

**Connects to:** `page.tsx` imports `db` to read and write reservations.

---

### 5.3 `src/lib/utils.ts` - CSS Utility

**Purpose:** Provides the `cn()` function for merging Tailwind CSS classes.

**Code breakdown:**
- Combines `clsx` (conditional class joining) with `tailwind-merge` (deduplicates conflicting Tailwind classes)
- Example: `cn("p-4", condition && "p-8")` returns `"p-8"` when condition is true, not `"p-4 p-8"`

**Connects to:** Used by virtually every component for conditional styling.

---

### 5.4 `src/components/seat.tsx` - Individual Seat Component

**Purpose:** Renders a single seat as a clickable square with an icon and label.

**Code breakdown:**
- Receives a `seat` object, a `labelPosition` (`'top'` or `'bottom'`), and an `onSeatClick` callback
- **Icon selection** based on seat ID:
  - `2F` → Clapperboard icon (media/recording room, permanently unavailable)
  - `3E` → User icon (supervisor/fixed seat)
  - `4A`, `4B`, `4C` → Accessibility icon
  - `5A`-`5D` → Armchair icon (lounge seats)
  - All others → Monitor icon (regular workstations)
- **Visual states** controlled by Tailwind classes:
  - `available`: teal border/text, transparent background, pointer cursor
  - `selected`: solid teal background with glow shadow
  - `unavailable`: grey/faded, `cursor-not-allowed`
- Clicking an unavailable seat does nothing (early return)
- The label (e.g. "1A") appears above or below the icon depending on `labelPosition`

**Connects to:** `seat-layout.tsx` renders multiple `Seat` components. The `onSeatClick` callback comes from `page.tsx`.

---

### 5.5 `src/components/seat-layout.tsx` - Seat Grid Layout

**Purpose:** Arranges all 25 seats into the physical layout of the room.

**Code breakdown:**
- Receives the full `seats` array and an `onSeatClick` callback
- `findSeat()` helper: looks up a seat object by ID from the array
- **Layout structure:**
  - **Rows 1-3** (main area): each row of 6 is split into 2 sub-rows of 3 seats. Top sub-row labels go above, bottom sub-row labels go below. This mimics facing desks.
  - **Row 4** (3 seats): accessibility section, separated with padding
  - **Row 5** (4 seats): lounge section, separated with padding

**Connects to:** `page.tsx` passes the computed `seatsForDisplay` array (with per-day statuses) and `handleSeatClick` to this component.

---

### 5.6 `src/components/minimal-calendar.tsx` - Reservation Date Picker

**Purpose:** A compact calendar for picking a reservation date. Only shows available dates with no weekday headers.

**Code breakdown:**
- Wraps the `DayPicker` component from react-day-picker v9
- **Configuration:**
  - `weekStartsOn={0}`: weeks start on Sunday
  - `showOutsideDays={false}`: doesn't show days from adjacent months
  - `nav: "hidden"`: no month navigation arrows (range is limited)
  - `weekdays: "hidden"`: no Sun/Mon/Tue header row
- **Styling via classNames** (react-day-picker v9 API):
  - `selected`: primary color background when a date is chosen
  - `today`: accent color highlight
  - `disabled`: very light (15% opacity) for unavailable dates, hover effect removed
- `formatMonthCaption`: shows just the month name (e.g. "February")

**Connects to:** `page.tsx` renders this inside the reservation panel. It receives `fromDate={today}`, `toDate={addDays(today, 8)}`, and `disabled={isWeekend}` as props.

---

### 5.7 `src/app/layout.tsx` - Root Layout

**Purpose:** The HTML skeleton that wraps every page.

**Code breakdown:**
- Sets the page `<title>` to "Seatly" and description to "Reserve your seat with ease."
- Loads the **Inter** font from Google Fonts
- Applies `font-body antialiased bg-background` to the `<body>`
- Renders `{children}` (the page content) and the `<Toaster />` component for toast notifications

**Connects to:** This wraps `page.tsx`. The `Toaster` component listens for toast events dispatched by `use-toast.ts`.

---

### 5.8 `src/app/globals.css` - Theme Colors

**Purpose:** Defines the color palette as CSS custom properties used by Tailwind.

**Key colors:**
- `--background: 210 17% 94%` → Light grey (#ECEFF1)
- `--primary: 231 48% 48%` → Dark indigo (#3F51B5) — used for headings, selected calendar dates
- `--accent: 174 100% 29%` → Teal (#009688) — used for available/selected seats, today highlight

These HSL values are referenced in `tailwind.config.ts` via `hsl(var(--primary))` etc., creating a consistent theme throughout the app.

---

### 5.9 `src/app/page.tsx` - Main Page (The Brain)

**Purpose:** The single page of the app. Contains all state management, business logic, and the main UI layout.

**Code breakdown by section:**

#### State variables (lines 24-41)
- `reservations`: array of `{ seatId, date }` objects fetched from Firestore for the current view date
- `isLoading`: true while Firestore data is being fetched
- `selectedSeat`: the seat the user has clicked (or null)
- `reservationDate`: the date chosen in the mini-calendar (or undefined)
- `isCalendarOpen`: controls the date-navigation popover
- `today`: today's date at midnight (memoized, computed once)
- `firstAvailableDate`: today, or the next weekday if today is a weekend
- `viewDate`: the currently displayed day

#### Firestore fetch effect (lines 43-71)
- Runs every time `viewDate` changes
- Queries Firestore for all reservations where `date == "YYYY-MM-DD"` (the viewed date as a string)
- Converts Firestore documents back to `Reservation[]` objects
- Shows an error toast if the fetch fails

#### handleSeatClick (lines 73-85)
- Ignores clicks on unavailable seats
- Toggles selection: clicking the same seat deselects it, clicking a different seat selects the new one
- Resets the reservation date when selection changes

#### handleConfirmReservation (lines 93-137)
- Validates that a seat and date are both selected
- Writes a new document to Firestore: `{ seatId, date: "YYYY-MM-DD", createdAt: serverTimestamp }`
- If the reservation is for the currently viewed date, updates local state immediately (optimistic update) so the seat turns unavailable without a refetch
- Shows a success toast with the seat ID and formatted date
- Clears the selection
- Shows an error toast if the write fails

#### seatsForDisplay (lines 139-158)
- A `useMemo` that recomputes whenever `reservations`, `viewDate`, or `selectedSeat` change
- For each of the 25 initial seats:
  - If permanently unavailable → stays unavailable
  - If reserved on the current view date → marked unavailable
  - If it's the currently selected seat → marked selected
  - Otherwise → available

#### Date navigation (lines 160-176)
- `handlePrevDay`: goes back one weekday (skips weekends), can't go before `firstAvailableDate`
- `handleNextDay`: goes forward one weekday (skips weekends)

#### JSX layout (lines 179-267)
- **Header**: "Seatly" title + date navigation bar (left arrow, clickable date with Calendar popover, right arrow)
- **Main area**: two side-by-side cards:
  - Left: the seat map (`SeatLayout`), or "Loading..." while fetching
  - Right (conditional): the reservation panel with close button, mini-calendar, and confirm button. Only visible when a seat is selected.

---

### 5.10 `src/hooks/use-toast.ts` - Toast Notification System

**Purpose:** A state management system for toast notifications, independent of any component tree.

**Code breakdown:**
- Uses a global `memoryState` object and a `listeners` array (pub/sub pattern)
- `toast()` function: creates a notification with an auto-generated ID
- `useToast()` hook: subscribes a component to toast state changes
- Supports add, update, dismiss, and remove actions via a reducer
- Limit: only 1 toast visible at a time (`TOAST_LIMIT = 1`)

**Connects to:** `page.tsx` calls `toast()` for success/error messages. The `Toaster` component in `layout.tsx` renders the visible toasts.

---

### 5.11 Configuration Files

#### `package.json`
- **Dev script**: `next dev --turbopack -p 9002` (runs on port 9002 with Turbopack bundler)
- **Key dependencies**: next, react, firebase, date-fns, react-day-picker, lucide-react, tailwindcss, shadcn/ui (Radix components)

#### `tailwind.config.ts`
- Scans `src/` for Tailwind class usage
- Extends the theme with custom colors that reference CSS variables from `globals.css`
- Sets Inter as the body and headline font
- Includes accordion animation keyframes

#### `next.config.ts`
- Disables TypeScript and ESLint errors during build (`ignoreBuildErrors: true`)
- Allows remote images from placehold.co, unsplash, and picsum

#### `apphosting.yaml`
- Configures Firebase App Hosting with `maxInstances: 1`

#### `.env.local` (not in git)
- Contains the 6 Firebase config values needed to connect to Firestore

---

## 6. How Everything Connects Together

```
                    .env.local
                        │
                        ▼
                   firebase.ts ──── exports `db` (Firestore instance)
                        │
                        ▼
    globals.css ──► layout.tsx ──► page.tsx (Main Page)
    (theme)         (HTML shell)      │
                    + Toaster         ├── imports initialSeats from data.ts
                                      ├── imports db from firebase.ts
                                      ├── uses useToast hook
                                      │
                                      ├── renders SeatLayout
                                      │       └── renders Seat (x25)
                                      │
                                      ├── renders MinimalCalendar
                                      │       └── wraps DayPicker
                                      │
                                      └── renders Calendar (popover)
                                              └── wraps DayPicker
```

### Data flow:

```
1. App loads → page.tsx computes firstAvailableDate (skip weekends)
2. useEffect fires → queries Firestore for reservations on viewDate
3. seatsForDisplay recalculates → merges initialSeats + reservations + selection
4. SeatLayout renders → each Seat shows available/selected/unavailable
5. User clicks seat → selectedSeat state updates → reservation panel appears
6. User picks date → reservationDate state updates
7. User confirms → addDoc to Firestore → local state updates → toast shown
8. User navigates date → viewDate changes → step 2 repeats
```

---

## 7. Firestore Database Structure

```
Collection: "reservations"
│
├── Document (auto-generated ID)
│   ├── seatId: "1A"              (string)
│   ├── date: "2026-02-13"        (string, YYYY-MM-DD)
│   └── createdAt: Timestamp      (server timestamp)
│
├── Document (auto-generated ID)
│   ├── seatId: "3B"
│   ├── date: "2026-02-14"
│   └── createdAt: Timestamp
│
└── ...
```

Dates are stored as strings (not Firestore Timestamps) to avoid timezone issues. The query `where("date", "==", "2026-02-13")` returns all reservations for that exact day.

---

## 8. Business Rules

| Rule | Implementation |
|------|---------------|
| Weekends are blocked | `isWeekend()` check in date navigation + calendar `disabled` prop |
| Max 8 days ahead | `toDate={addDays(today, 8)}` on the MinimalCalendar |
| Can't go to past dates | `fromDate={today}` + arrow button disabled at `firstAvailableDate` |
| Seat 2F is always unavailable | Hardcoded in `data.ts`: `status: id === '2F' ? 'unavailable' : 'available'` |
| One reservation per seat per day | Enforced visually (seat shows as unavailable), but not yet enforced at the database level |
| Reservations persist | Stored in Firestore, fetched on every date navigation |
