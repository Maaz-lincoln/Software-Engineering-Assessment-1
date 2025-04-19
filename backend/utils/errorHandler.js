const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({ success: false, errors :message });
  };
  
  module.exports = handleError