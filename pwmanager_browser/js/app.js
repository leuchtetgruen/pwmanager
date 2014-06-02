var App = {
	passwordFile : null,
	password : null,
	loadedPasswords : {},
	screens : [],

	loadJSON : function(text, password, callback) {
		obj = JSON.parse(text);
		ver = obj['version'];
		if (ver > Crypto.MY_VERSION) {
			alert("Version in File (" + ver + " is newer than " + Crypto.MY_VERSION + ". \n Aborting.");
			return;
		} else if (ver < Crypto.MY_VERSION) {
			console.log("The file you are using is old. it uses version " + ver + ". this is version " + Crypto.MY_VERSION);
		}

		all_passwords = Crypto.decryptHash(obj, password);
		callback(all_passwords);
	},

	showScreen : function(id) {
		_.each(App.screens, function(screen) {
			if (screen.attr("id") != id) {
				screen.addClass("hidden");
			}
		});

		$('#' + id).removeClass("hidden");
	},

};
