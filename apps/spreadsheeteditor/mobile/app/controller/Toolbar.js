/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *  Document Editor
 *
 *  Created by Maxim Kadushkin on 11/15/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/Toolbar'
], function (core) {
    'use strict';

    SSE.Controllers.Toolbar = Backbone.Controller.extend((function() {
        // private
        var _backUrl;

        return {
            models: [],
            collections: [],
            views: [
                'Toolbar'
            ],

            initialize: function() {
                this.addListeners({
                    'Toolbar': {
                        'searchbar:show'        : this.onSearchbarShow,
                        'searchbar:render'      : this.onSearchbarRender
                    }
                });

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

            // Search

            onSearchbarRender: function(bar) {
                var me = this;
                me.searchBar = uiApp.searchbar('.searchbar.document', {
                    customSearch: true,
                    onSearch    : _.bind(me.onSearchChange, me),
                    onEnable    : _.bind(me.onSearchEnable, me),
                    onDisable   : _.bind(me.onSearchDisable, me),
                    onClear     : _.bind(me.onSearchClear, me)
                });

                me.searchPrev = $('.searchbar.document .prev');
                me.searchNext = $('.searchbar.document .next');

                me.searchPrev.on('click', _.bind(me.onSearchPrev, me));
                me.searchNext.on('click', _.bind(me.onSearchNext, me));
            },

            onSearchbarShow: function(bar) {
                //
            },

            onSearchChange: function(search) {
                var me = this,
                    isEmpty = (search.query.trim().length < 1);

                _.each([me.searchPrev, me.searchNext], function(btn) {
                    btn[isEmpty ? 'addClass' : 'removeClass']('disabled');
                });
            },

            onSearchEnable: function(search) {
                //
            },

            onSearchDisable: function(search) {
                //
            },

            onSearchClear: function(search) {
//            window.focus();
//            document.activeElement.blur();
            },

            onSearchPrev: function(btn) {
                this.onQuerySearch(this.searchBar.query, 'back');
            },

            onSearchNext: function(btn) {
                this.onQuerySearch(this.searchBar.query, 'next');
            },

            onQuerySearch: function(query, direction, opts) {
                if (query && query.length) {
                    var findOptions = new Asc.asc_CFindOptions();
                    findOptions.asc_setFindWhat(query);
                    findOptions.asc_setScanForward(!(direction=='back'));
                    findOptions.asc_setIsMatchCase(false);
                    findOptions.asc_setIsWholeCell(false);
                    findOptions.asc_setScanOnOnlySheet(true);
                    findOptions.asc_setScanByRows(true);
                    findOptions.asc_setLookIn(Asc.c_oAscFindLookIn.Formulas);

                    if ( !this.api.asc_findText(findOptions) ) {
                        uiApp.alert(
                            '',
                            this.textNoTextFound,
                            function () {
                                this.searchBar.input.focus();
                            }.bind(this)
                        );
                    }
                }
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

            onApiCanRevert: function(which, can) {
                if (which == 'undo') {
                    $('#toolbar-undo').toggleClass('disabled', !can);
                } else {
                    $('#toolbar-redo').toggleClass('disabled', !can);
                }
            },

            dlgLeaveTitleText   : 'You leave the application',
            dlgLeaveMsgText     : 'You have unsaved changes in this document. Click \'Stay on this Page\' to await the autosave of the document. Click \'Leave this Page\' to discard all the unsaved changes.',
            leaveButtonText     : 'Leave this Page',
            stayButtonText      : 'Stay on this Page',
            textNoTextFound     : 'Text not found'
        }
    })());
});