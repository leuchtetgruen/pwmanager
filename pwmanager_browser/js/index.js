

function copyToClipboard(text) {
	if (runningOnNode()) {
		var gui = require('nw.gui');
		gui.Clipboard.get().set(text, 'text');

		var icon = $('#copyPasswordIcon');
		icon.removeClass("fa-copy").addClass("fa-check");
		window.setTimeout(function() {
			icon.addClass("fa-copy").removeClass("fa-check");
		}, 1000);
	}
	else {
		prompt("Copy the password using (Cmd|Ctrl)+C", text);
	}
}
