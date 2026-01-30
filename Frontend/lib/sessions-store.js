const TRANSIENT_STATUSES = new Set([
  "QR",
  "LOADING",
  "SYNCING",
  "CONNECTING",
  "AUTHENTICATED",
]);

function mergeSessions(previous = [], incoming = []) {
  const incomingMap = new Map(incoming.map((session) => [session.id, session]));
  const merged = [];

  previous.forEach((session) => {
    const updated = incomingMap.get(session.id);
    if (updated) {
      merged.push({ ...session, ...updated });
      incomingMap.delete(session.id);
      return;
    }

    if (TRANSIENT_STATUSES.has(session.status)) {
      merged.push(session);
    }
  });

  incomingMap.forEach((session) => {
    merged.push(session);
  });

  return merged;
}

module.exports = {
  mergeSessions,
  TRANSIENT_STATUSES,
};
