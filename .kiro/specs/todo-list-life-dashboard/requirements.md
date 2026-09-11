# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application that helps users organize their day through a clean, unified interface. It combines a live greeting with time/date display, a Pomodoro focus timer, a persistent to-do list, and quick-access links to favorite websites. All data is stored client-side using the browser's LocalStorage API. The application must work across modern browsers (Chrome, Firefox, Edge, Safari) and be fully responsive for desktop, tablet, and mobile viewports.

The application is built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no backend.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **User**: The person using the Dashboard in a browser.
- **Task**: A to-do item created by the User containing a text description and a completion state.
- **Quick Link**: A user-defined bookmark consisting of a label and a URL that opens in a new browser tab.
- **Pomodoro Timer**: A countdown timer set to 25 minutes, used to track focused work sessions.
- **LocalStorage**: The browser's `localStorage` API used to persist data client-side without a server.
- **Greeting**: A time-sensitive salutation ("Good Morning", "Good Afternoon", "Good Evening") combined with the User's name.
- **Dark Mode**: An alternative color scheme with dark backgrounds and light text.
- **Light Mode**: The default color scheme with light backgrounds and dark text.
- **Theme**: The active color scheme (Light Mode or Dark Mode).

---

## Requirements

### Requirement 1: Live Greeting and DateTime Display

**User Story:** As a User, I want to see the current time, date, and a personalized greeting, so that I always have immediate context about when I am working.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current time in HH:MM:SS format, updated every second.
2. THE Dashboard SHALL display the current date in a human-readable format (e.g., "Saturday, 7 September 2026").
3. WHEN the current local hour is between 05:00 and 11:59, THE Dashboard SHALL display the greeting "Good Morning".
4. WHEN the current local hour is between 12:00 and 17:59, THE Dashboard SHALL display the greeting "Good Afternoon".
5. WHEN the current local hour is between 18:00 and 23:59 or between 00:00 and 04:59, THE Dashboard SHALL display the greeting "Good Evening".
6. WHERE a custom name has been saved by the User, THE Dashboard SHALL append the saved name to the greeting (e.g., "Good Morning, Dewi!").
7. IF no custom name has been saved, THE Dashboard SHALL display the greeting without a name suffix.

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a User, I want to enter my name so that the greeting feels personal and welcoming.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input field and a save button for the User to enter a custom name.
2. WHEN the User submits a non-empty name, THE Dashboard SHALL save the name to LocalStorage under a defined key.
3. WHEN the User submits a non-empty name, THE Dashboard SHALL immediately update the greeting display to include the new name.
4. IF the User submits an empty or whitespace-only string, THEN THE Dashboard SHALL retain the previously saved name without modification.
5. WHEN the Dashboard is loaded, THE Dashboard SHALL read the name from LocalStorage and pre-populate the name input field with the saved value.

---

### Requirement 3: Pomodoro Focus Timer

**User Story:** As a User, I want a 25-minute countdown timer, so that I can work in focused Pomodoro sessions.

#### Acceptance Criteria

1. THE Dashboard SHALL display a countdown timer initialized to 25:00 (minutes:seconds).
2. WHEN the User activates the Start button, THE Dashboard SHALL begin counting down the timer at one-second intervals.
3. WHILE the timer is running, THE Dashboard SHALL disable the Start button and enable the Stop button.
4. WHEN the User activates the Stop button, THE Dashboard SHALL pause the countdown and retain the current remaining time.
5. WHILE the timer is paused, THE Dashboard SHALL enable the Start button and disable the Stop button.
6. WHEN the User activates the Reset button, THE Dashboard SHALL stop the countdown and reset the display to 25:00.
7. WHEN the countdown reaches 00:00, THE Dashboard SHALL stop the timer and notify the User via a browser `alert` or an in-page visual notification.
8. THE Dashboard SHALL display the Start, Stop, and Reset controls as clearly labeled buttons adjacent to the timer display.

---

### Requirement 4: To-Do List — Add and Display Tasks

**User Story:** As a User, I want to add tasks to a list, so that I can keep track of what needs to be done today.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a text input field and an Add button for creating new tasks.
2. WHEN the User submits a non-empty task description, THE Dashboard SHALL append a new Task to the task list.
3. IF the User submits an empty or whitespace-only string, THEN THE Dashboard SHALL not create a new Task and SHALL display an inline validation message.
4. IF the submitted task description (case-insensitive, trimmed) matches an existing Task description, THEN THE Dashboard SHALL not create a duplicate Task and SHALL display an inline duplicate-warning message.
5. THE Dashboard SHALL display each Task as a list item containing the task text, a complete toggle control, an edit control, and a delete control.

---

### Requirement 5: To-Do List — Edit Tasks

**User Story:** As a User, I want to edit existing tasks, so that I can correct mistakes or update task descriptions.

#### Acceptance Criteria

1. WHEN the User activates the edit control for a Task, THE Dashboard SHALL replace the Task's text display with an editable input field pre-filled with the current task text.
2. WHEN the User confirms the edit with a non-empty value, THE Dashboard SHALL update the Task's stored description and return to the read-only display.
3. IF the User confirms the edit with an empty or whitespace-only value, THEN THE Dashboard SHALL discard the change and restore the original task text.
4. WHEN the User cancels the edit (e.g., presses Escape), THE Dashboard SHALL discard any changes and restore the original task text.

---

### Requirement 6: To-Do List — Complete and Delete Tasks

**User Story:** As a User, I want to mark tasks as done and remove tasks I no longer need, so that my list stays relevant.

#### Acceptance Criteria

1. WHEN the User activates the complete toggle for a Task, THE Dashboard SHALL toggle the Task's completion state between complete and incomplete.
2. WHILE a Task is in the complete state, THE Dashboard SHALL apply a visual distinction to the Task (e.g., strikethrough text, reduced opacity).
3. WHEN the User activates the delete control for a Task, THE Dashboard SHALL remove the Task from the list permanently.

---

### Requirement 7: To-Do List — Persistence via LocalStorage

**User Story:** As a User, I want my tasks to be saved automatically, so that they are still there when I reload the page.

#### Acceptance Criteria

1. WHEN a Task is added, edited, completed, or deleted, THE Dashboard SHALL serialize the full task list to LocalStorage.
2. WHEN the Dashboard is loaded, THE Dashboard SHALL read and deserialize the task list from LocalStorage and render all stored Tasks.
3. IF no task data exists in LocalStorage on load, THE Dashboard SHALL render an empty task list without error.

---

### Requirement 8: Quick Links — Add and Display

**User Story:** As a User, I want to save quick-access links to my favorite websites, so that I can open them with a single click.

#### Acceptance Criteria

1. THE Dashboard SHALL provide input fields for a link label and a URL, and an Add button for creating a new Quick Link.
2. WHEN the User submits a non-empty label and a valid URL (beginning with `http://` or `https://`), THE Dashboard SHALL add the Quick Link to the links list.
3. IF the User submits an empty label or an invalid URL, THEN THE Dashboard SHALL not create the Quick Link and SHALL display an inline validation message.
4. THE Dashboard SHALL display each Quick Link as a clickable button or anchor element showing the label.
5. WHEN the User activates a Quick Link, THE Dashboard SHALL open the associated URL in a new browser tab.

---

### Requirement 9: Quick Links — Delete and Persistence

**User Story:** As a User, I want to remove quick links I no longer need and have my links survive page reloads.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a delete control for each Quick Link.
2. WHEN the User activates the delete control for a Quick Link, THE Dashboard SHALL remove that Quick Link from the list.
3. WHEN a Quick Link is added or deleted, THE Dashboard SHALL serialize the full quick-links list to LocalStorage.
4. WHEN the Dashboard is loaded, THE Dashboard SHALL read and deserialize the quick-links list from LocalStorage and render all stored Quick Links.
5. IF no quick-link data exists in LocalStorage on load, THE Dashboard SHALL render an empty quick-links section without error.

---

### Requirement 10: Light / Dark Mode Toggle

**User Story:** As a User, I want to switch between a light and dark color scheme, so that I can use the Dashboard comfortably in any lighting environment.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a clearly labeled toggle control for switching between Light Mode and Dark Mode.
2. WHEN the User activates the theme toggle, THE Dashboard SHALL switch the active Theme to the opposite Theme immediately.
3. WHEN the Theme changes, THE Dashboard SHALL apply the new Theme's CSS styles to all visible elements without a page reload.
4. WHEN the Theme changes, THE Dashboard SHALL save the selected Theme to LocalStorage.
5. WHEN the Dashboard is loaded, THE Dashboard SHALL read the saved Theme from LocalStorage and apply it before rendering content (to prevent a flash of incorrect Theme).
6. IF no Theme preference has been saved in LocalStorage, THE Dashboard SHALL default to Light Mode.

---

### Requirement 11: Responsive Layout

**User Story:** As a User, I want the Dashboard to work well on my phone, tablet, and desktop, so that I can use it on any device.

#### Acceptance Criteria

1. THE Dashboard SHALL use a responsive CSS layout that adapts to viewport widths of at least 320px (mobile), 768px (tablet), and 1280px (desktop).
2. WHILE the viewport width is below 768px, THE Dashboard SHALL stack all sections vertically in a single column.
3. WHILE the viewport width is 768px or above, THE Dashboard SHALL arrange sections in a multi-column grid layout.
4. THE Dashboard SHALL not display horizontal scroll bars at any supported viewport width.
5. THE Dashboard SHALL render all interactive controls at a minimum touch target size of 44×44 CSS pixels on mobile viewports.

---

### Requirement 12: Performance and Cross-Browser Compatibility

**User Story:** As a User, I want the Dashboard to load fast and work in any modern browser, so that I have a reliable tool regardless of my browser choice.

#### Acceptance Criteria

1. THE Dashboard SHALL load completely in under 3 seconds on a standard broadband connection.
2. THE Dashboard SHALL function correctly in the latest stable releases of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL use only standard Web APIs (DOM, LocalStorage, Date, setInterval) and SHALL NOT depend on any external JavaScript libraries or CSS frameworks.
4. THE Dashboard SHALL consist of exactly one HTML file, one CSS file inside a `css/` directory, and one JavaScript file inside a `js/` directory.
