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
/**
 *    app.js
 *
 *    Created on 17 July 2017
 *
 */

'use strict';
var reqerr;
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    baseUrl: '../../',
    paths: {
        jquery          : '../vendor/jquery/jquery',
        underscore      : '../vendor/underscore/underscore',
        xregexp         : '../vendor/xregexp/xregexp-all-min',
        socketio        : '../vendor/socketio/socket.io.min',
        allfonts        : '../../sdkjs/common/AllFonts'
    },
    shim: {
        sdk: {
            deps: [
                'jquery',
                'underscore',
                'allfonts',
                'xregexp',
                'socketio'
            ]
        }
    }
});


require([
    'underscore',
    'socketio',
    'xregexp',
], function (_) {
    window._ = _

    var _msg_func = function(msg) {
        var data = msg.data, cmd;

        try {
            cmd = window.JSON.parse(data)
        } catch(e) {}

        if ( cmd ) {
            if ( cmd.type == 'file:open' ) {
                load_document(cmd.data);
            }
        }
    };

    if ( window.attachEvent )
        window.attachEvent('onmessage', _msg_func); else
        window.addEventListener('message', _msg_func, false);

    var lang = (/(?:&|^)lang=([^&]+)&?/i).exec(window.location.search.substring(1));
    lang = lang && lang[1] ? lang[1].split(/[\-\_]/)[0].toLowerCase() : '';

    var api = new Asc.asc_docs_api({
        'id-view'  : 'editor_sdk',
        using      : 'reporter',
        skin       : localStorage.getItem("ui-theme-id"),
        'isRtlInterface': lang && (lang.lastIndexOf('ar', 0) === 0 || lang.lastIndexOf('he', 0) === 0)
    });

    var setDocumentTitle = function(title) {
        (title) && (window.document.title += (' - ' + title));
    };

    function load_document(data) {
        var docInfo = {};

        if ( data ) {
            docInfo = new Asc.asc_CDocInfo();
            docInfo.put_Id(data.key);
            docInfo.put_Url(data.url);
            docInfo.put_DirectUrl(data.directUrl);
            docInfo.put_Title(data.title);
            docInfo.put_Format(data.fileType);
            docInfo.put_VKey(data.vkey);
            docInfo.put_Options(data.options);
            docInfo.put_Token(data.token);
            docInfo.put_Permissions(data.permissions || {});
            setDocumentTitle(data.title);
        }

        api.preloadReporter(data);
        api.SetThemesPath("../../../../sdkjs/slide/themes/");
        api.asc_setDocInfo( docInfo );
        api.asc_getEditorPermissions();
        api.asc_setViewMode(true);
    }

    var onDocumentContentReady = function() {
        api.SetDrawingFreeze(false);
        $('#loading-mask').hide().remove();
    };

    var onOpenDocument = function(progress) {
        var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
        console.log('progress: ' + proc);
    };

    var onEditorPermissions = function(params) {
        api.asc_LoadDocument();
    };

    api.asc_registerCallback('asc_onDocumentContentReady', onDocumentContentReady);
    // api.asc_registerCallback('asc_onOpenDocumentProgress', onOpenDocument);
    api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);

    window.postMessage('i:am:ready', '*');

}, function(err) {
    if (err.requireType == 'timeout' && !reqerr && window.requireTimeourError) {
        reqerr = window.requireTimeourError();
        window.alert(reqerr);
        window.location.reload();
    }
});