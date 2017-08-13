import * as express from 'express';
// import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as loaders from './src/schema/dataloaders';
import Schema from './src/schema/schema';
import * as GraphHTTP from 'express-graphql';

var app = express();
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(function(req, res, next) {

  res.header("Access-Control-Allow-Origin", "http://localhost:3000");

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "OPTIONS, POST, GET, PUT");

  if (req.method === 'OPTIONS') {
      res.status(200);
      return res.end();
  }
  next()
});

// app.use('/api', require('./routes/'));

import db from './src/db/models';

app.use('/graphql', GraphHTTP({
  schema: Schema,
  pretty: true,
  graphiql: true,
  context: { loaders }
}));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(4000, ()=> {
  console.log(`App listening on port 3000`);
});
