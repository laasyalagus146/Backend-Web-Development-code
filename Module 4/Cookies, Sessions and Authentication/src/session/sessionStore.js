
const sessionStore = new Map();

module.exports = {
  create: (sessionId, sessionData) => {
    sessionStore.set(sessionId, sessionData);
  },

  get: (sessionId) => {
    const session = sessionStore.get(sessionId);

    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      sessionStore.delete(sessionId);
      return null;
    }

    return session;
  },

  destroy: (sessionId) => {
    sessionStore.delete(sessionId);
  }
};
