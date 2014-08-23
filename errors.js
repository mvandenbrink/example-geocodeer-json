/**
 * Errors node file
 * 
 * Default error handling as Express middleware
 * 
 * 
 */

exports.log = function(err, req, res, next){
  console.error(err.stack);
  next(err);
};

exports.clientHandler = function(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: 'Unknown error' });
  } else {
    next(err);
  }
};

exports.serverHandler = function(err, req, res, next) {
  res.status(500);
  res.render('error', { error:err });
};