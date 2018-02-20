//-- Modules
const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const history = require("connect-history-api-fallback");
const socketio = require("socket.io");
const simulator = require("./lib/simulator");
//-- Express initialization
const io = new socketio();
const app = express();
//-- Socket.io initialization
app.set("socketio", io);
simulator(io.of("/simulator"));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", require("./routes/api/scantron"));
app.use(
	history({
		verbose: true
	})
);
app.use(express.static(path.join(__dirname, "..", "build")));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === "development" ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
