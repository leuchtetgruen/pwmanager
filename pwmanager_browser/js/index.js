var all_passwords   = {};
var FILTER_KEYS = ["iv", "description", "cipher", "keygen", "version", "salt_length"];
var MY_VERSION  = 2;
var passwordFile = null;



$(document).ready(function() {
	fileReader = new FileReader();

	var dropTarget = document.getElementById("dropTarget");
	dropTarget.ondragover = function () { this.className = 'hover'; return false; };
	dropTarget.ondragend = function () { this.className = ''; return false; };
	dropTarget.ondragleave = function () { this.className = ''; return false; };
	dropTarget.ondrop = function(e) {
		this.className = '';
		$('#uploadState').removeClass("fa-download").addClass("fa-keyboard-o");
		e.preventDefault();

		passwordFile = e.dataTransfer.files[0];
		$('#step1Text').text("Step 2");
		$('#password').attr("placeholder", "Now enter your password").focus();

		return false;
	};


	$('#password').keypress(function(e) {
		if (e.which == 13) {
			loadFile(passwordFile, $('#password').val());
		}
	});

	$('#search').keyup(function(e) {
		var filter = $('#search').val();
		if (filter.length == 0) {
			displayPasswords(all_passwords);
			return;
		}

		pair_passwords = _.pairs(all_passwords);
		filtered_pairs = _.filter(pair_passwords, function(key_value_array) {
			return (key_value_array[0].toLowerCase().indexOf(filter) != -1);
		});
		matching_passwords = _.object(filtered_pairs);
		displayPasswords(matching_passwords);
	});



});


function loadFile(file, password) {
	console.log(file);
	fileReader.onload = function(e) {
		var text = fileReader.result;
		loadJSON(text, password);
	}
	try {
		fileReader.readAsText(file, "utf-8");
	}
	catch (e) {
		console.log(e);
		showError("File invalid");
		return;
	}
}


function loadJSON(text, password) {
	obj = JSON.parse(text);
	console.log("Obj" + obj);
	ver = obj['version'];
	if (ver > MY_VERSION) {
		alert("Version in File (" + ver + " is newer than " + MY_VERSION + ". \n Aborting.");
		return;
	} else if (ver < MY_VERSION) {
		console.log("The file you are using is old. it uses version " + ver + ". this is version " + MY_VERSION);
	}

	decrypt_hash(obj, password);

}


function decrypt_hash(data, password) {
	shaKey = CryptoJS.SHA256(password);
	iv = CryptoJS.enc.Base64.parse(data['iv']);
	salt_length = data['salt_length'];

	_.each(FILTER_KEYS, function(key) {
		delete data[key];
	});


	foundError = false;
	_.each(data, function(value, key) {
		decrypted = decrypt(value, shaKey, iv, salt_length);
		if (!decrypted) {
			foundError = true;
			return;
		}
		else data[key] = decrypted;
	});


	if (!foundError) {
		all_passwords = data;
		displayPasswords(all_passwords);
	}
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
		showError("Invalid password");
		return false;
	}


	if (salt_length > 0) {
		decryptedString = decryptedString.substring(0, decryptedString.length - salt_length);
	}
	return decryptedString;
}

function showError(text) {
	console.log("ShowError ->" + text);
	$('#dropTarget').addClass('error');
	$('#uploadState').removeClass('fa-download').removeClass('fa-keyboard-o').addClass('fa-exclamation-triangle');
	$('#step1Text').text(text);
}

function displayPasswords(passwords) {
	$('#step1').addClass("hidden");
	$('#step2').removeClass("hidden");
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
		var iCopy = $('<i/>').addClass("fa").addClass("fa-copy").appendTo(tdCopy);
		iCopy.click(function() {
			window.prompt("Copy to clipboard: (Cmd|Ctrl)+C, Enter", value);
		});
	});
}
