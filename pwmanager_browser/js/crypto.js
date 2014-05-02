var Crypto = {
	FILTER_KEYS : ["iv", "description", "cipher", "keygen", "version", "salt_length"],
	MY_VERSION  : 2,
	DESCRIPTION : "This JSON file contains Base64-Representations of AES-256-CBC-encrypted passwords. There is a salt appended to the passwords before encrypting them. The length of the salt is included in the SALT_LENGTH field. The IV is contained base64-encoded in this file. The key is the SHA256-Digest of your master-password.",
	CIPHER_STR : "AES-256-CBC",
	KEY_GENERATION_STR : "SHA256",

	DESIRED_SALT_LENGTH : 10,
	decrypt : function(base64EncodedEncryptedString, key, iv, salt_length) {
		try {
			encrypted = CryptoJS.enc.Base64.parse(base64EncodedEncryptedString.replace("\n", ""));
			decrypted = CryptoJS.AES.decrypt(
					{
						ciphertext: encrypted
					},
					key,
					{ 
						iv: iv,
				  mode: CryptoJS.mode.CBC,
				  padding: CryptoJS.pad.Pkcs7,
				  format: CryptoJS.format.OpenSSL
					});

			decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
		}
		catch (e) {
			showError("Invalid password");
			return false;
		}


		if (salt_length > 0) {
			decryptedString = decryptedString.substring(0, decryptedString.length - salt_length);
		}
		return decryptedString;
	},

	encrypt : function(originalText, password, iv) {
		var saltedString = originalText + Crypto.randomString(Crypto.DESIRED_SALT_LENGTH, true);


		var key =  Crypto.passwordToKey(password);

		try {
			var encrypted = CryptoJS.AES.encrypt(saltedString, key, {iv: iv});
			return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
		} catch (e) {
			console.log(e);
		}
	},

	encryptHash : function(hash, password) {
		var iv = CryptoJS.lib.WordArray.random(16);

		pair_passwords = _.pairs(hash);
		encrypted_pairs = _.map(pair_passwords, function(key_value_array) {
			return [
			key_value_array[0],
				Crypto.encrypt(key_value_array[1], password, iv)
			];
		});
		encrypted_hash = _.object(encrypted_pairs);
		encrypted_hash["iv"] = iv.toString(CryptoJS.enc.Base64);
		encrypted_hash["description"] = Crypto.DESCRIPTION;
		encrypted_hash["cipher"] = Crypto.CIPHER_STR;
		encrypted_hash["keygen"] = Crypto.KEY_GENERATION_STR;
		encrypted_hash["version"] = Crypto.MY_VERSION;
		encrypted_hash["salt_length"] = Crypto.DESIRED_SALT_LENGTH;

		return encrypted_hash;
	},


	decryptHash : function(data, password) {
		shaKey = CryptoJS.SHA256(password);
		iv = CryptoJS.enc.Base64.parse(data['iv']);
		salt_length = data['salt_length'];

		_.each(Crypto.FILTER_KEYS, function(key) {
			delete data[key];
		});


		foundError = false;
		_.each(data, function(value, key) {
			decrypted = Crypto.decrypt(value, shaKey, iv, salt_length);
			if (!decrypted) {
				foundError = true;
				return;
			}
			else data[key] = decrypted;
		});


		return data;
	},


	passwordToKey : function(password) {
		return CryptoJS.SHA256(password);
	},
	randomString : function(length, specialChars) {
		var passwordChars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
		'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
		'0','1','2','3','4','5','6','7','8','9',

		];

		var specialChars = ['!', '$', '%', '&', '?', '+', '*', '#', '-', '_', '.'];

		var myRange = specialChars ? _.union(passwordChars, specialChars) : passwordChars;
		return _.map(_.range(length), function(value) {
			var index = Math.floor(Math.random() * myRange.length);
			return myRange[index];

		}).join("");

	}


};
