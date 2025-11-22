const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

const optionalAuth = (req, res, next) => {
  res.locals.user = req.session.userId || null;
  next();
};

module.exports = {
  requireAuth,
  optionalAuth
};
