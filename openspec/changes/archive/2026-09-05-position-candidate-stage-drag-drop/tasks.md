## 1. Drag source and drop targets

- [x] 1.1 Make each candidate card `draggable` (except while it has an in-flight move), storing the dragged candidate's id on `dragstart`, and verify in the browser that a card can be picked up (cursor/drag image changes) and not the whole column
- [x] 1.2 Make each column a valid drop target (`onDragOver` with `preventDefault`) and handle `onDrop`, and verify dropping a card on a different column fires the drop handler (console log/breakpoint) with the right candidate id and target column

## 2. Persist the move

- [x] 2.1 On drop over a different column, call `PUT http://localhost:3010/candidates/:id` with `{ applicationId, currentInterviewStep: <target column's interviewStep id> }`, and verify the request in the Network tab has the right id/body for a couple of different source/target column pairs
- [x] 2.2 On drop over the same column the card is already in, verify no request is made
- [x] 2.3 On a successful response, update that candidate's `currentInterviewStep` in state to the target column's name, and verify the card visually moves to the target column
- [x] 2.4 On a failed response (e.g. temporarily point the request at a bad id/URL to force a failure), verify the card stays in its original column and an inline error is shown, and other cards/columns are unaffected

## 3. In-progress feedback

- [x] 3.1 While a candidate's move request is in flight, show a visible in-progress indication on that card (e.g. reduced opacity) and verify it clears once the request resolves (success or failure)
