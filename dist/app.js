"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createError = require("http-errors");
const express = require("express");
const index_1 = require("./routes/index");
const app = express();
app.use("/", index_1.default);
app.use("/claims", index_1.default);
// app.use("/waves/:waveId/:tokenId", indexRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log("here");
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 500);
    res.send(err.message);
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
exports.default = app;
