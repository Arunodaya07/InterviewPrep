# Security Specification — InterviewPrep Tracker

## 1. Data Invariants
1. **Strict Ownership Invariant**: Every document in `/users/{userId}`, `/quizResults/{resultId}`, `/aptitudeResults/{resultId}`, `/notes/{noteId}`, `/bookmarks/{bookmarkId}`, `/resumes/{resumeId}`, and `/interviews/{interviewId}` belongs exclusively to a single authenticated user (`request.auth.uid`) with `request.auth.token.email_verified == true`.
2. **PII Isolation Invariant**: `/users/{userId}` contains PII (`email`, `name`, `college`, `cgpa`) and may ONLY be read or written by the owner (`request.auth.uid == userId`). Blanket `isSignedIn()` reads or lists are strictly prohibited.
3. **Relational Integrity Invariant**: Every child/activity record (`quizResults`, `aptitudeResults`, `notes`, `bookmarks`, `resumes`, `interviews`) must verify on creation that `exists(/databases/$(database)/documents/users/$(request.auth.uid))` is true, preventing orphaned records without a parent profile.
4. **Temporal & Immutable Fields Invariant**: `createdAt` must equal `request.time` on creation and remain immutable on updates; `updatedAt` must equal `request.time` on both creation and update. `userId` and `firebaseUid` are immutable after creation.
5. **Query Enforcer Invariant**: Every `allow list` rule explicitly validates `resource.data.userId == request.auth.uid` on the server side; no client-side query delegation is permitted.
6. **Volumetric & Array Guard Invariant**: Every string has an explicit `.size() <= maxLength` bound matching `firebase-blueprint.json`, every ID is checked by `isValidId()`, and every array has a strict `.size() <= MAX` bound plus element type validation on index 0 when non-empty.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Shadow Field Injection on Profile Create)**: Includes an undeclared `"isAdmin": true` field in `/users/{userId}`. Rejected by `data.keys().hasOnly(...)`.
2. **Payload 2 (Identity Spoofing on QuizResult Create)**: Authenticated user `uid_A` attempts to create a `quizResults` document with `userId: "uid_B"`. Rejected by `data.userId == request.auth.uid`.
3. **Payload 3 (Unverified Email Write Attempt)**: User with `request.auth.token.email_verified == false` attempts to create `/users/{userId}`. Rejected by `isVerifiedUser()`.
4. **Payload 4 (PII Blanket Read Attack)**: Authenticated user `uid_A` attempts `get` on `/users/uid_B`. Rejected by `request.auth.uid == userId`.
5. **Payload 5 (Unscoped List Scraping on Notes)**: Authenticated user `uid_A` attempts `list` on `/notes` without filtering `userId == "uid_A"`. Rejected by `resource.data.userId == request.auth.uid`.
6. **Payload 6 (Orphaned Record Creation)**: Authenticated user `uid_A` who has not created `/users/uid_A` attempts to create `/notes/note_1`. Rejected by `exists(/databases/$(database)/documents/users/$(request.auth.uid))`.
7. **Payload 7 (ID Poisoning / Oversized Document ID)**: Attacker attempts to create `/notes/{200_char_malicious_id}`. Rejected by `isValidId(noteId)`.
8. **Payload 8 (Denial of Wallet / 1MB String Payload)**: Attacker sends a 50,000-character `content` string to `/notes/note_1`. Rejected by `data.content.size() <= 10000`.
9. **Payload 9 (Timestamp Forgery on Create)**: Client sends a forged past or future `createdAt` timestamp instead of `request.time`. Rejected by `incoming().createdAt == request.time`.
10. **Payload 10 (Immutable Field Mutation on Note Update)**: Owner attempts to mutate `createdAt` or `userId` during an update on `/notes/note_1`. Rejected by `affectedKeys().hasOnly(...)` and `incoming().createdAt == existing().createdAt`.
11. **Payload 11 (Value Poisoning on Update)**: Owner updates an allowed key `title` on `/notes/note_1` with a boolean `true` instead of a bounded string. Rejected because `isValidStudyNote(incoming())` wraps the entire `allow update` block.
12. **Payload 12 (Unbounded Array Injection on Profile Skills)**: Owner attempts to push 100 items into `skills` array on `/users/{userId}`. Rejected by `data.skills.size() <= 30`.
