// Your init script
//
// Atom will evaluate this file each time a new window is opened. It is run
// after packages are loaded/activated and after the previous editor state
// has been restored.

var scriptId = 0;
var fnCache = {};

function reloadInitScript() {
	let srcFile = require.resolve("./siteinit"),
	destFile = srcFile.replace(/[.]js$/, "-cache/" + (scriptId + 1) + ".js");

	try {
		var fs = require("fs");
		let rs = fs.createReadStream(srcFile),
		ws = fs.createWriteStream(destFile);
		ws.on("close", () => {
			scriptId++;
			require("./siteinit-cache/" + scriptId).init();
		})
		rs.pipe(ws);
	} catch (error) {
		atom.notifications.addFatalError("Error on copying file to " + destFile);
	}
}

function defun(target, name, fn) {
	var fnKey = target + "\\" + name;
	if (!fnCache[fnKey]) {
		atom.commands.add(target, reffun(name, fnKey));
	}
	fnCache[fnKey] = fn;
}

function reffun(name, fnKey) {
	var cmd = {};
	cmd[name] = function() {
		fnCache[fnKey]();
	};
	return cmd;
}

Object.defineProperty(global, "user", {
	value: {
		defun: defun
	}
});

reloadInitScript();

atom.workspace.observeTextEditors(function(editor) {
	editor.onDidSave(function() {
		if (/[/\\][.]atom[/\\].+[.]js$/.test(editor.getPath())) {
			reloadInitScript();
		}
	});
});
