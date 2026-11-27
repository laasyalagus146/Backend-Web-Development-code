
const sessionStore = require('../session/sessionStore');

module.exports = function requireSession(req, res, next) {
  const sessionId = req.signedCookies.sid;

  if (!sessionId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized'
      }
    });
  }

  const session = sessionStore.get(sessionId);

  if (!session) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized'
      }
    });
  }

  req.user = session.userId;
  req.sessionId = sessionId;

  next();
};
