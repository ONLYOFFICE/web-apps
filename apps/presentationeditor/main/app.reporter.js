/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
*/
/**
 *    app.js
 *
 *    Created by Maxim.Kadushkin on 17 July 2017
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

'use strict';
var reqerr;
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    baseUrl: '../../',
    paths: {
        jquery          : '../vendor/jquery/jquery.min',
        underscore      : '../vendor/underscore/underscore-min',
        xregexp         : '../vendor/xregexp/xregexp-all-min',
        sockjs          : '../vendor/sockjs/sockjs.min',
        allfonts        : '../../sdkjs/common/AllFonts',
        sdk             : '../../sdkjs/slide/sdk-all-min'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        sdk: {
            deps: [
                'jquery',
                'underscore',
                'allfonts',
                'xregexp',
                'sockjs'
            ]
        }
    }
});

require([
    'sdk'
], function () {

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

    var api = new Asc.asc_docs_api({
        'id-view'  : 'editor_sdk',
        using      : 'reporter'
    });

    function load_document(data) {
        var docInfo = {};

        if ( data ) {
            docInfo = new Asc.asc_CDocInfo();
            docInfo.put_Id(data.key);
            docInfo.put_Url(data.url);
            docInfo.put_Title(data.title);
            docInfo.put_Format(data.fileType);
            docInfo.put_VKey(data.vkey);
            docInfo.put_Options(data.options);
            docInfo.put_Token(data.token);
            docInfo.put_Permissions(data.permissions || {});
            window.document.title = 'Presenter View' + (data.title ? (' - ' + data.title) : '');
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

	setTimeout(function(){
		// waiting for an event to be subscribed
		api.sendFromReporter('i:am:ready');
	}, 500);

}, function(err) {
    if (err.requireType == 'timeout' && !reqerr && window.requireTimeourError) {
        reqerr = window.requireTimeourError();
        window.alert(reqerr);
        window.location.reload();
    }
});