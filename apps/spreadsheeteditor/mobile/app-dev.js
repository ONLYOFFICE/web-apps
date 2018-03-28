/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  app.js
 *
 *  Created by Maxim Kadushkin on 11/14/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

'use strict';
var reqerr;
require.config({
    baseUrl: '../../',
    paths: {
        jquery          : '../vendor/jquery/jquery',
        underscore      : '../vendor/underscore/underscore',
        backbone        : '../vendor/backbone/backbone',
        framework7      : '../vendor/framework7/js/framework7',
        text            : '../vendor/requirejs-text/text',
        xregexp         : '../vendor/xregexp/xregexp-all-min',
        sockjs          : '../vendor/sockjs/sockjs.min',
        jszip           : '../vendor/jszip/jszip.min',
        jsziputils      : '../vendor/jszip-utils/jszip-utils.min',
        api             : 'api/documents/api',
        core            : 'common/main/lib/core/application',
        extendes        : 'common/mobile/utils/extendes',
        notification    : 'common/main/lib/core/NotificationCenter',
        analytics       : 'common/Analytics',
        gateway         : 'common/Gateway',
        locale          : 'common/locale',
        irregularstack  : 'common/IrregularStack',
        sharedsettings  : 'common/mobile/utils/SharedSettings'
    },

    shim: {
        framework7: {
            exports: 'Framework7'
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        core: {
            deps: [
                'backbone',
                'notification',
                'irregularstack',
                'sharedsettings'
            ]
        }
    }
});

require([
    'backbone',
    'framework7',
    'core',
    'underscore',
    'extendes',
    'api',
    'analytics',
    'gateway',
    'locale',
    'jszip',
    'jsziputils',
    'sockjs'
], function (Backbone, Framework7) {
    Backbone.history.start();

    /**
     * Application instance with SSE namespace defined
     */
    var app = new Backbone.Application({
        nameSpace: 'SSE',
        autoCreate: false,
        controllers : [
            'Editor',
            'Toolbar',
            'Search',
            'CellEditor',
            'Main',
            'DocumentHolder'
            ,'Statusbar'
            ,'Settings'
            ,'EditContainer'
            ,'EditCell'
            ,'EditText'
            ,'EditImage'
            ,'EditShape'
            ,'EditChart'
            ,'EditHyperlink'
            ,'AddContainer'
            ,'AddChart'
            ,'AddFunction'
            ,'AddShape'
            ,'AddOther'
            ,'AddLink'
        ]
    });

    Common.Locale.apply();

    var device = Framework7.prototype.device;
    var loadPlatformCss = function (filename, opt){
        var fileref = document.createElement('link');
        fileref.setAttribute('rel', 'stylesheet');
        fileref.setAttribute('type', 'text/css');
        fileref.setAttribute('href', filename);

        if (typeof fileref != 'undefined') {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    };

    //Store Framework7 initialized instance for easy access
    window.uiApp = new Framework7({
        // Default title for modals
        modalTitle: 'ONLYOFFICE',

        // Enable tap hold events
        tapHold: true,

        // If it is webapp, we can enable hash navigation:
//        pushState: false,

        // If Android
        material: device.android,

        // Hide and show indicator during ajax requests
        onAjaxStart: function (xhr) {
            uiApp.showIndicator();
        },
        onAjaxComplete: function (xhr) {
            uiApp.hideIndicator();
        }
    });

    //Export DOM7 to local variable to make it easy accessable
    window.$$ = Dom7;

    //Load platform styles
    loadPlatformCss('resources/css/app-' + (device.android ? 'material' : 'ios') + '.css');

    require([
        'common/main/lib/util/LocalStorage',
        'common/main/lib/util/utils',
        'spreadsheeteditor/mobile/app/controller/Editor',
        'spreadsheeteditor/mobile/app/controller/Toolbar',
        'spreadsheeteditor/mobile/app/controller/Search',
        'spreadsheeteditor/mobile/app/controller/Main',
        'spreadsheeteditor/mobile/app/controller/DocumentHolder'
        ,'spreadsheeteditor/mobile/app/controller/CellEditor'
        ,'spreadsheeteditor/mobile/app/controller/Statusbar'
        ,'spreadsheeteditor/mobile/app/controller/Settings'
        ,'spreadsheeteditor/mobile/app/controller/edit/EditContainer'
        ,'spreadsheeteditor/mobile/app/controller/edit/EditCell'
        ,'spreadsheeteditor/mobile/app/controller/edit/EditText'
        ,'spreadsheeteditor/mobile/app/controller/edit/EditImage'
        ,'spreadsheeteditor/mobile/app/controller/edit/EditShape'
        ,'spreadsheeteditor/mobile/app/controller/edit/EditChart'
        ,'spreadsheeteditor/mobile/app/controller/edit/EditHyperlink'
        ,'spreadsheeteditor/mobile/app/controller/add/AddContainer'
        ,'spreadsheeteditor/mobile/app/controller/add/AddChart'
        ,'spreadsheeteditor/mobile/app/controller/add/AddFunction'
        ,'spreadsheeteditor/mobile/app/controller/add/AddShape'
        ,'spreadsheeteditor/mobile/app/controller/add/AddOther'
        ,'spreadsheeteditor/mobile/app/controller/add/AddLink'
    ], function() {
        window.compareVersions = true;
        app.start();
    });
}, function(err) {
    if (err.requireType == 'timeout' && !reqerr && window.requireTimeourError) {
        reqerr = window.requireTimeourError();
        window.alert(reqerr);
        window.location.reload();
    }
});