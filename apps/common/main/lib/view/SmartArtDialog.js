/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 * SPDX-License-Identifier: AGPL-3.0-only
 */
(function () {
    'use strict';

    // The same dialog is used by the AMD editors and the mobile React editors.
    function show(api, options) {
        var outline = api.asc_getSmartArtOutline && api.asc_getSmartArtOutline();
        if (!outline) return;
        var labels = Object.assign({
            title: 'Edit SmartArt', add: 'Add node', remove: 'Remove branch',
            up: 'Move up', down: 'Move down', indent: 'Demote', outdent: 'Promote',
            assistant: 'Assistant', apply: 'Apply', cancel: 'Cancel',
            error: 'The diagram could not be updated. This layout may require fewer nodes or a different hierarchy. Check that the diagram is still selected and editable.',
            changed: 'The diagram changed while you were editing. Close this dialog and reopen it to load the latest version.',
            node: 'Node'
        }, options && options.labels);
        var nodes = outline.nodes.map(function (node) { return Object.assign({}, node); });
        if (!nodes.length) nodes.push({text: '', depth: 0, assistant: false});
        var selected = 0;
        var dialog = document.createElement('dialog');
        var nativeDialog = typeof dialog.showModal === 'function';
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
        var previousFocus = document.activeElement;
        var notifications = window.Common && Common.NotificationCenter;
        var modalState = window.Common && Common.Utils && Common.Utils.ModalWindow;
        var modal = {isVisible: function () { return !closed; }};
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-label', labels.title);
        dialog.style.cssText = 'width:600px;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);padding:20px;border:1px solid var(--border-regular,#888);border-radius:8px;background:var(--background-normal,#fff);color:var(--text-normal,#222);font:inherit;box-sizing:border-box;';
        var title = document.createElement('h2');
        title.textContent = labels.title;
        title.style.cssText = 'font-size:18px;margin:0 0 16px;';
        var toolbar = document.createElement('div');
        toolbar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;';
        var rows = document.createElement('div');
        rows.style.cssText = 'max-height:50vh;overflow:auto;';
        var status = document.createElement('p');
        status.setAttribute('role', 'alert');
        var footer = document.createElement('div');
        footer.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:12px;';
        var controls = {};
        var busy = false;
        var closed = false;
        function finish() {
            if (closed) return;
            closed = true;
            dialog.remove();
            overlay.remove();
            if (notifications) {
                notifications.trigger('modal:hide', modal);
                notifications.trigger('modal:close', modal, !modalState || !modalState.isVisible());
            }
            api.asc_enableKeyEvents(!modalState || !modalState.isVisible());
            if (previousFocus && previousFocus.isConnected) previousFocus.focus();
            if (options && options.onClose) options.onClose();
        }
        function close() {
            if (nativeDialog) dialog.close();
            finish();
        }
        function button(parent, name, action) {
            var element = document.createElement('button');
            element.type = 'button';
            element.textContent = labels[name];
            element.style.cssText = 'padding:6px 10px;min-height:32px;border:1px solid var(--border-regular,#aaa);border-radius:4px;background:var(--background-normal,#fff);color:inherit;cursor:pointer;font:inherit;';
            element.addEventListener('click', action);
            parent.appendChild(element);
            return element;
        }
        function end(index) {
            var next = index + 1;
            while (next < nodes.length && nodes[next].depth > nodes[index].depth) ++next;
            return next;
        }
        function previous() {
            for (var i = selected - 1; i >= 0; --i) {
                if (nodes[i].depth <= nodes[selected].depth) return nodes[i].depth === nodes[selected].depth ? i : -1;
            }
            return -1;
        }
        function updateControls() {
            controls.remove.disabled = selected < 0 || end(selected) - selected === nodes.length;
            controls.up.disabled = selected < 0 || previous() < 0;
            controls.down.disabled = selected < 0 || end(selected) === nodes.length || nodes[end(selected)].depth !== nodes[selected].depth;
            controls.indent.disabled = selected < 0 || previous() < 0;
            controls.outdent.disabled = selected < 0 || nodes[selected].depth === 0;
            controls.assistant.disabled = selected < 0;
            controls.assistant.setAttribute('aria-pressed', String(selected >= 0 && !!nodes[selected].assistant));
        }
        function render() {
            rows.textContent = '';
            nodes.forEach(function (node, index) {
                var row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;margin:6px 0;';
                row.style['paddingInlineStart' in row.style ? 'paddingInlineStart' : 'paddingLeft'] = (node.depth * 20) + 'px';
                var label = document.createElement('label');
                label.textContent = (index + 1) + (node.assistant ? ' *' : '');
                var input = document.createElement('textarea');
                input.id = 'smartart-outline-node-' + index;
                label.htmlFor = input.id;
                input.setAttribute('aria-label', labels.node + ' ' + (index + 1));
                input.value = node.text;
                input.rows = 2;
                input.style.cssText = 'width:100%;min-width:60px;padding:6px;resize:vertical;border:1px solid var(--border-regular,#aaa);border-radius:4px;background:var(--background-normal,#fff);color:inherit;font:inherit;';
                input.addEventListener('input', function () { node.text = input.value; status.textContent = ''; });
                input.addEventListener('focus', function () { selected = index; updateControls(); });
                row.appendChild(label);
                row.appendChild(input);
                rows.appendChild(row);
            });
            updateControls();
            var input = rows.querySelectorAll('textarea')[selected];
            if (input) input.focus();
        }
        controls.add = button(toolbar, 'add', function () {
            var next = end(selected);
            nodes.splice(next, 0, {text: '', depth: nodes[selected].depth, assistant: false});
            selected = next;
            render();
        });
        controls.remove = button(toolbar, 'remove', function () {
            nodes.splice(selected, end(selected) - selected);
            selected = Math.min(selected, nodes.length - 1);
            render();
        });
        controls.up = button(toolbar, 'up', function () {
            var position = previous();
            var branch = nodes.splice(selected, end(selected) - selected);
            nodes.splice.apply(nodes, [position, 0].concat(branch));
            selected = position;
            render();
        });
        controls.down = button(toolbar, 'down', function () {
            var next = end(selected);
            var position = end(next);
            var branch = nodes.splice(selected, next - selected);
            selected = position - branch.length;
            nodes.splice.apply(nodes, [selected, 0].concat(branch));
            render();
        });
        controls.indent = button(toolbar, 'indent', function () {
            var last = end(selected);
            for (var i = selected; i < last; ++i) ++nodes[i].depth;
            render();
        });
        controls.outdent = button(toolbar, 'outdent', function () {
            var parent = selected - 1;
            while (nodes[parent].depth >= nodes[selected].depth) --parent;
            var position = end(parent);
            var branch = nodes.splice(selected, end(selected) - selected);
            branch.forEach(function (node) { --node.depth; });
            selected = position - branch.length;
            nodes.splice.apply(nodes, [selected, 0].concat(branch));
            render();
        });
        controls.assistant = button(toolbar, 'assistant', function () {
            nodes[selected].assistant = !nodes[selected].assistant;
            render();
        });
        button(footer, 'cancel', close);
        button(footer, 'apply', async function () {
            busy = true;
            Array.from(dialog.querySelectorAll('button, textarea')).forEach(function (element) { element.disabled = true; });
            try {
                if (await api.asc_setSmartArtOutline(outline.id, nodes, outline.nodes)) close();
                else status.textContent = JSON.stringify(api.asc_getSmartArtOutline()) === JSON.stringify(outline) ? labels.error : labels.changed;
            } catch (error) {
                status.textContent = labels.error;
                console.error('SmartArt editing failed', error);
            } finally {
                busy = false;
                Array.from(dialog.querySelectorAll('button, textarea')).forEach(function (element) { element.disabled = false; });
                updateControls();
            }
        });
        [title, toolbar, rows, status, footer].forEach(function (element) { dialog.appendChild(element); });
        dialog.addEventListener('cancel', function (event) {
            event.preventDefault();
            if (!busy) close();
        });
        dialog.addEventListener('close', finish, {once: true});
        dialog.addEventListener('keydown', function (event) {
            if (nativeDialog) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                if (!busy) close();
            } else if (event.key === 'Tab') {
                var focusable = Array.from(dialog.querySelectorAll('button, textarea')).filter(function (element) { return !element.disabled; });
                var next = event.shiftKey ? focusable[focusable.length - 1] : focusable[0];
                var boundary = event.shiftKey ? focusable[0] : focusable[focusable.length - 1];
                if (next && document.activeElement === boundary) {
                    event.preventDefault();
                    next.focus();
                }
            }
        });
        if (nativeDialog) {
            document.body.appendChild(dialog);
            dialog.showModal();
        } else {
            dialog.style.display = 'block';
            dialog.style.position = 'relative';
            dialog.setAttribute('open', '');
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
        }
        if (notifications) notifications.trigger('modal:show', modal);
        api.asc_enableKeyEvents(false);
        render();
    }

    window['OnlyOfficeSmartArtDialog'] = show;
    if (typeof define === 'function' && define.amd) {
        define([], function () { return show; });
    }
})();
