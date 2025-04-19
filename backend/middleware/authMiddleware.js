const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
    return res.status(401).json({ success: false, errors: "Not Authorized" });
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ success: false, errors: "Not Authorized" });
  }
});


module.exports = protect