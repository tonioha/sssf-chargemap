module.exports = (app, httpPort) => {
  app.enable('trust proxy');

  app.use ((req, res, next) => {
     if (req.secure) {
         next();
     }  else {
         console.log('redirecting to https...');
         res.redirect(`https://${req.headers.host}${req.url}`);
     }
  });

  app.listen(httpPort, () => console.log(`app listening on port ${httpPort}`));
};