const passport = require('passport');
const Chat = require('../models/Chat');
var rp = require('request-promise');

/**
 * GET /project
 * Project panel page.
 */
 exports.getChatRoom = (req, res, next) => {

 	var options = {
 		uri: 'https://webchat.botframework.com/api/tokens',
 		qs: {
	        access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
	    },
	    headers: {
	    	'User-Agent': 'Request-Promise',
	    	'Authorization': 'BotConnector JItSpFSNGAE.cwA.hIw.m-mNk6g-d82knDYJn28aw_CMf4_VdDcl06Ge7VV4iyg'
	    },
	    json: true // Automatically parses the JSON string in the response
	};

	rp(options)
	.then(function (response) {
		res.render('chat/chat-room', {
			title: 'Chat Room',
			chatbotToken: response
		}); 
	})
	.catch(function (err) {
		console.log(err);
	});
};
