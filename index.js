require("dotenv").config();
const URL = require("url").URL;
const dns = require("node:dns").promises;
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

app.get("/api/shorturl/:url", function (req, res) {
	ShortenerUrl.findOne(
		{ shortened_url: req.params.url },
		function (err, data) {
			if (err) {
				res.json({ error: "invalid url" });
			} else {
				res.redirect(data.original_url);
			}
		}
	);
});

app.post("/api/shorturl", async function (req, res) {
	console.log(req.body.url);
	if (await isValidUrl(req.body.url)) {
		ShortenerUrl.findOne(
			{ original_url: req.body.url },
			function (err, doc) {
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
			}
		);
	} else {
		res.json({ error: "invalid url" });
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});

async function isValidUrl(urlString) {
	try {
		const url = new URL(urlString);
		let res = await dns.lookup(url.hostname);
		if (res) {
			return true;
		}
	} catch (error) {
		return false;
	}
}
