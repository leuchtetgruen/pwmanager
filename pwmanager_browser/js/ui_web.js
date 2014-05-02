var WebUI = {
	onLoad : function() {
		App.screens = [$('#loginScreen'), $('#passwordList'), $('#detailScreen')];

		var dropTarget = document.getElementById("dropTarget");
		dropTarget.ondragover = function () { 
			this.className = 'hover'; 
			return false; 
		};

		dropTarget.ondragend = function () { 
			this.className = ''; 
			return false; 
		};

		dropTarget.ondragleave = function () {
			this.className = ''; 
			return false; 
		};

		dropTarget.ondrop = function(e) {
			this.className = '';
			$('#uploadState').removeClass("fa-download").addClass("fa-keyboard-o");
			e.preventDefault();

			App.passwordFile = e.dataTransfer.files[0];
			$('#step1Text').text("Step 2");
			$('#password').attr("placeholder", "Now enter your password").focus();

			return false;
		};


		$('#password').keypress(function(e) {
			if (e.which == 13) {
				WebUI.loadSelectedPasswordFile();
			}
		});


		$('#search-button').click(function() {
			$('#search').toggleClass('hidden');
			if (!$('#search').hasClass('hidden')) {
				$('#search').focus();
			}
		});

		$('#search').keyup(function(e) {
			var filter = $('#search').val();
			if (filter.length == 0) {
				WebUI.displayPasswords(App.loadedPasswords, true);
				return;
			}

			pair_passwords = _.pairs(App.loadedPasswords);
			filtered_pairs = _.filter(pair_passwords, function(key_value_array) {
				return (key_value_array[0].toLowerCase().indexOf(filter) != -1);
			});
			matching_passwords = _.object(filtered_pairs);
			WebUI.displayPasswords(matching_passwords, true);
		});


		$('#backToPasswordList').click(function() {
			WebUI.displayPasswords(App.loadedPasswords);
		});

		App.showScreen("loginScreen");
	},


	loadFile : function(fileObject, callback) {
		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			var text = fileReader.result;
			callback(text);
		}
		try {
			fileReader.readAsText(fileObject, "utf-8");
		}
		catch (e) {
			console.log(e);
			WebUI.showError("File invalid");
			return;
		}
	},

	// UI Methods

	loadSelectedPasswordFile : function() {
		WebUI.loadFile(App.passwordFile, function(fileContents) {
			App.loadJSON(fileContents, $('#password').val(), function(decryptedHash) {
				App.loadedPasswords = decryptedHash;
				WebUI.displayPasswords(App.loadedPasswords);
			});;
		});
	},


	showError : function(text) {
		console.log("ShowError ->" + text);
		$('#dropTarget').addClass('error');
		$('#uploadState').removeClass('fa-download').removeClass('fa-keyboard-o').addClass('fa-exclamation-triangle');
		$('#step1Text').text(text);
	},

	displayPasswords : function(passwords, keepState) {
		App.showScreen("passwordList");
		//$('#loginScreen').addClass("hidden");
		//$('#detailScreen').addClass("hidden");
		//$('#passwordList').removeClass("hidden");
		$('#passwords_table td').remove();
		console.log(keepState);
		if ((keepState==undefined) || (keepState==false)) {
			$('#search').val("");
			$('#search').addClass("hidden");
		}


		var table = $('#passwords_table');

		_.each(passwords, function(value, key) {
			var tr = $('<tr/>').appendTo(table);

			var tdName = $('<td/>').text(key).appendTo(tr);

			var tdFunctions = $('<td/>').appendTo(tr);
			var iDetails = $('<i/>').addClass("fa").addClass("fa-chevron-right").appendTo(tdFunctions);


			var clickHandler = function() {
				WebUI.showPassword(key, value);
			};

			tdName.click(clickHandler);
			iDetails.click(clickHandler);
		});
	},

	showPassword : function(name, password) {
		App.showScreen("detailScreen");
		//$('#loginScreen').addClass("hidden");
		//$('#passwordList').addClass("hidden");
		//$('#detailScreen').removeClass("hidden");

		$('#passwordNameTitle').text(name);
		$('#passwordValue').text(password);

		$('#passwordValue').off('click');
		WebUI.maskPassword($('#passwordValue'), password);
		$('#passwordValue').click(function() {
			WebUI.toggleMasking($(this), password);
		});

		$('#copyPassword').off('click');
		$('#copyPassword').click(function() {
			WebUI.copyToClipboard(password);
		});

	},

	toggleMasking : function(element, clearText) {
		if (element.attr("masked")=="yes") {
			WebUI.unmaskPassword(element, clearText);
		}
		else {
			WebUI.maskPassword(element, clearText);
		}
	},

	maskPassword : function(element, clearText) {
		text = _.map(clearText.split(""), function() { return "●"; }).join("");
		element.text(text);
		element.attr("masked", "yes");
	},

	unmaskPassword : function (element, clearText) {
		element.text(clearText);
		element.attr("masked", "no");
	},

	copyToClipboard : function(text) {
		prompt("Copy the password using (Cmd|Ctrl)+C", text);
	}
};
