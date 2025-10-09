/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
        },

        onLaunch: function () {
            this._state = {};

            this.redactionsWarning = null;
            this.isFileMenuTab = null;
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));

            this.binding = {

            };
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

        onApplyRedact: function() {
            Common.UI.TooltipManager.closeTip('apply-redaction');
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
            Common.UI.TooltipManager.closeTip('mark-for-redaction');
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
                    maxLength: 20,
                    allowBlank: false,
                    validation: function(value) {
                        const singlePage = /^\d+$/;
                        const range = /^(\d+)-(\d+)$/;

                        if (singlePage.test(value)) {
                            const page = parseInt(value, 10);
                            if (page < 1 || page > countPages) return Common.Utils.String.format(me.txtInvalidRange, countPages);
                            return true;
                        }

                        const match = value.match(range);
                        if (match) {
                            const start = parseInt(match[1], 10);
                            const end = parseInt(match[2], 10);
                            if (start < 1 || end < 1 || start > countPages || end > countPages) {
                                return Common.Utils.String.format(me.txtInvalidRange, countPages);
                            }
                            if (start > end) return me.txtReversedRange;
                            return true;
                        }

                        return me.txtInvalidFormat;
                    }
                },
                handler: function(result, value) {
                    if (result === 'ok') {
                        let pages = [];

                        if (value.includes('-')) {
                            const [start, end] = value.split('-').map(p => parseInt(p, 10));
                            for (let i = start; i <= end; i++) {
                                pages.push(i - 1);
                            }
                        } else {
                            pages.push(parseInt(value, 10) - 1);
                        }
                        me.api.RedactPages(pages);
                    }
                }
            })).show();
        },

        onActiveTab: function(tab) {
            if (tab == 'red') {
                Common.UI.TooltipManager.showTip('mark-for-redaction');
                Common.UI.TooltipManager.showTip('apply-redaction');
            } else {
                Common.UI.TooltipManager.closeTip('mark-for-redaction');
                Common.UI.TooltipManager.closeTip('apply-redaction');
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
                });
            }
            Common.UI.TooltipManager.addTips({
                'mark-for-redaction' : {name: 'help-tip-mark-for-redaction', placement: 'bottom-right', text: this.tipMarkForRedaction, header: this.tipMarkForRedactionHeader, target: '#slot-btn-markredact',
                    automove: true, next: 'apply-redaction', maxwidth: 270, closable: false, isNewFeature: false, noHighlight: true},
                'apply-redaction' : {name: 'help-tip-apply-redaction', placement: 'bottom-left', text: this.tipApplyRedaction, header: this.tipApplyRedactionHeader, target: '#slot-btn-apply-redactions',
                    automove: true, prev: 'mark-for-redaction', maxwidth: 270, closable: false, isNewFeature: false, noHighlight: true},
            });
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