const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
	userID: String,
	projectID: String,
	message:[{
		data: String
	}, { timestamps: true }]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
