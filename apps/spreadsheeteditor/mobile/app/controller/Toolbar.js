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
 *  Toolbar.js
 *  Spreadsheet Editor
 *
 *  Created by Maxim Kadushkin on 11/15/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'spreadsheeteditor/mobile/app/view/Toolbar'
], function (core, $, _, Backbone) {
    'use strict';

    SSE.Controllers.Toolbar = Backbone.Controller.extend(_.extend((function() {
        // private
        var _backUrl;
        var locked = {
            book: false,
            sheet: false
        };

        return {
            models: [],
            collections: [],
            views: [
                'Toolbar'
            ],

            initialize: function() {
                Common.Gateway.on('init', _.bind(this.loadConfig, this));
            },

            loadConfig: function (data) {
                if (data && data.config && data.config.canBackToFolder !== false &&
                    data.config.customization && data.config.customization.goback && data.config.customization.goback.url) {
                    _backUrl = data.config.customization.goback.url;

                    $('#document-back').show().single('click', _.bind(this.onBack, this));
                }
            },

            setApi: function(api) {
                this.api = api;

                this.api.asc_registerCallback('asc_onCanUndoChanged', _.bind(this.onApiCanRevert, this, 'undo'));
                this.api.asc_registerCallback('asc_onCanRedoChanged', _.bind(this.onApiCanRevert, this, 'redo'));
                this.api.asc_registerCallback('asc_onSelectionChanged', this.onApiSelectionChanged.bind(this));
                this.api.asc_registerCallback('asc_onWorkbookLocked', _.bind(this.onApiWorkbookLocked, this));
                this.api.asc_registerCallback('asc_onWorksheetLocked', _.bind(this.onApiWorksheetLocked, this));
                this.api.asc_registerCallback('asc_onActiveSheetChanged', _.bind(this.onApiActiveSheetChanged, this));
                Common.NotificationCenter.on('api:disconnect',      _.bind(this.onCoAuthoringDisconnect, this));

                Common.NotificationCenter.on('sheet:active', this.onApiActiveSheetChanged.bind(this));
            },

            setMode: function (mode) {
                this.getView('Toolbar').setMode(mode);
            },

            onLaunch: function() {
                var me = this;
                me.createView('Toolbar').render();

                $('#toolbar-undo').single('click',  _.bind(me.onUndo, me));
                $('#toolbar-redo').single('click',  _.bind(me.onRedo, me));
            },

            setDocumentTitle: function (title) {
                $('#toolbar-title').html(title);
            },

           // Handlers

            onBack: function (e) {
                var me = this;

                if (me.api.asc_isDocumentModified()) {
                    uiApp.modal({
                        title   : me.dlgLeaveTitleText,
                        text    : me.dlgLeaveMsgText,
                        verticalButtons: true,
                        buttons : [
                            {
                                text: me.leaveButtonText,
                                onClick: function() {
                                    window.parent.location.href = _backUrl;
                                }
                            },
                            {
                                text: me.stayButtonText,
                                bold: true
                            }
                        ]
                    });
                } else {
                    window.parent.location.href = _backUrl;
                }
            },

            onUndo: function (e) {
                if ( this.api ) this.api.asc_Undo();
            },

            onRedo: function (e) {
                if ( this.api ) this.api.asc_Redo();
            },

            // API handlers

            onApiWorkbookLocked: function (l) {
                locked.book = l;
                this.onApiSelectionChanged();
            },

            onApiWorksheetLocked: function (l) {
                locked.sheet = l;
                this.onApiSelectionChanged();
            },

            onApiActiveSheetChanged: function (index) {
                locked.sheet = this.api.asc_isWorksheetLockedOrDeleted(index);
            },

            onApiCanRevert: function(which, can) {
                if (this.isDisconnected) return;

                if (which == 'undo') {
                    $('#toolbar-undo').toggleClass('disabled', !can);
                } else {
                    $('#toolbar-redo').toggleClass('disabled', !can);
                }
            },

            onApiSelectionChanged: function(info) {
                if (this.isDisconnected) return;

                if ( !info ) info = this.api.asc_getCellInfo();
                var islocked = false;

                switch (info.asc_getFlags().asc_getSelectionType()) {
                case Asc.c_oAscSelectionType.RangeChart:
                case Asc.c_oAscSelectionType.RangeImage:
                case Asc.c_oAscSelectionType.RangeShape:
                case Asc.c_oAscSelectionType.RangeChartText:
                case Asc.c_oAscSelectionType.RangeShapeText:
                    var objects = this.api.asc_getGraphicObjectProps();
                    for ( var i in objects ) {
                        if ( objects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image ) {
                            if ((islocked = objects[i].asc_getObjectValue().asc_getLocked()))
                                break;
                        }
                    }
                    break;
                default:
                    islocked = info.asc_getLocked();
                }

                this.getView('Toolbar').disableControl(['add', 'edit'], islocked);
            },

            activateControls: function() {
                $('#toolbar-settings, #toolbar-search, #document-back, #toolbar-edit-document').removeClass('disabled');
            },

            activateViewControls: function() {
                $('#toolbar-search, #document-back').removeClass('disabled');
            },

            deactivateEditControls: function() {
                $('#toolbar-edit, #toolbar-add, #toolbar-settings').addClass('disabled');
            },

            onCoAuthoringDisconnect: function() {
                this.isDisconnected = true;
            },

            dlgLeaveTitleText   : 'You leave the application',
            dlgLeaveMsgText     : 'You have unsaved changes in this document. Click \'Stay on this Page\' to await the autosave of the document. Click \'Leave this Page\' to discard all the unsaved changes.',
            leaveButtonText     : 'Leave this Page',
            stayButtonText      : 'Stay on this Page'
        }
    })(), SSE.Controllers.Toolbar || {}))
});