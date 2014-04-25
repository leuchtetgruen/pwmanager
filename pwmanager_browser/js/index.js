var all_passwords   = {};
var FILTER_KEYS = ["iv", "description", "cipher", "keygen", "version", "salt_length"];
var MY_VERSION  = 2;



$(document).ready(function() {
	fileReader = new FileReader();


	$('#loadButton').click(function() {
		file = $('#password_file')[0].files[0];
		loadFile(file);
	});


	$('#search').keyup(function() {
		search = $('#search').val().toLowerCase();

		if (search.length < 1) {
			displayPasswords(all_passwords);
		}

		pair_passwords = _.pairs(all_passwords);
		filtered_pairs = _.filter(pair_passwords, function(key_value_array) {
			return (key_value_array[0].toLowerCase().indexOf(search) != -1);
		});
		matching_passwords = _.object(filtered_pairs);
		displayPasswords(matching_passwords);
	});

});


function loadFile(file) {
	fileReader.onload = function(e) {
		var text = fileReader.result;
		loadJSON(text);
	}
	fileReader.readAsText(file, "utf-8");
}


function loadJSON(text) {
	obj = JSON.parse(text);
	ver = obj['version'];
	if (ver > MY_VERSION) {
		alert("Version in File (" + ver + " is newer than " + MY_VERSION + ". \n Aborting.");
		return;
	} else if (ver < MY_VERSION) {
		console.log("The file you are using is old. it uses version " + ver + ". this is version " + MY_VERSION);
	}

	decrypt_hash(obj, $('#password').val());

}


function decrypt_hash(data, password) {
	shaKey = CryptoJS.SHA256(password);
	iv = CryptoJS.enc.Base64.parse(data['iv']);
	salt_length = data['salt_length'];

	_.each(FILTER_KEYS, function(key) {
		delete data[key];
	});


	_.each(data, function(value, key) {
		data[key] = decrypt(value, shaKey, iv, salt_length);
	});

	all_passwords = data;
	displayPasswords(all_passwords);
}

function decrypt(base64EncodedEncryptedString, key, iv, salt_length) {
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
		console.err(e);
	}


	if (salt_length > 0) {
		decryptedString = decryptedString.substring(0, decryptedString.length - salt_length);
	}
	return decryptedString;
}

function displayPasswords(passwords) {
	$('#passwords_table td').remove();

	var table = $('#passwords_table');

	_.each(passwords, function(value, key) {
		var tr = $('<tr/>').appendTo(table);

		var tdName = $('<td/>').text(key).appendTo(tr);

		var tdPassword = $('<td/>').appendTo(tr);
		var maskedText = _.map(value.split(""), function(e) { return "*" }).join("");
		var aPassword = $('<a/>').text(maskedText).attr("href", "#").appendTo(tdPassword);
		aPassword.attr("masked", "yes");
		aPassword.click(function() {
			if (aPassword.attr("masked")=="yes") {
				aPassword.text(value);
				aPassword.attr("masked", "no");
			} else {
				aPassword.text(_.map(value.split(""), function(e) { return "*" }).join(""));
				aPassword.attr("masked", "yes");
			}
		
		});


		var tdCopy = $('<td/>').appendTo(tr);
		var aCopy = $('<a/>').attr("href", "#").text("Copy").appendTo(tdCopy);
		aCopy.click(function() {
			window.prompt("Copy to clipboard: (Cmd|Ctrl)+C, Enter", value);
		});
	});
}