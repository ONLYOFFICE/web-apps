/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *    app.js
 *
 *    Created by Maxim Kadushkin on 21 March 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
        backbone        : '../vendor/backbone/backbone',
        bootstrap       : '../vendor/bootstrap/dist/js/bootstrap',
        text            : '../vendor/requirejs-text/text',
        perfectscrollbar: 'common/main/lib/mods/perfect-scrollbar',
        jmousewheel     : '../vendor/perfect-scrollbar/src/jquery.mousewheel',
        xregexp         : '../vendor/xregexp/xregexp-all-min',
        sockjs          : '../vendor/sockjs/sockjs.min',
        jsziputils      : '../vendor/jszip-utils/jszip-utils.min',
        jsrsasign       : '../vendor/jsrsasign/jsrsasign-latest-all-min',
        api             : 'api/documents/api',
        core            : 'common/main/lib/core/application',
        notification    : 'common/main/lib/core/NotificationCenter',
        keymaster       : 'common/main/lib/core/keymaster',
        tip             : 'common/main/lib/util/Tip',
        localstorage    : 'common/main/lib/util/LocalStorage',
        analytics       : 'common/Analytics',
        gateway         : 'common/Gateway',
        locale          : 'common/locale',
        irregularstack  : 'common/IrregularStack'
    },
    shim: {
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
        bootstrap: {
            deps: [
                'jquery'
            ]
        },
        perfectscrollbar: {
            deps: [
                'jmousewheel'
            ]
        },
        notification: {
            deps: [
                'backbone'
            ]
        },
        core: {
            deps: [
                'backbone',
                'notification',
                'irregularstack'
            ]
        },
        gateway: {
            deps: [
                'jquery'
            ]
        },
        analytics: {
            deps: [
                'jquery'
            ]
        }
    }
});

require([
    'backbone',
    'bootstrap',
    'core',
    'api',
    'analytics',
    'gateway',
    'locale',
    'jsziputils',
    'jsrsasign',
	'sockjs',
	'underscore'
], function (Backbone, Bootstrap, Core) {
    Backbone.history.start();

    /**
     * Application instance with SSE namespace defined
     */
    var app = new Backbone.Application({
        nameSpace: 'SSE',
        autoCreate: false,
        controllers : [
            'Viewport',
            'DocumentHolder',
            'CellEditor',
            'FormulaDialog',
            'Print',
            'Toolbar',
            'Statusbar',
            'RightMenu',
            'LeftMenu',
            'Main',
            'Common.Controllers.Fonts',
            'Common.Controllers.Chat',
            'Common.Controllers.Comments',
            'Common.Controllers.Plugins'
        ]
    });

    Common.Locale.apply();

    require([
        'spreadsheeteditor/main/app/controller/Viewport',
        'spreadsheeteditor/main/app/controller/DocumentHolder',
        'spreadsheeteditor/main/app/controller/CellEditor',
        'spreadsheeteditor/main/app/controller/Toolbar',
        'spreadsheeteditor/main/app/controller/Statusbar',
        'spreadsheeteditor/main/app/controller/RightMenu',
        'spreadsheeteditor/main/app/controller/LeftMenu',
        'spreadsheeteditor/main/app/controller/Main',
        'spreadsheeteditor/main/app/controller/Print',
        'spreadsheeteditor/main/app/view/FileMenuPanels',
        'spreadsheeteditor/main/app/view/ParagraphSettings',
        'spreadsheeteditor/main/app/view/ImageSettings',
        'spreadsheeteditor/main/app/view/ChartSettings',
        'spreadsheeteditor/main/app/view/ShapeSettings',
        'spreadsheeteditor/main/app/view/TextArtSettings',
        'common/main/lib/util/utils',
        'common/main/lib/util/LocalStorage',
        'common/main/lib/controller/Fonts',
        'common/main/lib/controller/Comments',
        'common/main/lib/controller/Chat',
        'common/main/lib/controller/Plugins'
    ], function() {
        app.start();
    });
}, function(err) {
    if (err.requireType == 'timeout' && !reqerr) {
        var getUrlParams = function() {
            var e,
                a = /\+/g,  // Regex for replacing addition symbol with a space
                r = /([^&=]+)=?([^&]*)/g,
                d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                q = window.location.search.substring(1),
                urlParams = {};

            while (e = r.exec(q))
                urlParams[d(e[1])] = d(e[2]);

            return urlParams;
        };

        var encodeUrlParam = function(str) {
            return str.replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
        };

        var lang = (getUrlParams()["lang"] || 'en').split("-")[0];

        if ( lang == 'de')      reqerr = 'Die Verbindung ist zu langsam, einige Komponenten konnten nicht geladen werden. Aktualisieren Sie bitte die Seite.';
        else if ( lang == 'es') reqerr = 'La conexión es muy lenta, algunos de los componentes no han podido cargar. Por favor recargue la página.';
        else if ( lang == 'fr') reqerr = 'La connexion est trop lente, certains des composants n\'ons pas pu être chargé. Veuillez recharger la page.';
        else if ( lang == 'ru') reqerr = 'Слишком медленное соединение, не удается загрузить некоторые компоненты. Пожалуйста, обновите страницу.';
        else reqerr = 'The connection is too slow, some of the components could not be loaded. Please reload the page.';

        window.alert(reqerr);
        window.location.reload();
    }
});