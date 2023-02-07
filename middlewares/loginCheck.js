const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const { cookie } = req.headers;
  if (!cookie) {
    res.locals.user = false;
    next();
    return;
  }

  let [authType, authToken] = cookie.split('=');

  // 소셜로그인 인증
  if (authToken.includes('connect.sid')) {
    authToken = authToken.split(';')[0];
  }

  if (!authToken || authType !== 'accessToken') {
    res.locals.user = false;
    next();
    return;
  }
  try {
    const { userId } = jwt.verify(
      authToken,
      'my-secrect-key' //secretkey
    );

    User.findByPk(userId).then((user) => {
      res.locals.user = user;
      next();
    });
  } catch (error) {
    res.locals.user = false;
    next();
  }
};
