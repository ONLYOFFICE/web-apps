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
function checkExtendedPDF(directUrl, key, url, token, callback) {
    //110 is not enough for the new PDF form    
    var limit = 300;
    if (directUrl) {
        downloadPartialy(directUrl, limit, null, function(text) {
            callback(isExtendedPDFFile(text))
        });
    } else {
        let postData = JSON.stringify({
            'url': url,
            "token": token
        });
        var handlerUrl = "../../../../downloadfile/"+encodeURIComponent(key);
        downloadPartialy(handlerUrl, limit, postData, function(text) {
            callback(isExtendedPDFFile(text))
        });
    }
}
function isExtendedPDFFile(text) {
    if (!text) {
        return false;
    }
    const indexFirst = text.indexOf('%\xCD\xCA\xD2\xA9\x0D');
    if (indexFirst === -1) {
        return false;
    }

    let pFirst = text.substring(indexFirst + 6);

    if (!(pFirst.lastIndexOf('1 0 obj\x0A<<\x0A', 0) === 0)) {
        return false;
    }

    pFirst = pFirst.substring(11);

    let signature = 'ONLYOFFICEFORM';
    const indexStream = pFirst.indexOf('stream\x0D\x0A');
    const indexMeta = pFirst.indexOf(signature);

    if (indexStream === -1 || indexMeta === -1 || indexStream < indexMeta) {
        return false;
    }

    let pMeta = pFirst.substring(indexMeta);
    pMeta = pMeta.substring(signature.length + 3);

    let indexMetaLast = pMeta.indexOf(' ');
    if (indexMetaLast === -1) {
        return false;
    }

    pMeta = pMeta.substring(indexMetaLast + 1);

    indexMetaLast = pMeta.indexOf(' ');
    if (indexMetaLast === -1) {
        return false;
    }

    return true;
}
function downloadPartialy(url, limit, postData, callback) {
    var callbackCalled = false;
    var xhr = new XMLHttpRequest();
    //value of responseText always has the current content received from the server, even if it's incomplete
    // xhr.responseType = "json"; it raises an IE error. bug 66160
    xhr.overrideMimeType('text/plain; charset=iso-8859-1');
    xhr.onreadystatechange = function () {
        if (callbackCalled) {
            return;
        }
        if (xhr.readyState === 4) {
            callbackCalled = true;
            callback(xhr.responseText);
        } else if (xhr.readyState === 3 && xhr.responseText.length >= limit) {
            callbackCalled = true;
            var res = xhr.responseText;
            xhr.abort();
            callback(res);
        }
    };
    let method = postData ? 'POST' : 'GET';
    xhr.open(method, url, true);
    xhr.setRequestHeader('Range', 'bytes=0-' + limit); // the bytes (incl.) you request
    xhr.send(postData);
}

var startCallback;
var eventFn = function(msg) {
    if (msg.origin !== window.parentOrigin && msg.origin !== window.location.origin && !(msg.origin==="null" && (window.parentOrigin==="file://" || window.location.origin==="file://"))) return;

    var data = msg.data;
    if (Object.prototype.toString.apply(data) !== '[object String]' || !window.JSON) {
        return;
    }
    try {
        data = window.JSON.parse(data)
    } catch(e) {
        data = '';
    }

    if (data && data.command==="checkParams") {
        data = data.data || {};
        checkExtendedPDF(data.directUrl, data.key, data.url, data.token, startCallback);
        _unbindWindowEvents();
    }
};

var _bindWindowEvents = function() {
    if (window.addEventListener) {
        window.addEventListener("message", eventFn, false)
    } else if (window.attachEvent) {
        window.attachEvent("onmessage", eventFn);
    }
};

var _unbindWindowEvents = function() {
    if (window.removeEventListener) {
        window.removeEventListener("message", eventFn)
    } else if (window.detachEvent) {
        window.detachEvent("onmessage", eventFn);
    }
};

function listenApiMsg(callback) {
    startCallback = callback;
    _bindWindowEvents();
}
