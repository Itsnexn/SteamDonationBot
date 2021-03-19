console.log('\n============================\n')
console.log('SteamDonationBot')
console.log('   A better way to manage your steam trades')
console.log('\n Author :')
console.log('   https://github.com/Itsnexn\n')
console.log('============================')

// Some require librarys :)
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config.json'); // Load the config file

// Set some good vars to make work easyer
const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});

// Some options for Logon
const logOnOptions = {
	accountName: config.username,
	password: config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

//Some setting for after Logon
client.logOn(logOnOptions);
client.on('loggedOn', () => {
    console.log('\n============================\n');
	console.log('succesfully logged on.\n');
    console.log('============================');
	client.setPersona(SteamUser.EPersonaState.Online) // Set user status to online
});

// I set a massage for test a bot :)
client.on('friendMessage', function (steamID, message) {
	if (message == '!bot') {
		client.chatMessage(steamID, 'hello, this works.');
	}
});

// Cookies settings
client.on('webSession', (sessionid, cookies) => {
	manager.setCookies(cookies);

	community.setCookies(cookies);
	community.startConfirmationChecker(20000, config.identitySecret);
});

// Accept offer fanction
function acceptOffer(offer) {
	offer.accept((err) => {
		community.checkConfirmations();
		console.log('We Accepted an offer');
		if (err) console.log('There was an error accepting the offer.');
	});
}

// Aecline offer if it want item from us
function declineOffer(offer) {
	offer.decline((err) => {
        console.log('\n============================\n');
		console.log('We Declined an scammer offer\n');
        console.log('============================');
		if (err) // Check for error
            console.log('\n============================\n')
            console.log('There was an error declining the offer.\n');
            console.log('============================')
	});
}

client.setOption('promptSteamGuardCode', false);
// Accept trade if id === to owner id ...
manager.on('newOffer', (offer) => {
	if (offer.partner.getSteamID64() === config.ownerID) {
		acceptOffer(offer); // Accept if its = to ownerid
	} else {
		declineOffer(offer); // Decline if isnt
	}

});
