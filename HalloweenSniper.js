const Eris = require('eris');
const config = require('./config.js');

// Give bot the token
const bot = new Eris.Client(config.token, {
	disableEvents: config.disabledEvents,
});

// Asynchronous spam function. Choose a random channel, sends 'a' message, then deletes it.
const spammer = async (channelList) => {
	setInterval(function() {
		bot.createMessage(channelList[Math.floor(Math.random() * channelList.length)], 'a')
			.then(msg => msg.delete(1000));
	}, config.spamInterval);
};

// If config spam is true, enable spam
if(config.spam) {
	console.log('Will spam the server.');

	bot.once('connect', async () => {
		// If channels are specified, only spam in those.
		if(config.specChannel) {
			spammer(config.channelIds);
		}
		// If channels are not specified, find out which channels to spam in.
		else if(config.specServer) {
			// Wait 5 seconds to make sure channels are initialized, then find all channels in server
			// that the user has permission to send in.
			// This is dumb, but has to be done because of how Eris handles selfbots
			setTimeout(function() {
				for(let i = 0; i < config.serverIds.length; i++) {
					const guild = bot.guilds.get(config.serverIds[i]);
					guild.channels.forEach(function(channel) {
						if(channel.permissionsOf(bot.user.id).json['sendMessages'] && channel.type == 0) {
							config.channelIds.push(channel.id);
						}
					});
				}
				spammer(config.channelIds);
			}, 5000);
		}
		else {
			console.error('Cannot spam server without a server id or channel id.');
			process.exit(1);
		}
	});
}

bot.once('connect', () => {
	console.log('Bot started.');
});

// When a message is created
bot.on('messageCreate', (msg) => {
	// If message not sent by Trick'cord Treat bot, abort.
	if(msg.author.id != '755580145078632508') {
		return;
	}

	// If server specified, check to see that message is coming from that server.
	// If not, abort
	if(config.specServer) {
		if(!(config.serverIds.indexOf(msg.channel.guild.id) > -1)) {
			return;
		}
	}

	// Check the embed to determine which command is needed
	// Then send the command waitSet seconds after message is received
	const waitSet = (Math.random() * (config.maxWait - config.minWait) + config.minWait);

	if(msg.embeds[0].description.includes('treat')) {
		setTimeout(function() {
			bot.createMessage(msg.channel.id, config.treat);
		}, waitSet);
	}
	else if(msg.embeds[0].description.includes('trick')) {
		setTimeout(function() {
			bot.createMessage(msg.channel.id, config.trick);
		}, waitSet);
	}
});

// Get the bot to connect to Discord
bot.connect();