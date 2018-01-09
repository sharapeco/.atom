function init() {
	console.log("siteinit.js loaded.");

	// https://github.com/aki77/atom-input-dialog
	const MiniBuffer = require("../js/sharapeco/mini-buffer");

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

	user.defun("atom-text-editor", "user:filter-buffer", () => {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}
		let buffer = editor.getBuffer();
		let content = buffer.getText();

		let dialog = new MiniBuffer({
			historyName: "filter-buffer",
			labelText: "Filter buffer:",
			callback: (command) => {
				filterByCommand(command, content, (filtered) => {
					buffer.setText(filtered);
					editor.element.focus();
					editor.scrollToCursorPosition();
				}, (code) => {
					atom.notifications.addFatalError("Command \"" + command + "\" exited with code " + code);
				});
			}
		});
		dialog.attach();
	});

	user.defun("atom-text-editor", "user:filter-region", () => {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}
		let selections = editor.getSelections();
		var completeCount = 0;

		let dialog = new MiniBuffer({
			historyName: "filter-buffer",
			labelText: "Filter region:",
			callback: (command) => {
				selections.forEach((selection) => {
					filterByCommand(command, selection.getText(), (filtered) => {
						selection.insertText(filtered);
						completeCount++;
						if (completeCount >= selections.length) {
							editor.element.focus();
							editor.scrollToCursorPosition();
						}
					}, (code) => {
						atom.notifications.addFatalError("Command \"" + command + "\" exited with code " + code);
					});
				})
			}
		});
		dialog.attach();
	});

	function filterByCommand(command, content, callback, errorCallback) {
		var args = parseCommandArguments(command);
		let cmd = args.shift();

		const { spawn }  = require("child_process");
		const proc = spawn(cmd, args);

		var buf = "";

		proc.stdout.on("data", (data) => {
			buf += String(data);
		});

		proc.on("exit", (code) => {
			if (code === 0) {
				callback(buf);
			} else {
				errorCallback(code);
			}
		});

		proc.stdin.setEncoding("UTF-8");
		proc.stdin.write(content);
		proc.stdin.end();
	}

	/**
	* コマンドライン引数を bash のように展開する
	* スペースやシングルクォートを含む文字列を渡したいときはシングルクォートで囲ってね
	* バックスラッシュによるエスケープはシングルクォート以外知らん
	**/
	function parseCommandArguments(command) {
		var args = [];
		var quote = false;
		var partial;
		command.split(/ /).forEach((seg) => {
			if (quote === false) {
				if (/^'/.test(seg)) {
					if (/'$/.test(seg) && !/\\'$/.test(seg)) {
						args.push(seg.substring(1, seg.length - 1));
					} else {
						quote = true;
						partial = seg.substr(1).replace(/\\'/g, "'") + " ";
					}
				} else if (seg !== "") {
					args.push(seg);
				}
			} else {
				if (/'$/.test(seg) && !/\\'$/.test(seg)) {
					quote = false;
					partial += seg.substr(0, seg.length - 1).replace(/\\'/g, "'");
					args.push(partial);
				} else {
					partial += seg.replace(/\\'/g, "'") + " ";
				}
			}
		});
		if (quote) {
			throw new Error("Unterminated command arguments");
		}
		return args;
	}

}

exports.init = init;
