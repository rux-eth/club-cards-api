"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
const dotenv = require("dotenv");
const express = require("express");
const createError = require("http-errors");
const index_1 = require("./routes/index");
dotenv.config();
const app = express();
app.use('/', index_1.default);
// app.use('/claims', indexRouter);
app.use('/signature', index_1.default);
// app.use('/authFuncs', indexRouter);
// app.use("/waves/:waveId/:tokenId", indexRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});
// error handler
app.use((err, req, res, next) => {
    // render the error page
    res.status(err.status || 500);
    res.send(err.message);
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
exports.default = app;
