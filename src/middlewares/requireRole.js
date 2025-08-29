// Middleware kiểm tra quyền truy cập
function requireRole(roles = []) {
  // roles: mảng role_id hoặc tên role
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập.' });
    }
    // Cho phép truyền role_id hoặc tên role
    if (roles.includes(req.session.user.role_id) || roles.includes(req.session.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
  };
}

module.exports = requireRole;
