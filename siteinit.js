/** @babel */
/** @jsx etch.dom */

function init() {
	console.log("siteinit.js loaded.");

	let F = false;

	const etch = require("etch")

	class TestView {

		// ----------------------------------------------------------------
		// Lifecycle methods:

		constructor (props) {
			this.destroyed = false
			this.cursor = -1
			this.items = []

			props = props || {}
			Object.keys(props).forEach((key) => {
				this[key] = props[key]
			})

			etch.initialize(this)

			let CompositeDisposable = require("atom").CompositeDisposable
			this.disposables = new CompositeDisposable()
			this.disposables.add(atom.commands.add(this.element, {
				"core:move-up": () => { this.selectPrevious() },
				"core:move-down": () => { this.selectNext() },
				"core:move-to-top": () => { this.selectFirst() },
				"core:move-to-bottom": () => { this.selectLast() },
				"buffer-list:mark-as-save": () => { this.markAsSave() },
				"buffer-list:mark-as-delete": () => { this.markAsDelete() },
				"buffer-list:unmark": () => { this.unmark() },
				"buffer-list:execute": () => { this.execute() },
				"buffer-list:open-selected": () => { this.openItem() }
			}))
		}

		render () {
			let itemNodes = this.items.map((item) => {
				return (
					<div className={"buffer-list-item" + (item.selected ? " selected" : "") + (item.modified ? " modified" : "")}>
						<div className="buffer-list-marker">
							<span className={"save-mark icon icon-move-down text-info " + (item.saveMark ? "" : "hide")}></span>
							<span className={"delete-mark icon icon-remove-close text-warning " + (item.deleteMark ? "" : "hide")}></span>
						</div>
						<div className="buffer-list-name">{item.name}</div>
						<div className="buffer-list-path">{item.path}</div>
					</div>
				)
			})
			return (
				<div className="buffer-list pane-item" tabIndex="-1">
					<div className="buffer-list-content">
						<div className="buffer-list-items">
							{itemNodes}
						</div>
					</div>
					<div className="buffer-list-legend">
						<div className="buffer-list-legend-header">
							Marks:
						</div>
						<div className="buffer-list-legend-item">
							<span className="icon icon-move-down text-info"></span>
							<span>Save</span>
						</div>
						<div className="buffer-list-legend-item">
							<span className="icon icon-remove-close text-warning"></span>
							<span>Close buffer</span>
						</div>
					</div>
				</div>
			)
		}

		async update () {
			await etch.update(this)
		}

		async destroy () {
			this.destroyed = true
			this.disposables.dispose()

			await etch.destroy(this)
		}

		getTitle () {
			return "Buffer List"
		}

		getIconName () {
			return "list-unordered"
			// return "book"
		}

		getURI () {
			return this.URI
		}

		// ----------------------------------------------------------------
		// Application methods:

		initialize () {
			this.cursor = -1
			this.items = atom.workspace.getTextEditors().map((editor) => {
				return {
					selected: false,
					deleteMark: false,
					saveMark: false,
					name: editor.getTitle(),
					path: (editor.getPath() || "").replace(/^\/Users\/[^/]+\//, "~/"),
					modified: editor.isModified(),
					editor: editor
				}
			})
			this.update().done(() => {
				this.setCursor(0)
			})
		}

		setCursor (point) {
			if (point < 0 || point >= this.items.length) {
				return
			}
			if (this.cursor === point) {
				return
			}

			let prevItem = this.items[this.cursor]
			if (prevItem) {
				prevItem.selected = false
			}

			this.items[point].selected = true
			this.cursor = point

			this.update()
		}

		selectPrevious () {
			if (this.cursor > 0) {
				this.setCursor(this.cursor - 1)
			}
		}

		selectNext () {
			if (this.cursor < this.items.length - 1) {
				this.setCursor(this.cursor + 1)
			}
		}

		selectFirst () {
			this.setCursor(0)
		}

		selectLast () {
			this.setCursor(this.items.length - 1)
		}

		markAsSave () {
			const point = this.cursor
			if (point < 0 || point >= this.items.length) {
				return
			}

			const item = this.items[point]
			item.saveMark = true

			this.selectNext()
			this.update()
		}

		markAsDelete () {
			const point = this.cursor
			if (point < 0 || point >= this.items.length) {
				return
			}

			const item = this.items[point]
			item.deleteMark = true

			this.selectNext()
			this.update()
		}

		unmark () {
			const point = this.cursor
			if (point < 0 || point >= this.items.length) {
				return
			}

			const item = this.items[point]
			item.saveMark = false
			item.deleteMark = false

			this.selectNext()
			this.update()
		}

		execute () {
			const saveItems = this.items.filter((item) => item.saveMark)
			const deleteItems = this.items.filter((item) => item.deleteMark)

			saveItems.forEach((item) => {
				item.editor.save()
			})

			deleteItems.forEach((item) => {
				item.editor.destroy()
			})

			if (saveItems.length + deleteItems.length > 0) {
				this.initialize()
			}
		}

		openItem () {
			let item = this.items[this.cursor]
			if (!item) {
				return
			}
			atom.workspace.open(item.editor.getPath())
		}
	}

	const BufferListURI = "atom://buffer-list";
	let bufferListView;

	atom.workspace.addOpener((URI) => {
		if (URI === BufferListURI) {
			if (!bufferListView || bufferListView.destroyed) {
				bufferListView = new TestView({URI: BufferListURI});
			}
			return bufferListView;
		}
	});

	user.defun("atom-text-editor", "user:buffer-list", function() {
		atom.workspace.open(BufferListURI)
		.done((view) => {
			view.initialize();
		});
	})

	user.defun("atom-text-editor", "user:test-command", function() {
		if (!F) {
			return;
		}
		const SelectListView = require("atom-select-list");
		const listView = new SelectListView({
			items: atom.workspace.getTextEditors().map((editor) => {
				return {
					editor: editor,
					mark: null
				};
			}),
			elementForItem: (item) => {
				const li = document.createElement("li");
				const pl = document.createElement("div");
				pl.classList.add("primary-line", "no-icon");
				li.appendChild(pl);
				const sl = document.createElement("div");
				sl.classList.add("secondary-line", "no-icon");
				li.appendChild(sl);
				return li;
			},
			didConfirmSelection: (item) => {
				console.log("confirmed", item.editor.getName());
			},
			didCancelSelection: () => {
				console.log("cancelled");
			},
		});
		atom.workspaceView.append(listView)
		// editor.destroy();
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
