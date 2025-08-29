// Middleware kiểm tra đăng nhập bằng session
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Bạn cần đăng nhập.' });
}

module.exports = requireLogin;
