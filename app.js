import createError from 'http-errors';
import { MulterError } from 'multer';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import indexRouter from './routes/index';
import headers from './middlewares/headers';

const app = express();

// view engine setup
app.use(headers);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

  if (err instanceof MulterError) {
    err.message = 'images error';
    err.status = err.status || 409;
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
