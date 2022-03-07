/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as createError from 'http-errors';
import indexRouter from './routes/index';

dotenv.config();
const app = express();

app.use(cors());
app.use('/', indexRouter);
// app.use('/claims', indexRouter);
app.use('/signature', indexRouter);
// app.use('/authFuncs', indexRouter);

// app.use("/waves/:waveId/:tokenId", indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // render the error page
    // console.log(err);
    res.status(err.status || 500).send(err.message || err);
});

const port = process.env.PORT || 3000;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

export default app;
