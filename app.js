import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import { MulterError } from 'multer';
import indexRouter from './routes/index';

const app = express();

// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
/* eslint-disable */

app.use((err, req, res, next) => {
  /* eslint-enable */

  // render the error page
  // err.status || 500
  if (err instanceof MulterError) {
    err.message = 'images error';
    err.status = 409;
  }
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message,
    stack: !err.status || err.status >= 500 ? err.stack : undefined,
    errors: err.errors,
  });
});

export default app;
