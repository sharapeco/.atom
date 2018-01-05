function init() {
	console.log("siteinit.js loaded.");

	user.defun("atom-text-editor", "user:test-command", function() {
		console.log("TEST");
	});

	user.defun("atom-text-editor", "user:insert-horizontal-bar", function() {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}
		editor.insertText("----------------------------------------------------------------");
	});

	user.defun("atom-text-editor", "user:insert-double-horizontal-bar", function() {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}
		editor.insertText("================================================================");
	});

	user.defun("atom-text-editor", "user:open-php-manual", function() {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}
		let word = editor.getWordUnderCursor().trim();
		if (word === "" || /[^0-9a-z_]/i.test(word)) {
			return;
		}
		let URL = "http://php.net/manual/ja/function." + word.replace(/_/g, "-");
		let shell = require("shell");
		shell.openExternal(URL);
	});
}

exports.init = init;
