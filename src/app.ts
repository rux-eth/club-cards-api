import * as createError from "http-errors";
import * as express from "express";
import indexRouter from "./routes/index";

const app = express();

app.use("/", indexRouter);
app.use("/claims", indexRouter);
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

export default app;
