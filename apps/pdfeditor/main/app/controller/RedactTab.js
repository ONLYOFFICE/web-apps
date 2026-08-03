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
 *  RedactTab.js
 *
 *  Created on 09.01.2025
 *
 */

define([
    'core',
    'pdfeditor/main/app/view/RedactTab',
], function () {
    'use strict';

    PDFE.Controllers.RedactTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'RedactTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
             this.addListeners({
                'Common.Views.SearchPanel': {
                    'search:showredact': _.bind(this.onToggleFindRedact, this, 'show')
                },
                'SearchBar': {
                    'search:showredact': _.bind(this.onToggleFindRedact, this, 'show')
                }
            });
        },

        onLaunch: function () {
            this._state = {};

            this.redactionsWarning = null;
            this.isFileMenuTab = null;
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
            Common.NotificationCenter.on('leftmenu:change', _.bind(this.onToggleFindRedact, this));

            this.binding = {

            };
        },

        onToggleFindRedact: function (action) {
            if (action === 'hide') {
                this.view && this.view.btnFindRedact && this.view.btnFindRedact.toggle(false);
            } else {
                this.view && this.view.btnFindRedact && this.view.btnFindRedact.toggle(true);
            }
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onRedactState',          _.bind(this.onRedactionStateToggle, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('RedactTab', {
                toolbar: this.toolbar.toolbar,
                mode: this.mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.addListeners({
                'RedactTab': {
                    'hiddeninfo:remove' :this.onRemoveHiddenInfo.bind(this),
                    'redact:start'   : this.onStartRedact.bind(this),
                    'redact:apply'   : this.onApplyRedact.bind(this),
                    'redact:page'    : this.onRedactCurrentPage.bind(this),
                    'redact:pages'   : this.onRedactPages.bind(this),
                },
                'Toolbar': {
                    'tab:active': this.onActiveTab
                }
            });
        },

        onRemoveHiddenInfo: function(btn) {
            var me = this;

            var handlerDlg = function (dlg, result) {
                if (result === 'ok') {
                    var props = dlg.getSettings();
                    if (me.api) {
                        me.api.RedactMeta(props[0], props[1], props[2], props[3], props[4], props[5], props[6], props[7], props[8], props[9], props[10])
                    }
                    if (!Common.localStorage.getBool("pdfe-hide-metadata-info")) {
                        Common.UI.info({
                            msg: me.textHiddenInfoWarn,
                            dontshow: true,
                            callback: _.bind(function (btn, dontshow) {
                                if (dontshow) Common.localStorage.setItem("pdfe-hide-metadata-info", 1);
                            })
                        })
                    }
                }
            }
            var win = new PDFE.Views.RemoveMetaDlg({
                handler: handlerDlg
            });
            win.show();
        },

        onApplyRedact: function() {
            Common.UI.warning({
                width: 500,
                msg: this.textApplyRedact,
                buttons: ['yes', 'no'],
                primary: 'yes',
                callback: _.bind(function(btn) {
                    if (btn == 'yes') {
                        this.api.ApplyRedact();
                    }
                }, this)
            });
        },

        onStartRedact: function(isMarkMode) {
            if (isMarkMode && this.toolbar) {
                this.toolbar.turnOnSelectTool();
                this.api.SetMarkerFormat(undefined, false);
                this.api.asc_StopInkDrawer();
                this.toolbar.onClearHighlight();
            }
            this.api.SetRedactTool(isMarkMode);
        },

        onRedactCurrentPage: function() {
            this.api.RedactPages([this.api.getCurrentPage()]);
        },

        onRedactPages: function() {
            const me = this;
            const countPages = this.api.getCountPages();

            (new Common.Views.TextInputDialog({
                title: this.textRedactPages,
                label: this.textEnterPageRange,
                value: `1-${countPages}`,
                description: this.textEnterRangeDescription,
                inputConfig: {
                    maxLength: 50,
                    allowBlank: false,
                    validation: function(value) {
                        const singlePage = /^\d+$/;
                        const range = /^(\d+)-(\d+)$/;

                        const parts = value.split(',').map(v => v.trim()).filter(Boolean);
                        if (parts.length === 0) return me.txtInvalidFormat;

                        for (const part of parts) {
                            if (singlePage.test(part)) {
                                const page = parseInt(part, 10);
                                if (page < 1 || page > countPages) {
                                    return Common.Utils.String.format(me.txtInvalidRange, countPages);
                                }
                            } else {
                                const match = part.match(range);
                                if (match) {
                                    const start = parseInt(match[1], 10);
                                    const end = parseInt(match[2], 10);
                                    if (start < 1 || end < 1 || start > countPages || end > countPages) {
                                        return Common.Utils.String.format(me.txtInvalidRange, countPages);
                                    }
                                    if (start > end) return me.txtReversedRange;
                                } else {
                                    return me.txtInvalidFormat;
                                }
                            }
                        }
                        return true;
                    }
                },
                handler: function(result, value) {
                    if (result === 'ok') {
                        let pages = [];
                        const parts = value.split(',').map(v => v.trim()).filter(Boolean);

                        for (const part of parts) {
                            if (part.includes('-')) {
                                const [start, end] = part.split('-').map(p => parseInt(p, 10));
                                for (let i = start; i <= end; i++) {
                                    pages.push(i - 1);
                                }
                            } else {
                                pages.push(parseInt(part, 10) - 1);
                            }
                        }

                        pages = Array.from(new Set(pages)).sort((a, b) => a - b);

                        me.api.RedactPages(pages);
                    }
                }
            })).show();
        },

        onActiveTab: function(tab) {
            if (tab == 'red') {
                if (!this.toolbar.toolbar.isCompact()) {
                }
            } else {
                const isMarked = this.api.HasRedact();
                if (
                    isMarked &&
                    (!this.redactionsWarning || !this.redactionsWarning.isVisible())
                ) {
                    this.redactionsWarning = Common.UI.warning({
                        width: 500,
                        msg: this.textUnappliedRedactions,
                        buttons: [{
                            value: 'apply',
                            caption: this.applyButtonText
                        }, {
                            value: 'doNotApply',
                            caption: this.doNotApplyButtonText
                        }, 'cancel'],
                        primary: 'apply',
                        callback: _.bind(function(btn) {
                            if (btn == 'apply') {
                                this.api.ApplyRedact();
                                this.api.SetRedactTool(false);
                                this.view.btnMarkForRedact.toggle(false);
                            } else if (btn == 'doNotApply') {
                                this.api.RemoveAllRedact();
                                this.api.SetRedactTool(false);
                                this.view.btnMarkForRedact.toggle(false);
                            } else {
                                if (this.isFileMenuTab) {
                                    this.view.fireEvent('menu:hide', [this]);
                                }
                                if (this.mode.isPDFEdit) {
                                    this.toolbar.toolbar.setTab('red')
                                } else {
                                    Common.NotificationCenter.trigger('pdf:mode-apply', 'edit', 'red');
                                }
                            }
                        }, this)
                    });
                } else {
                    this.view.btnMarkForRedact.toggle(false);
                    this.api.SetRedactTool(false);
                }
            }
            this.isFileMenuTab = tab === 'file';
        },

        onRedactionStateToggle: function(isRedaction) {
            this.view.btnMarkForRedact.toggle(isRedaction);
            if (this.toolbar)
                isRedaction ? this.toolbar.clearSelectTools() : this.toolbar.updateSelectTools();
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            Common.Utils.lockControls(Common.enumLock.lostConnect, true, {array: this.view.lockedControls});
        },

        onAppReady: function (config) {
            var me = this;
            if (me.view && config.isPDFEdit) {
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.view.onAppReady(config);
                    me.view.setEvents();

                    if (me.view.btnFindRedact) {
                        me.getApplication().getController('LeftMenu').leftMenu.btnSearchBar.on('toggle', function (btn, state) {
                            !state && me.view.turnFindRedact(state);
                        });
                    }
                });
            }
        },

        onDocumentReady: function() {
            if (this.mode && this.mode.isPDFEdit) {
                Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {array: this.view.lockedControls});
            }
        },

        initNames: function() {
        },

        onApiFocusObject: function(selectedObjects) {
        },

    }, PDFE.Controllers.RedactTab || {}));
});