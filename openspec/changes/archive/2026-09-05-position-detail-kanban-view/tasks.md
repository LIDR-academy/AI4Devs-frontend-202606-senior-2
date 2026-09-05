## 1. Data fetching

- [x] 1.1 In `Position.tsx`, fetch `GET http://localhost:3010/position/:id/interviewflow` and `GET http://localhost:3010/position/:id/candidates` in parallel on mount using `fetch`, and verify both responses are read via the browser (Network tab / console) when visiting `/positions/1`
- [x] 1.2 Add loading state (shown while either request is in flight) and error state (shown if either request fails), and verify by throttling/blocking one request and confirming the loading indicator shows, then the error message on failure

## 2. Header

- [x] 2.1 Render the position title (`positionName`) near the top of the page, and a back control next to it that navigates to `/positions`, and verify both in the browser

## 3. Columns and cards

- [x] 3.1 Render one column per `interviewFlow.interviewSteps`, ordered by `orderIndex`, labeled with the step's `name`, styled as a light-gray panel with a bold header — verify column count/order/labels match a seeded position's interview flow
- [x] 3.2 Group candidates under the column whose `name` matches their `currentInterviewStep`, rendering each as a white card with a soft shadow; keep `id` and `applicationId` in each candidate's state even though not displayed — verify with a seeded position that has candidates in more than one step
- [x] 3.3 On each card, show `fullName` in bold and `averageScore` as a row of filled dot/circle indicators — verify visually against the mockup for a few different score values (including 0)
- [x] 3.4 Verify an interview step with zero candidates still renders as an (empty) column

## 4. Responsive layout

- [x] 4.1 Make columns stack vertically at full width on a mobile-width viewport, and lay out side-by-side above that breakpoint — verify by resizing the browser / using device emulation
