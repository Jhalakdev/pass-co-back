/**
 * Custom error handler
 * @param {*} error
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.errorHandler = (error, req, res, next) => {
    console.log(`'Error : ${error.message}`.bgRed);
    const status = res.statusCode || 500;
    res.status(status).json({ error: 'Internal Server Error' });
  };
  