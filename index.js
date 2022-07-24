require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ShortenerUrl = require("./models/shortened_url");
// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", function () {
	console.log("Connected to database successfully...");
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
	console.log(req.body.url);
	ShortenerUrl.findOne({ original_url: req.body.url }, function (err, doc) {
		if (!doc) {
			var newUrl = new ShortenerUrl();
			newUrl.original_url = req.body.url;
			newUrl.shortened_url = Math.floor(Math.random() * 1000000);
			newUrl.save(function (err, doc) {
				console.log(doc);
				res.json({
					original_url: doc.original_url,
					short_url: doc.shortened_url,
				});
			});
		} else {
			res.json({
				original_url: doc.original_url,
				short_url: doc.shortened_url,
			});
		}
	});
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
