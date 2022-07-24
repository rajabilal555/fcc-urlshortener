const mongoose = require("mongoose");

const ShortenerUrlSchema = new mongoose.Schema({
	original_url: {
		type: String,
		required: true,
		unique: true,
	},
	shortened_url: {
		type: Number,
		required: true,
		unique: true,
	},
});

const ShortenerUrl = mongoose.model("ShortenerUrl", ShortenerUrlSchema);

module.exports = ShortenerUrl;
