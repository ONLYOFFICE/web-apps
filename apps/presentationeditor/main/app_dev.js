/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
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
 *    Created on 26 March 2014
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
        text            : '../vendor/requirejs-text/text',
        perfectscrollbar: 'common/main/lib/mods/perfect-scrollbar',
        jmousewheel     : '../vendor/perfect-scrollbar/src/jquery.mousewheel',
        xregexp         : '../vendor/xregexp/xregexp-all-min',
        socketio        : '../vendor/socketio/socket.io.min',
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
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
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
    'underscore',
    'core',
    'analytics',
    'gateway',
    'locale',
    'socketio',
    'xregexp',
], function (Backbone, _, Core) {
    if (Backbone.History && Backbone.History.started)
        return;
    Backbone.history.start();
    window._ = _;

    /**
     * Application instance with PE namespace defined
     */
    var app = new Backbone.Application({
        nameSpace: 'PE',
        autoCreate: false,
        controllers : [
            'Viewport',
            'DocumentHolder',
            'Toolbar',
            'Statusbar',
            'RightMenu',
            'LeftMenu',
            'Main',
            'ViewTab',
            'Search',
            'Print',
            'Common.Controllers.Fonts',
            'Common.Controllers.History'
            /** coauthoring begin **/
            , 'Common.Controllers.Chat'
            ,'Common.Controllers.Comments'
            ,'Common.Controllers.Draw'
            /** coauthoring end **/
            ,'Common.Controllers.Plugins'
            ,'Common.Controllers.ExternalDiagramEditor'
            ,'Common.Controllers.ExternalOleEditor'
            ,'Common.Controllers.ReviewChanges'
            ,'Common.Controllers.Protection'
            ,'Transitions'
            ,'Animation'
        ]
    });

    Common.Locale.apply(function(){
        require([
            'common/main/lib/mods/dropdown',
            'common/main/lib/mods/tooltip',
            'common/main/lib/util/LocalStorage',
            'common/main/lib/controller/Scaling',
            'common/main/lib/controller/Themes',
            'common/main/lib/controller/TabStyler',
            'common/main/lib/controller/Desktop',
            'presentationeditor/main/app/controller/Viewport',
            'presentationeditor/main/app/controller/DocumentHolder',
            'presentationeditor/main/app/controller/Toolbar',
            'presentationeditor/main/app/controller/Statusbar',
            'presentationeditor/main/app/controller/RightMenu',
            'presentationeditor/main/app/controller/LeftMenu',
            'presentationeditor/main/app/controller/Main',
            'presentationeditor/main/app/controller/ViewTab',
            'presentationeditor/main/app/controller/Search',
            'presentationeditor/main/app/controller/Print',
            // 'presentationeditor/main/app/view/ParagraphSettings',
            // 'presentationeditor/main/app/view/ImageSettings',
            // 'presentationeditor/main/app/view/ShapeSettings',
            // 'presentationeditor/main/app/view/SlideSettings',
            // 'presentationeditor/main/app/view/TableSettings',
            // 'presentationeditor/main/app/view/TextArtSettings',
            // 'presentationeditor/main/app/view/SignatureSettings',
            'common/main/lib/util/utils',
            'common/main/lib/controller/Fonts',
            'common/main/lib/controller/History'
            /** coauthoring begin **/
            ,'common/main/lib/controller/Comments',
            'common/main/lib/controller/Chat',
            /** coauthoring end **/
            'common/main/lib/controller/Plugins',
            'presentationeditor/main/app/view/ChartSettings',
            'common/main/lib/controller/ExternalDiagramEditor'
            ,'common/main/lib/controller/ExternalOleEditor'
            ,'common/main/lib/controller/ReviewChanges'
            ,'common/main/lib/controller/Protection'
            ,'common/main/lib/controller/Draw'
            ,'presentationeditor/main/app/controller/Transitions'
            ,'presentationeditor/main/app/controller/Animation'
        ], function() {
            app.postLaunchScripts = [
                'common/main/lib/controller/ScreenReaderFocus',
                'common/main/lib/component/ComboBoxDataView',
                'common/main/lib/view/AdvancedSettingsWindow',
                'common/main/lib/view/AutoCorrectDialog',
                'common/main/lib/view/DocumentAccessDialog',
                'common/main/lib/view/SaveAsDlg',
                'common/main/lib/view/CopyWarningDialog',
                'common/main/lib/view/TextInputDialog',
                'common/main/lib/view/SelectFileDlg',
                'common/main/lib/view/SymbolTableDialog',
                'common/main/lib/view/ExternalEditor',
                'common/main/lib/view/ExternalDiagramEditor',
                'common/main/lib/view/ExternalOleEditor',
                'common/main/lib/view/LanguageDialog',
                'common/main/lib/view/SearchDialog',
                'common/main/lib/view/InsertTableDialog',
                'common/main/lib/view/RenameDialog',
                'common/main/lib/view/PasswordDialog',
                'common/main/lib/view/PluginDlg',
                'common/main/lib/view/PluginPanel',
                'common/main/lib/view/ShapeShadowDialog',
                'common/main/lib/view/CustomizeQuickAccessDialog',
                'common/main/lib/view/DocumentHolderExt',
                'common/main/lib/util/define',
                'common/main/lib/view/SignDialog',
                'common/main/lib/view/ListSettingsDialog',

                'presentationeditor/main/app/view/FileMenuPanels',
                'presentationeditor/main/app/view/DocumentHolderExt',
                'presentationeditor/main/app/view/ParagraphSettingsAdvanced',
                'presentationeditor/main/app/view/ShapeSettingsAdvanced',
                'presentationeditor/main/app/view/TableSettingsAdvanced',
                'presentationeditor/main/app/view/ImageSettingsAdvanced',
                'presentationeditor/main/app/view/SlideshowSettings',
                'presentationeditor/main/app/view/AnimationDialog',
                'presentationeditor/main/app/view/HeaderFooterDialog',
                'presentationeditor/main/app/view/HyperlinkSettingsDialog',
                'presentationeditor/main/app/view/DateTimeDialog',
                'presentationeditor/main/app/view/ChartSettingsAdvanced'
            ];

            window.compareVersions = true;
            app.start();
        });
    });
}, function(err) {
    if (err.requireType == 'timeout' && !reqerr && window.requireTimeourError) {
        reqerr = window.requireTimeourError();
        window.alert(reqerr);
        window.location.reload();
    }
});