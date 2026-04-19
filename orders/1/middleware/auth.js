function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/account');
  }
  return next();
}

function requireUser(req, res, next) {
  if (!req.session || !req.session.userId) {
    const nextPath = encodeURIComponent(req.originalUrl || '/account');
    return res.redirect(`/login?next=${nextPath}`);
  }
  return next();
}

module.exports = { requireGuest, requireUser };
