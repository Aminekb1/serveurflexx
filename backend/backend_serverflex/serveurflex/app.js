var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http =require("http");
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRouter');
//var ressourceRoute = require('./routes/ressourceRoute');
const ressourceRoute = require('./routes/ressourceRoute');
var osRouter = require("./routes/osRouter");
var commandeRoute = require('./routes/commandeRoute');
var factureRoute = require('./routes/factureRouter');
//var panierRoute = require('./routes/panierRoute');
//var catalogueRoute = require('./routes/catalogueRoute');
var notificationRoute = require('./routes/notificationRoute');
var statsRoute = require('./routes/statsRoute');
const authMiddleware = require('./middlewares/auth');
/*const cors = require("cors");
const session = require("express-session"); //session */

const { connectToMongoDB } = require("./db/db");
require("dotenv").config(); // configuration .env
var app = express();
// Middleware CORS (ajoutez cette section)
app.use(cors({
  origin: 'http://localhost:5173', // Autorise seulement ce domaine
  credentials: true, // Permet les cookies et l'authentification
  //methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes autorisées
  //allowedHeaders: ['Content-Type', 'Authorization'] // En-têtes autorisés
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/os", osRouter);
app.use('/ressource/removeResourceFromClient', authMiddleware);
app.use('/ressource', ressourceRoute);
app.use('/commandes', commandeRoute);
app.use('/factures', factureRoute);
app.use('/stats', statsRoute);
//app.use('/paniers', panierRoute);
//app.use('/catalogues', catalogueRoute);

app.use('/notifications', notificationRoute);

//const osController = require(" .. /Controllers/osController")
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`✅ Backend lancé sur http://localhost:${PORT}`);
});





