/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
"use strict";

const assert = require("assert");
const style = require("../main/app/view/FreeTextStyle");

function memoryStorage(initial) {
	const data = Object.assign({}, initial || {});
	return {
		data: data,
		getItem: function (key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
		setItem: function (key, value) { data[key] = value; }
	};
}
function settingsStore() {
	const data = {};
	return {
		data: data,
		get: function (key) { return data[key]; },
		set: function (key, value) { data[key] = value; }
	};
}

const CALLOUT = style.INTENT_CALLOUT;
const COMMENT = style.INTENT_COMMENT;
const FREE_TEXT = 2;

// 1. No saved preferences.
assert.strictEqual(style.read(memoryStorage(), CALLOUT), null);
assert.strictEqual(style.read(null, COMMENT, null), null);

// 2-4. Red border, white fill, then black 12 pt text. The next read is the insert style.
const storage = memoryStorage();
const settings = settingsStore();
let saved = style.write(storage, settings, CALLOUT, {stroke: {r: 255, g: 0, b: 0}, fill: {r: 255, g: 255, b: 255}});
assert.deepStrictEqual(saved.stroke, {r: 255, g: 0, b: 0});
assert.deepStrictEqual(saved.fill, {r: 255, g: 255, b: 255});
saved = style.write(storage, settings, CALLOUT, {textColor: {r: 0, g: 0, b: 0}, fontSize: 12});
assert.strictEqual(saved.fontSize, 12);
assert.deepStrictEqual(saved.textColor, {r: 0, g: 0, b: 0});
assert.deepStrictEqual(saved.stroke, {r: 255, g: 0, b: 0});
const inserted = style.read(storage, CALLOUT);
assert.strictEqual(inserted.fontSize, 12);
assert.deepStrictEqual(inserted.fill, {r: 255, g: 255, b: 255});

// 5-7. Content and geometry are not stored. A later preference change does not alter the snapshot.
assert.strictEqual(Object.prototype.hasOwnProperty.call(inserted, "contents"), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(inserted, "rect"), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(inserted, "callout"), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(inserted, "author"), false);
const snapshot = JSON.parse(JSON.stringify(inserted));
style.write(storage, settings, CALLOUT, {
	fontSize: 14,
	contents: "1",
	rect: [1, 2, 3, 4],
	callout: [0, 0, 1, 1, 2, 2],
	name: "annot-id",
	author: "someone"
});
assert.strictEqual(snapshot.fontSize, 12);
assert.strictEqual(style.read(storage, CALLOUT).fontSize, 14);
assert.strictEqual(Object.prototype.hasOwnProperty.call(style.read(storage, CALLOUT), "contents"), false);

// 8. Text comments keep a separate preference.
style.write(storage, settings, COMMENT, {stroke: {r: 0, g: 0, b: 255}, fontSize: 11, lineEnd: 4});
assert.deepStrictEqual(style.read(storage, COMMENT).stroke, {r: 0, g: 0, b: 255});
assert.strictEqual(style.read(storage, COMMENT).fontSize, 11);
assert.strictEqual(Object.prototype.hasOwnProperty.call(style.read(storage, COMMENT), "lineEnd"), false);
assert.strictEqual(style.read(storage, CALLOUT).fontSize, 14);
assert.notStrictEqual(style.storageKey(CALLOUT), style.storageKey(COMMENT));
assert.ok(style.storageKey(CALLOUT).indexOf("highlight") < 0);

// 9-10. Reload and another document use the same browser storage, not the file.
const reloaded = memoryStorage(storage.data);
assert.strictEqual(style.read(reloaded, CALLOUT).fontSize, 14);
assert.strictEqual(style.read(reloaded, COMMENT).fontSize, 11);
const keys = Object.keys(reloaded.data);
assert.deepStrictEqual(keys.sort(), [style.KEY_CALLOUT, style.KEY_COMMENT].sort());
keys.forEach(function (key) {
	assert.strictEqual(key.indexOf("doc"), -1);
	assert.strictEqual(key.indexOf("page"), -1);
});

// 11. Invalid storage falls back. Partial valid fields survive.
assert.strictEqual(style.read(memoryStorage({[style.KEY_CALLOUT]: "{"}), CALLOUT), null);
assert.strictEqual(style.read(memoryStorage({[style.KEY_CALLOUT]: "null"}), CALLOUT), null);
assert.strictEqual(style.write(storage, settings, CALLOUT, {fontSize: 0, opacity: 500, stroke: {r: 999, g: 0, b: 0}}), null);
const broken = memoryStorage({[style.KEY_COMMENT]: JSON.stringify({fontSize: "12", strokeWidth: 2, contents: "x"})});
assert.deepStrictEqual(style.read(broken, COMMENT), {strokeWidth: 2});

// 12. Other annotation types, selection, and init do not update preferences.
assert.strictEqual(style.intentForAnnot(1, null, FREE_TEXT), null);
assert.strictEqual(style.shouldRemember({editMode: true, annotType: "highlight"}), false);
assert.strictEqual(style.shouldRemember({editMode: true, annotType: "ink"}), false);
assert.strictEqual(style.shouldRemember({editMode: true, annotType: "freeText", fromSelection: true}), false);
assert.strictEqual(style.shouldRemember({editMode: true, annotType: "freeText", initializing: true}), false);
assert.strictEqual(style.intentForAnnot(FREE_TEXT, null, FREE_TEXT), COMMENT);
assert.strictEqual(style.intentForAnnot(FREE_TEXT, 3, FREE_TEXT), CALLOUT);

// 13. Stored style is what a later insert reads back after the storage is reopened.
const reopened = memoryStorage();
style.write(reopened, null, CALLOUT, {stroke: {r: 255, g: 0, b: 0}, fill: {r: 255, g: 255, b: 255}, fontSize: 12, textColor: {r: 0, g: 0, b: 0}});
assert.deepStrictEqual(style.read(memoryStorage(reopened.data), CALLOUT), {
	stroke: {r: 255, g: 0, b: 0},
	fill: {r: 255, g: 255, b: 255},
	fontSize: 12,
	textColor: {r: 0, g: 0, b: 0}
});

// 14-15. Selection is not a formatting edit. View-only cannot record or be treated as editable.
assert.strictEqual(style.shouldRemember({editMode: false, annotType: "freeText", fromSelection: false}), false);
assert.strictEqual(style.editorCanFormat(null), false);
assert.strictEqual(style.editorCanFormat({canModifyPdfAnnots: function () { return false; }, canEdit: function () { return true; }}), false);
assert.strictEqual(style.editorCanFormat({canModifyPdfAnnots: function () { return true; }}), true);
assert.strictEqual(style.editorCanFormat({canEdit: function () { return false; }}), false);

// Unavailable storage falls back to the in-memory settings, then to defaults.
const failing = {
	getItem: function () { throw new Error("blocked"); },
	setItem: function () { throw new Error("blocked"); }
};
const mem = settingsStore();
assert.deepStrictEqual(style.write(failing, mem, COMMENT, {fontFamily: "Arial", bold: true}), {fontFamily: "Arial", bold: true});
assert.deepStrictEqual(style.read(failing, COMMENT, mem), {fontFamily: "Arial", bold: true});
assert.strictEqual(style.pdfAlignFromInternal(1), 0);
assert.strictEqual(style.pdfAlignFromInternal(0), 2);

console.log("free-text-style.test.js ok");
