const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	adress: {
		type: String,
		required: true
	},
	price: String,
	action: {
		use: Boolean,
		types: String
	},
	rating: Number,
    likes: Number,
    coords: {
        lattitude: String,
        longitude: String
    },
	rooms: {
        bedrooms: Number,
        bathrooms: Number
    },
    mainImageUrl: String,
    sliderImages: [String],
    comments: [String]
})

const Home = mongoose.model('Home', homeSchema)

module.exports = { Home }