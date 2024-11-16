const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).json({ msg: 'Unauthorized. Please log in first.' });
  };
  
  const ensureAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ msg: 'Forbidden. Admins only.' });
  };
  
  module.exports = { ensureAuthenticated, ensureAdmin };