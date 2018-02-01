function init() {
	console.log("siteinit.js loaded.");

	user.defun("atom-text-editor", "user:test-command", function() {
		const editors = atom.workspace.getTextEditors();
		const infos = editors.map((e) => e.getLongTitle()).join("\n");
		editors.forEach((e) => {
			if (/table[.]sql/.test(e.getTitle())) {
				e.destroy();
			}
		});
		// console.log(infos);
	});

	user.defun("atom-workspace", "user:open-your-siteinit.js", function() {
		let path = require("path");
		let file = path.join(process.env.HOME, '.atom/siteinit.js');
		atom.workspace.open(file);
	});

	user.defun("atom-workspace", "user:open-your-project-file", function() {
		let path = require("path");
		let file = path.join(process.env.HOME, '.atom/projects.cson');
		atom.workspace.open(file);
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
		// let URL = "http://php.net/manual/ja/function." + word.replace(/_/g, "-");
		let URL = "https://www.google.co.jp/search?q=" + encodeURIComponent(word + " site:php.net") + "&btnI=I";
		require("shell").openExternal(URL);
	});

	user.defun("atom-text-editor", "user:open-mdn-manual", function() {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}
		// TODO: CSSのときにハイフンを含めて検索できるようにする
		let word = editor.getWordUnderCursor().trim();
		if (word === "" || /[^0-9a-z_-]/i.test(word)) {
			return;
		}
		let URL = "https://www.google.co.jp/search?q=" + encodeURIComponent(word + " site:developer.mozilla.org") + "&btnI=I";
		require("shell").openExternal(URL);
	});

}

exports.init = init;
