"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createError = require("http-errors");
const express = require("express");
const index_1 = require("./routes/index");
const app = express();
app.use("/", index_1.default);
app.use("/waves/:waveId/:tokenId", index_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.send(`error ${err.status}`);
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
exports.default = app;
