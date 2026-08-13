/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { List, ListItem } from 'framework7-react';
import { getUserColor } from '../../../utils/getUserColor.js';

Common.MentionUsers = new (function () {
    let started = false,
        isLoading = false,
        canRequestUsers = false;

    function init(_canRequestUsers) {
        if (started) return;
        started = true;
        canRequestUsers = !!_canRequestUsers;
        if (!canRequestUsers) return;

        Common.Gateway.on('setusers', function (data) {
            if (!data || data.c !== 'mention') return;
            isLoading = false;
            Common.Notifications.trigger('mentions:setusers', data.users || [], data.isPaginated);
        });
    }

    function get(from, count, search) {
        if (!canRequestUsers || isLoading) return;
        isLoading = true;
        Common.Gateway.requestUsers('mention', undefined, from || 0, count || 100, search || '');
    }

    return {
        init: init,
        get: get,
        isEnabled: function () { return canRequestUsers; }
    };
})();

function findWordBoundary(value, start) {
    let left = 0,
        right = value.length - 1;
    for (let i = start - 1; i >= 0; i--) {
        if (value.charCodeAt(i) === 32 || value.charCodeAt(i) === 13 || value.charCodeAt(i) === 10 || value.charCodeAt(i) === 9) { left = i + 1; break; }
    }
    for (let i = start; i <= right; i++) {
        if (value.charCodeAt(i) === 32 || value.charCodeAt(i) === 13 || value.charCodeAt(i) === 10 || value.charCodeAt(i) === 9) { right = i - 1; break; }
    }
    return { left: left, right: right };
}

function getInitials(name) {
    const fio = (name || '').split(' ');
    let initials = fio[0] ? fio[0].substring(0, 1).toUpperCase() : '';
    for (let i = fio.length-1; i>0; i--) {
        if (fio[i] && fio[i][0] !== '(' && fio[i][0] !== ')') {
            initials += fio[i].substring(0, 1).toUpperCase();
            break;
        }
    }
    return initials;
}

function filterUsers(users, str) {
    if (str && str.length > 0) {
        str = str.toLowerCase();
        users = users.filter(function (item) {
            if (item.email && 0 === item.email.toLowerCase().indexOf(str)) return true;

            let arr = item.name ? item.name.toLowerCase().split(' ') : [],
                inName = false;
            for (let i=0; i<arr.length; i++) {
                if (0 === arr[i].indexOf(str)) {
                    inName = true;
                    break;
                }
            }
            return inName;
        });
    }
    return users;
}

function caretOffset(textarea, position) {
    const computed = window.getComputedStyle(textarea),
        mirror = document.createElement('div'),
        style = mirror.style;

    style.position = 'absolute';
    style.visibility = 'hidden';
    style.top = '0';
    style.left = '-9999px';
    style.whiteSpace = 'pre-wrap';
    style.overflowWrap = 'break-word';
    style.width = computed.width;

    mirror.textContent = textarea.value.substring(0, position);

    const marker = document.createElement('span');
    marker.textContent = textarea.value.substring(position) || '.';
    mirror.appendChild(marker);

    document.body.appendChild(mirror);
    const top = marker.offsetTop,
        height = marker.offsetHeight;
    document.body.removeChild(mirror);

    return { top: top, height: height };
}

const preventFocus = (e) => e.preventDefault();

function MentionList({ users, onSelect, onScrollBottom }) {
    const listRef = useRef(null);

    useEffect(() => {
        const el = listRef.current && listRef.current.el;
        if (!el) return;

        const onScroll = function () {
            if (!onScrollBottom) return;
            const itemEl = el.querySelector('.mention-item'),
                itemHeight = itemEl ? itemEl.getBoundingClientRect().height : 0;
            if (itemHeight && el.scrollTop + el.clientHeight >= el.scrollHeight - itemHeight) onScrollBottom();
        };
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, [onScrollBottom]);

    let divider = false;
    const rows = [];
    users.forEach(function (user) {
        if (divider && !user.hasAccess) {
            divider = false;
            rows.push(<li key={'divider-' + user.email} className="mention-divider"></li>);
        }

        if (!user.email || !user.name) return;

        rows.push(
            <ListItem key={user.email} mediaList className="mention-item" title={user.name} subtitle={user.email} onClick={() => onSelect(user.email)}>
                {user.image ?
                    <img slot="media" className="mention-avatar" src={user.image} /> :
                    <div slot="media" className="mention-avatar" style={{backgroundColor: getUserColor(user.id)}}>{getInitials(user.name)}</div>}
            </ListItem>
        );

        if (user.hasAccess) divider = true;
    });

    return <List ref={listRef} className="mention-list" mediaList>{rows}</List>;
}

export function attachMention(textareaEl, options) {
    if (!textareaEl || !Common.MentionUsers.isEnabled()) {
        return { detach: function () {} };
    }

    options = options || {};

    let popupEl = null,
        root = null,
        users = [],
        debounceTimer = null,
        isMenuVisible = false,
        search = null;

    function createPopup() {
        if (popupEl) return;
        popupEl = document.createElement('div');
        popupEl.className = 'mention-popup';
        popupEl.addEventListener('mousedown', preventFocus);
        document.body.appendChild(popupEl);
        root = createRoot(popupEl);
    }

    function hideMenu() {
        isMenuVisible = false;
        search = null;
        if (popupEl) popupEl.style.display = 'none';
    }

    function positionMenu() {
        if (!isMenuVisible || !popupEl) return;

        const viewport = window.visualViewport,
            viewportWidth = viewport.width,
            viewportHeight = viewport.height;

        const rect = textareaEl.getBoundingClientRect(),
            caret = caretOffset(textareaEl, textareaEl.selectionStart),
            caretTop = rect.top - textareaEl.scrollTop + caret.top,
            caretBottom = caretTop + caret.height,
            width = Math.max(Math.min(rect.width, 500), 200);
        let left = rect.left;
        left = Math.min(left, viewportWidth - width - 16);
        left = Math.max(left, 16);

        const rowEl = popupEl.querySelector('.mention-item'),
            rows = popupEl.querySelectorAll('.mention-list > ul > li'),
            itemHeight = rowEl ? rowEl.getBoundingClientRect().height : 0,
            popupHeight = Math.min(rows.length, 3) * itemHeight,
            bottomSpace = viewportHeight - caretBottom,
            topSpace = caretTop;

        if (bottomSpace < popupHeight && topSpace < popupHeight) {
            popupEl.style.visibility = 'hidden';
            return;
        }

        let top;
        if (bottomSpace >= popupHeight) {
            top = caretBottom + 10;
        } else {
            top = caretTop - popupHeight - 10;
        }

        popupEl.style.visibility = '';
        popupEl.style.left = left + 'px';
        popupEl.style.top = top + 'px';
        popupEl.style.width = width + 'px';
    }

    function insertMention(email) {
        if (!search) return;
        const val = textareaEl.value,
            newVal = val.substring(0, search.left) + '+' + email + ' ' + val.substring(search.right + 1),
            caretPos = search.left + email.length + 2;

        textareaEl.value = newVal;
        options.onInsert && options.onInsert(newVal);

        hideMenu();

        setTimeout(function () {
            textareaEl.selectionStart = textareaEl.selectionEnd = caretPos;
        }, 10);
    }

    function requestNextPage() {
        if (!search || !search.isPaginated || search.requestMore === false) return;
        search.requestMore = false;
        search.from += search.count;
        Common.MentionUsers.get(search.from, search.count, search.query);
    }

    function renderUsers(list, replace) {
        createPopup();
        users = replace ? list : users.concat(list);

        root.render(<MentionList users={users} onSelect={insertMention} onScrollBottom={requestNextPage} />);

        if (users.length > 0) {
            isMenuVisible = true;
            popupEl.style.display = '';
            setTimeout(function () {
                if (replace) {
                    const listEl = popupEl.querySelector('.mention-list');
                    if (listEl) listEl.scrollTop = 0;
                }
                positionMenu();
            }, 0);
        } else {
            hideMenu();
        }
    }

    function onMentionUsers(list, isPaginated) {
        if (!search) return;

        search.isPaginated = isPaginated;
        search.requestMore = true;

        const replace = search.from === 0,
            isClientSearch = isPaginated === undefined,
            result = isClientSearch ? filterUsers(list || [], search.query) : (list || []);
        renderUsers(result, replace);
    }

    function showMenu(query, left, right) {
        search = { left: left, right: right, query: query, from: 0, count: 100, isPaginated: undefined, requestMore: true };
        Common.MentionUsers.get(0, 100, query);
    }

    function onInput() {
        clearTimeout(debounceTimer);

        const value = textareaEl.value,
            caret = textareaEl.selectionStart,
            boundary = findWordBoundary(value, caret),
            word = value.substring(boundary.left, boundary.right + 1),
            match = word.match(/^(?:[@]|[+](?!1))(\S*)/);

        if (match) {
            const query = match[1];
            debounceTimer = setTimeout(function () {
                showMenu(query, boundary.left, boundary.right);
            }, 300);
        } else {
            hideMenu();
        }
    }

    Common.Notifications.on('mentions:setusers', onMentionUsers);

    textareaEl.addEventListener('input', onInput);
    textareaEl.addEventListener('blur', hideMenu);
    textareaEl.addEventListener('click', hideMenu);
    textareaEl.addEventListener('touchend', hideMenu);

    window.addEventListener('resize', positionMenu);

    return {
        detach: function () {
            clearTimeout(debounceTimer);

            Common.Notifications.off('mentions:setusers', onMentionUsers);

            textareaEl.removeEventListener('input', onInput);
            textareaEl.removeEventListener('blur', hideMenu);
            textareaEl.removeEventListener('click', hideMenu);
            textareaEl.removeEventListener('touchend', hideMenu);

            window.removeEventListener('resize', positionMenu);

            if (root) root.unmount();
            if (popupEl) popupEl.removeEventListener('mousedown', preventFocus);
            if (popupEl && popupEl.parentNode) popupEl.parentNode.removeChild(popupEl);
            popupEl = null;
            root = null;
            users = [];
            search = null;
        }
    };
}

export const getMention = (storeAppOptions, _t, fallback) => {
    return (storeAppOptions && storeAppOptions.canRequestUsers) ? _t.textMention : fallback;
};