const cookie = require('cookie');

const cookieParser = (req, res, next) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  req.cookies = cookies;
  next();
};

module.exports = cookieParser;