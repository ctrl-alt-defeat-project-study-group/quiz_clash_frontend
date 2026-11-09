| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| design.status | string | Proposed backend data model; not an implemented database. | Keep proposed fields distinct from verified implementation. |
| store.schemaVersion | integer | Proposed version of the JSON store structure. | Require a supported positive integer; migrate explicitly. |
| store.users | User array | Persisted user records; email login and profile fields are proposed. | Reject duplicate IDs and duplicate normalized login emails. |
| store.quizzes | Quiz array | Persisted quizzes with embedded questions and choices. | Validate every quiz and owner reference before committing. |
| store.attempts | Attempt array | Persisted completed solo attempts. | Validate user, quiz, version, and answer references. |
| store.requestKeys | RequestKey array | Proposed persisted retry-deduplication records. | Commit with the related resource; enforce composite uniqueness. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| User.id | string | Unique immutable user identifier. | Generate on the server; reject empty or duplicate IDs. |
| User.email | string | Proposed email login identifier. | Trim surrounding whitespace; validate format; normalize under a documented policy and enforce uniqueness. |
| User.displayName | string | Proposed public profile name. | Trim surrounding whitespace; reject blank values; preserve Unicode; escape when rendering. |
| User.passwordHash | string | Stored password hash. | Hash passwords on the server; never store plaintext or expose hashes in responses or logs. |
| User.createdAt | UTC timestamp string | Proposed account creation time. | Set on the server; use valid ISO 8601 UTC format. |
| User.updatedAt | UTC timestamp string | Proposed latest profile update time. | Set on the server; reject invalid timestamps and dates before creation. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| Quiz.id | string | Unique immutable quiz identifier. | Generate on the server; reject empty or duplicate IDs. |
| Quiz.ownerId | string reference | Owner of the quiz. | Set from authenticated identity; require an existing user; never trust client ownership. |
| Quiz.schemaVersion | integer | Quiz schema version; initially 1. | Require a supported positive integer. |
| Quiz.quizVersion | integer | Proposed immutable content version; initially 1. | Require a positive integer; preserve referenced content; create a new quiz ID for content changes in the initial model. |
| Quiz.title | string | Proposed library display title. | Trim surrounding whitespace; reject blank values; preserve Unicode; escape when rendering. |
| Quiz.category | string, optional | Proposed subject or filter label. | Trim whitespace; omit if blank; never use as an authorization field. |
| Quiz.source | object | Metadata describing the uploaded source. | Validate its fields; exclude raw file contents and extracted text from saved records. |
| Quiz.source.fileName | string, optional | Proposed display-only original filename. | Remove path components and control characters; never use as a storage path; escape when rendering. |
| Quiz.source.fileType | enum | Supported source format: pdf, docx, csv, or txt. | Normalize to lowercase; validate actual file format as well as extension; reject unsupported input. |
| Quiz.source.hash | string | Hash of the original file content. | Compute on the server using a fixed algorithm; validate encoding; do not enforce global uniqueness. |
| Quiz.generation | object | Generation provenance. | Validate required metadata; exclude provider credentials. |
| Quiz.generation.provider | string | Provider used to generate questions. | Require a nonempty configured provider identifier. |
| Quiz.generation.model | string | Model used to generate questions. | Require a nonempty identifier from server generation metadata. |
| Quiz.generation.promptVersion | string | Version of the generation prompt. | Require a nonempty version identifier supplied by the server. |
| Quiz.generation.createdAt | UTC timestamp string | Generation time used for creation sorting. | Set on the server; use valid ISO 8601 UTC format. |
| Quiz.questions | Question array | Ordered validated quiz questions. | Require a nonempty array within configured limits; reject duplicate question IDs; validate before marking ready. |
| Quiz.status | enum | Quiz state: ready or archived. | Reject other values; only validated quizzes become ready; preserve archived content referenced by history. |
| Quiz.updatedAt | UTC timestamp string | Proposed latest metadata or status update time. | Set on the server; validate ISO 8601 UTC format. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| Question.id | string | Stable identifier within its quiz. | Reject empty IDs and duplicates within the quiz; do not use array position as identity. |
| Question.prompt | string | Question text. | Trim outer whitespace; normalize line endings; reject blank text; preserve meaningful formatting and Unicode; escape on display. |
| Question.choices | Choice array | Ordered choices; four is a proposed pilot default. | Enforce configured choice count; reject blank or duplicate choice text after normalization; reject duplicate IDs. |
| Question.correctChoiceId | string reference | Private correct answer reference. | Require exactly one matching choice in the question; omit from playable responses before authorized reveal. |
| Choice.id | string | Stable identifier within its question. | Reject empty IDs and duplicates within the question. |
| Choice.text | string | Displayed answer choice. | Trim outer whitespace; normalize line endings; reject blank text; preserve Unicode; escape when rendering. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| Attempt.id | string | Unique completed solo attempt identifier. | Generate on the server; reject duplicate IDs. |
| Attempt.userId | string reference | Authenticated user who completed the attempt. | Require an existing user; set from authenticated identity. |
| Attempt.quizId | string reference | Quiz graded for this attempt. | Require an existing quiz owned by the user; verify access before grading. |
| Attempt.quizVersion | integer | Proposed version of the graded quiz. | Require the exact immutable version used for grading. |
| Attempt.quizTitleSnapshot | string | Proposed quiz title at completion. | Copy from the server quiz record; preserve after later quiz renames. |
| Attempt.mode | enum | Proposed persisted mode; solo initially. | Accept solo only; never import simulated multiplayer results as verified live results. |
| Attempt.answers | AttemptAnswer array | Submitted answers for a completed attempt. | Require one answer per quiz question; reject duplicates, omissions, and foreign questions. |
| Attempt.score | integer | Server-calculated number of correct answers. | Recalculate from saved quiz answers; require a value from zero through totalQuestions; ignore client scores. |
| Attempt.totalQuestions | integer | Proposed question count at completion. | Derive from the graded quiz; require a positive integer. |
| Attempt.completedAt | UTC timestamp string | Server completion time. | Set on the server; validate ISO 8601 UTC format. |
| AttemptAnswer.questionId | string reference | Question answered in the attempt. | Require membership in the referenced quiz version and uniqueness within the attempt. |
| AttemptAnswer.selectedChoiceId | string reference | Selected answer choice. | Require membership in the referenced question; reject invalid IDs rather than silently correcting them. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| RequestKey.ownerId | string reference | Authenticated requester; proposed deduplication record. | Require an existing user; recheck authorization on replay. |
| RequestKey.operation | enum | Operation: createQuiz or submitAttempt. | Reject unsupported values. |
| RequestKey.key | string | Client retry identifier. | Require a nonempty bounded value; enforce uniqueness with ownerId and operation; preserve exact value. |
| RequestKey.payloadHash | string | Server hash of canonical request inputs. | Include relevant quiz version, upload hash, and settings; reject reuse of a key with changed input. |
| RequestKey.resourceId | string reference | Committed quiz or attempt identifier. | Validate target type against operation; commit resource and request key together. |
| RequestKey.createdAt | UTC timestamp string | Commit time. | Set on the server; validate ISO 8601 UTC format. |
| RequestKey.expiresAt | UTC timestamp string | End of the configured deduplication window. | Require a time after creation; retention duration remains undecided. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| Room.id | string | Unique room identifier; room fields describe proposed in-memory state. | Generate on the server; never use PIN as primary identity; discard active room state on restart. |
| Room.hostId | string reference | Authenticated room host. | Require an existing user who owns the selected quiz; authorize host-only actions. |
| Room.quizId | string reference | Quiz selected for the room. | Require an accessible ready quiz when creating or starting the room. |
| Room.pin | string | Invitation code for joining the room. | Generate on the server; preserve leading zeros; enforce active-room uniqueness; length remains undecided. |
| Room.state | enum | Proposed lifecycle: lobby, active, finished, or closed. | Validate transitions on the server; reject actions incompatible with current state. |
| Room.quizSnapshot | Quiz object | Private quiz snapshot frozen when play starts. | Copy validated quiz content; keep immutable during play; never broadcast the full answer-bearing object. |
| Room.quizVersion | integer | Version frozen for the room. | Require a match with the quiz snapshot. |
| Room.scoringSettings | object | Scoring rules frozen for the room. | Validate configured settings before start; reject mid-game changes; formula and tie policy remain undecided. |
| Room.currentRoundId | string reference, nullable | Current round; null in the lobby. | Require a round belonging to this room when nonnull; allow at most one open round. |
| Room.players | Player array | Participants held in memory. | Reject duplicate player IDs; enforce configured capacity; guest policy remains undecided. |
| Room.rounds | Round array | Rounds and accepted answer evidence held in memory. | Validate unique round IDs, question membership, and legal round order. |
| Room.createdAt | UTC timestamp string | Room creation time. | Set on the server; validate ISO 8601 UTC format. |
| Room.expiresAt | UTC timestamp string | Configured room expiry time. | Require a time after creation; invalidate the PIN when the room closes or expires. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| Player.id | string | Stable room participant identifier; proposed in-memory field. | Generate on the server; preserve across socket reconnects; enforce uniqueness within the room. |
| Player.userId | string reference, nullable | Registered user link; guest allowance remains undecided. | Validate authenticated user when present; allow null only if guest participation is approved. |
| Player.displayName | string | Participant name shown in the room. | Trim surrounding whitespace; reject blank values; preserve Unicode; escape on display; never use as identity proof. |
| Player.joinedAt | UTC timestamp string | Server-recorded join time. | Set on the server; validate ISO 8601 UTC format. |
| Player.connectionState | enum | Proposed connection status: connected or disconnected. | Update from server connection events; never trust client claims of another player's state. |
| Player.resumeTokenHash | string | Hash of a proposed protected reconnect credential. | Generate a strong token on the server; store only its hash; never broadcast or log it. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| Round.id | string | Unique round identifier within the room; proposed in-memory field. | Generate on the server; reject duplicate IDs. |
| Round.questionId | string reference | Question used for the round. | Require membership in the frozen room quiz snapshot. |
| Round.state | enum | Proposed round state: open or closed. | Allow server-controlled transitions only; reject submissions after closure. |
| Round.openedAt | UTC timestamp string | Server round opening time. | Set on the server; validate ISO 8601 UTC format. |
| Round.deadlineAt | UTC timestamp string | Server answer deadline. | Derive from configured duration; require a time after opening; reject answers received after the deadline. |
| Round.answers | RoundAnswer array | Accepted participant answers. | Enforce one accepted answer per player per round; acknowledge identical retries without rescoring; reject changed retries. |

| column | data type | description | cleaning requirements |
|--------|-----------|-------------|-----------------------|
| RoundAnswer.playerId | string reference | Participant submitting the answer; proposed in-memory field. | Require membership in this room; bind to authenticated or protected participant identity. |
| RoundAnswer.selectedChoiceId | string reference | Choice selected for the round question. | Require membership in the current question; reject foreign-room, invalid-option, or late submissions. |
| RoundAnswer.receivedAt | UTC timestamp string | Server receipt time. | Set on the server; never accept a client-supplied authoritative timestamp. |
| RoundAnswer.responseTimeMs | integer | Server-measured answer response duration in milliseconds. | Derive using server timing; require a nonnegative duration within the round window. |
| RoundAnswer.isCorrect | boolean | Server grading result. | Compute against the frozen question's correctChoiceId; ignore client grading claims. |
| RoundAnswer.points | integer | Server-calculated round points. | Apply frozen scoring settings; require nonnegative integer points; compute leaderboard totals from accepted answers. |
