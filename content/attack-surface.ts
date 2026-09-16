/**
 * Threat model of PairCode's auth + realtime layer, as rendered by the
 * attack-surface map. Every edge is a trust-crossing flow with the STRIDE
 * threat it carries and the control that closes it.
 *
 * NOTE: written from the PairCode project notes plus standard practice.
 * Review each `control` / `controlDetail` against the actual code before
 * publishing — the map should only claim what the repository does.
 */

export type Zone = "untrusted" | "app" | "data";
export type Stride = "S" | "T" | "R" | "I" | "D" | "E";
export type Severity = "critical" | "serious" | "warning" | "good";

export type MapNode = {
  id: string;
  label: string;
  sub: string;
  zone: Zone;
  kind: "actor" | "service" | "store";
  summary: string;
};

export type MapEdge = {
  id: string;
  source: string;
  target: string;
  /** Short protocol/flow label shown on the edge. */
  flow: string;
  stride: Stride;
  severity: Severity;
  threat: string;
  ifMissing: string;
  control: string;
  controlDetail: string;
};

export const ZONES: Record<Zone, { label: string; hint: string }> = {
  untrusted: { label: "Untrusted", hint: "Anything the attacker fully controls" },
  app: { label: "Application", hint: "Node.js services behind the trust boundary" },
  data: { label: "Data", hint: "Stores that must never be reached without authorization" },
};

export const STRIDE: Record<Stride, string> = {
  S: "Spoofing",
  T: "Tampering",
  R: "Repudiation",
  I: "Information disclosure",
  D: "Denial of service",
  E: "Elevation of privilege",
};

export const nodes: MapNode[] = [
  {
    id: "browser",
    label: "Browser",
    sub: "React client",
    zone: "untrusted",
    kind: "actor",
    summary: "Runs on a machine I do not control. Every value it sends is attacker-controlled until validated server-side, including its own identity.",
  },
  {
    id: "attacker",
    label: "Attacker",
    sub: "Burp, curl, a script",
    zone: "untrusted",
    kind: "actor",
    summary: "Does not need the UI. Speaks HTTP and WebSocket directly, replays captured tokens, and reads every error message for hints.",
  },
  {
    id: "api",
    label: "REST API",
    sub: "Express · Zod schemas",
    zone: "app",
    kind: "service",
    summary: "Stateless. Trusts nothing from the request until the JWT signature and the CSRF token check out and the body passes its schema.",
  },
  {
    id: "auth",
    label: "Auth service",
    sub: "EdDSA issuer · Argon2id",
    zone: "app",
    kind: "service",
    summary: "Issues short-lived Ed25519 access tokens and rotating refresh tokens. The only component that ever sees a password.",
  },
  {
    id: "ws",
    label: "Realtime server",
    sub: "WebSocket · tickets",
    zone: "app",
    kind: "service",
    summary: "Long-lived connections carry identity from a single-use ticket redeemed at handshake. Every event is authorized on its own.",
  },
  {
    id: "rbac",
    label: "Authorization",
    sub: "Roles · deny by default",
    zone: "app",
    kind: "service",
    summary: "One function, called for every REST route and every socket event: who is this, which room, what role, is this action allowed.",
  },
  {
    id: "tokens",
    label: "Refresh-token families",
    sub: "Rotate · detect reuse",
    zone: "data",
    kind: "store",
    summary: "Each login starts a family. Every refresh rotates the token; presenting an old one revokes the entire family.",
  },
  {
    id: "users",
    label: "Credentials",
    sub: "Argon2id hashes",
    zone: "data",
    kind: "store",
    summary: "Memory-hard hashes with per-user salts. A dump of this table should be worth nothing.",
  },
  {
    id: "db",
    label: "PostgreSQL",
    sub: "Prisma · scoped queries",
    zone: "data",
    kind: "store",
    summary: "Rooms, documents, history. Reached only through parameterized queries scoped by the caller's identity.",
  },
];

export const edges: MapEdge[] = [
  {
    id: "login",
    source: "browser",
    target: "auth",
    flow: "POST /login",
    stride: "S",
    severity: "critical",
    threat: "Credential stuffing and account enumeration through login timing and error text.",
    ifMissing: "A leaked password list from another site becomes a working account list here.",
    control: "Argon2id hashing + generic failure responses",
    controlDetail: "Memory-hard hashing makes every offline guess expensive, and the login response does not distinguish an unknown user from a wrong password, so there is no oracle to enumerate accounts with.",
  },
  {
    id: "verify",
    source: "auth",
    target: "users",
    flow: "verify hash",
    stride: "I",
    severity: "serious",
    threat: "A database leak exposes reusable credentials.",
    ifMissing: "Fast or unsalted hashes turn a dump into cracked passwords within hours.",
    control: "Argon2id, per-user salt, no reversible storage",
    controlDetail: "Argon2id with a per-user salt and deliberately expensive parameters; nothing in the table can be turned back into a password at scale.",
  },
  {
    id: "refresh",
    source: "auth",
    target: "tokens",
    flow: "rotate refresh",
    stride: "R",
    severity: "critical",
    threat: "A stolen refresh token is replayed to mint new access tokens indefinitely.",
    ifMissing: "One XSS or one leaked device backup equals a permanent session.",
    control: "Rotating families with reuse detection",
    controlDetail: "Every refresh invalidates the presented token and issues a new one. If an already-used token shows up, the whole family is revoked and the user is logged out everywhere.",
  },
  {
    id: "bearer",
    source: "browser",
    target: "api",
    flow: "Bearer JWT",
    stride: "T",
    severity: "critical",
    threat: "Forged or algorithm-confused token accepted as a valid identity.",
    ifMissing: "alg=none or HS/RS confusion lets anyone write their own claims.",
    control: "Pinned EdDSA verification, claims validated",
    controlDetail: "The verifier only accepts Ed25519 signatures under the server's key — the alg header is never trusted — and iss, aud and exp are mandatory. Access tokens are short-lived; refresh handles the rest.",
  },
  {
    id: "csrf",
    source: "browser",
    target: "api",
    flow: "state-changing POST",
    stride: "T",
    severity: "serious",
    threat: "A cross-site page makes the browser fire authenticated requests.",
    ifMissing: "Any page the user visits can act as them.",
    control: "SameSite cookies + double-submit token + Origin check",
    controlDetail: "Cookies are HttpOnly and SameSite; state-changing requests must carry a CSRF token that only same-origin code can read, and the Origin header is checked against the allowed app origin.",
  },
  {
    id: "query",
    source: "api",
    target: "db",
    flow: "scoped query",
    stride: "E",
    severity: "critical",
    threat: "IDOR/BOLA: a client-supplied id reaches a query with no ownership check.",
    ifMissing: "Any logged-in user can read or edit any room by changing one number. This is what authzscan hunts.",
    control: "Every query scoped by the caller's identity",
    controlDetail: "Repository functions take the session user as a parameter and add it to the WHERE clause; there is no way to fetch a room by id alone. Prisma parameterizes everything, and Zod rejects malformed ids before they reach a query.",
  },
  {
    id: "ticket",
    source: "api",
    target: "ws",
    flow: "mint ticket",
    stride: "S",
    severity: "serious",
    threat: "A guessable or reusable ticket lets someone join a socket as another user.",
    ifMissing: "Capture one handshake and replay it forever.",
    control: "Single-use, short-lived, server-stored ticket",
    controlDetail: "The ticket is unguessable randomness bound to the user and room, stored server-side, expires quickly, and is deleted the moment it is redeemed.",
  },
  {
    id: "handshake",
    source: "browser",
    target: "ws",
    flow: "wss:// + ticket",
    stride: "S",
    severity: "serious",
    threat: "Cross-origin WebSocket hijacking (browsers do not enforce same-origin on sockets).",
    ifMissing: "Any site can open a socket that rides on the user's cookies.",
    control: "No cookies on the socket; identity comes from the ticket",
    controlDetail: "The handshake authenticates with the ticket only, checks the Origin header, and the connection carries the resolved identity afterwards, never a cookie.",
  },
  {
    id: "event",
    source: "ws",
    target: "rbac",
    flow: "authorize every event",
    stride: "E",
    severity: "critical",
    threat: "An editor emits an owner-only event and the server obeys.",
    ifMissing: "Roles exist in the UI only; the socket is a flat admin channel.",
    control: "Per-event server-side RBAC, deny by default",
    controlDetail: "Every message type maps to a required role; the check runs before the handler with the identity from the handshake, not from the payload.",
  },
  {
    id: "flood",
    source: "ws",
    target: "db",
    flow: "persist history",
    stride: "D",
    severity: "warning",
    threat: "One connection floods events or oversized payloads and starves the room.",
    ifMissing: "A single client can take the room, and the database, down.",
    control: "Per-connection limits and bounded payloads",
    controlDetail: "Each socket is limited in how fast and how large it can send; oversized frames are rejected before parsing, and history writes are buffered so one client cannot turn a burst into database load.",
  },
  {
    id: "attack-forge",
    source: "attacker",
    target: "api",
    flow: "forged requests",
    stride: "T",
    severity: "critical",
    threat: "Direct API calls with tampered ids, headers and tokens, bypassing the UI entirely.",
    ifMissing: "Client-side validation is the only validation.",
    control: "Server is the only place validation counts",
    controlDetail: "Nothing the client checked is trusted; schemas, signatures and ownership are all re-verified on every request.",
  },
  {
    id: "attack-socket",
    source: "attacker",
    target: "ws",
    flow: "replayed handshake",
    stride: "S",
    severity: "serious",
    threat: "A captured ticket or a socket opened from a hostile origin.",
    ifMissing: "Presence and typing indicators become a way to impersonate teammates.",
    control: "Ticket burns on first use; Origin allowlisted",
    controlDetail: "A replayed ticket fails because it no longer exists; a hostile origin never gets past the upgrade request.",
  },
];
