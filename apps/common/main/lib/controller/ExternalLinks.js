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
 *  ExternalLinks.js
 *
 *  Created on 23.11.23
 *
 */

if (Common === undefined)
    var Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core',
    // 'common/main/lib/view/ExternalLinksDlg'
], function () { 'use strict';
    Common.Controllers.ExternalLinks = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Common.Views.ExternalLinksDlg'
        ],

        initialize: function() {
            this.externalData = {
                stackRequests: [],
                stackResponse: [],
                callback: undefined,
                isUpdating: false,
                linkStatus: {}
            };
            this.externalSource = {
                externalRef: undefined
            };
            this._state = {};
        },

        onLaunch: function() {
            //
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            return this;
        },

        setApi: function(api) {
            this.api = api;
            if ((this.toolbar.mode.canRequestReferenceData || this.toolbar.mode.isOffline) && this.api) {
                !!window.SSE && this.api.asc_registerCallback('asc_onNeedUpdateExternalReference', _.bind(this.onNeedUpdateExternalReference, this));
                this.api.asc_registerCallback('asc_onNeedUpdateExternalReferenceOnOpen', _.bind(this.onNeedUpdateExternalReferenceOnOpen, this));
                this.api.asc_registerCallback('asc_onStartUpdateExternalReference', _.bind(this.onStartUpdateExternalReference, this));
                this.api.asc_registerCallback('asc_onUpdateExternalReference', _.bind(this.onUpdateExternalReference, this));
                this.api.asc_registerCallback('asc_onErrorUpdateExternalReference', _.bind(this.onErrorUpdateExternalReference, this));
                Common.Gateway.on('setreferencedata', _.bind(this.setReferenceData, this));
            }
            if (this.toolbar.mode.canRequestReferenceSource) {
                Common.Gateway.on('setreferencesource', _.bind(this.setReferenceSource, this));
            }
            Common.NotificationCenter.on('data:externallinks', _.bind(this.onExternalLinks, this));
            Common.NotificationCenter.on('data:updatereferences', _.bind(this.updateReferences, this));
            Common.NotificationCenter.on('data:openlink', _.bind(this.openLink, this));
            return this;
        },

        onExternalLinks: function() {
            var me = this;
            this.externalLinksDlg = (new Common.Views.ExternalLinksDlg({
                api: this.api,
                isUpdating: this.externalData.isUpdating,
                canRequestReferenceData: this.toolbar.mode.canRequestReferenceData || this.toolbar.mode.isOffline,
                canRequestOpen: this.toolbar.mode.canRequestOpen || this.toolbar.mode.isOffline,
                canRequestReferenceSource: this.toolbar.mode.canRequestReferenceSource || this.toolbar.mode.isOffline,
                isOffline: this.toolbar.mode.isOffline,
                handler: function(result) {
                    Common.NotificationCenter.trigger('edit:complete');
                }
            }));
            this.externalLinksDlg.on('close', function(win){
                me.externalLinksDlg = null;
            });
            this.externalLinksDlg.on('change:source', function(win, externalRef){
                me.externalSource = {
                    externalRef: externalRef
                };
                Common.Gateway.requestReferenceSource();
            });
            this.externalLinksDlg.show()
        },

        onUpdateExternalReference: function(arr, callback) {
            if (this.toolbar.mode.isEdit && this.toolbar.editMode) {
                var me = this;
                me.externalData = {
                    stackRequests: [],
                    stackResponse: [],
                    callback: undefined,
                    isUpdating: false,
                    linkStatus: {}
                };
                arr && arr.length>0 && arr.forEach(function(item) {
                    var data;
                    switch (item.asc_getType()) {
                        case Asc.c_oAscExternalReferenceType.link:
                            data = {link: item.asc_getData()};
                            break;
                        case Asc.c_oAscExternalReferenceType.path:
                            data = {path: item.asc_getData()};
                            break;
                        case Asc.c_oAscExternalReferenceType.referenceData:
                            data = {
                                referenceData: item.asc_getData(),
                                path: item.asc_getPath(),
                                link: item.asc_getLink()
                            };
                            break;
                    }
                    data && me.externalData.stackRequests.push({data: data, id: item.asc_getId(), isExternal: item.asc_isExternalLink(), source: item.asc_getSource() || ''});
                });
                me.externalData.callback = callback;
                me.requestReferenceData();
            }
        },

        requestReferenceData: function() {
            if (this.externalData.stackRequests.length>0) {
                var item = this.externalData.stackRequests.shift();
                this.externalData.linkStatus.id = item.id;
                this.externalData.linkStatus.source = item.source;
                this.externalData.linkStatus.isExternal = item.isExternal;
                Common.Gateway.requestReferenceData(item.data);
            }
        },

        setReferenceData: function(data) {
            if (this.toolbar.mode.isEdit && this.toolbar.editMode) {
                if (data) {
                    this.externalData.stackResponse.push(data);
                    this.externalData.linkStatus.result = this.externalData.linkStatus.isExternal ? '' : data.error || '';
                    if (this.externalLinksDlg) {
                        this.externalLinksDlg.setLinkStatus(this.externalData.linkStatus.id, this.externalData.linkStatus.result);
                    } else if (this.externalData.linkStatus.result && !this._state.isFromDlg)
                        Common.NotificationCenter.trigger('showmessage', {msg: this.externalData.linkStatus.result + (this.externalData.linkStatus.source ? ' (' + this.externalData.linkStatus.source + ')' : '') });
                }
                if (this.externalData.stackRequests.length>0)
                    this.requestReferenceData();
                else if (this.externalData.callback)
                    this.externalData.callback(this.externalData.stackResponse);
            }
        },

        onStartUpdateExternalReference: function(status) {
            this.externalData.isUpdating = status;
            if (this.externalLinksDlg) {
                this.externalLinksDlg.setIsUpdating(status);
            }
            !status && (this._state.isFromDlg = status);
        },

        onNeedUpdateExternalReferenceOnOpen: function() {
            var value = this.api.asc_getUpdateLinks();
            Common.UI.warning({
                msg: value ? (!!window.SSE ? this.warnUpdateExternalAutoupdate : !!window.PE ? this.warnUpdateExternalAutoupdatePE : this.warnUpdateExternalAutoupdateDE) :
                             (!!window.SSE ? this.warnUpdateExternalData : !!window.PE ? this.warnUpdateExternalDataPE : this.warnUpdateExternalDataDE),
                buttons: [{value: 'ok', caption: value ? this.textContinue : this.textUpdate, primary: true}, {value: 'cancel', caption: value ? this.textTurnOff : this.textDontUpdate}],
                maxwidth: 500,
                callback: _.bind(function(btn) {
                    if (btn==='ok') {
                        var links = this.api.asc_getExternalReferences();
                        links && (links.length>0) && this.updateReferences(links);
                    }
                    value && this.api.asc_setUpdateLinks(btn==='ok', true);
                }, this)
            });
        },

        onErrorUpdateExternalReference: function(id) {
            if (this.externalLinksDlg) {
                this.externalLinksDlg.setLinkStatus(id, this.txtErrorExternalLink);
            }
        },

        onNeedUpdateExternalReference: function() {
            Common.NotificationCenter.trigger('showmessage', {msg: this.textAddExternalData});
        },

        setReferenceSource: function(data) { // gateway
            if (this.toolbar.mode.isEdit && this.toolbar.editMode &&  this.api) {
                this.api.asc_changeExternalReference(this.externalSource.externalRef, data);
            }
        },

        openLink: function(externalRef) {
            if (!externalRef) return;
            var data = this.api.asc_openExternalReference(externalRef);
            if (data) {
                switch (data.asc_getType()) {
                    case Asc.c_oAscExternalReferenceType.link:
                        data = {link: data.asc_getData()};
                        break;
                    case Asc.c_oAscExternalReferenceType.path:
                        data = {path: data.asc_getData()};
                        break;
                    case Asc.c_oAscExternalReferenceType.referenceData:
                        data = {
                            referenceData: data.asc_getData(),
                            path: data.asc_getPath()
                        };
                        break;
                }
                data.windowName = 'wname-' + Date.now();
                window.open("", data.windowName);
                Common.Gateway.requestOpen(data);
            }
        },

        updateReferences: function(data, fromDlg) {
            this._state.isFromDlg = !!fromDlg;
            this.api && this.api.asc_updateExternalReferences(data);
        },

        txtErrorExternalLink: 'Error: updating is failed',
        warnUpdateExternalData: 'This workbook contains links to one or more external sources that could be unsafe.<br>If you trust the links, update them to get the latest data.',
        warnUpdateExternalDataDE: 'This document contains links to one or more external sources that could be unsafe.<br>If you trust the links, update them to get the latest data.',
        warnUpdateExternalDataPE: 'This presentation contains links to one or more external sources that could be unsafe.<br>If you trust the links, update them to get the latest data.',
        textUpdate: 'Update',
        textDontUpdate: 'Don\'t Update',
        textAddExternalData: 'The link to an external source has been added. You can update such links in the Data tab.',
        textTurnOff: 'Turn off auto update',
        textContinue: 'Continue'

    }, Common.Controllers.ExternalLinks || {}));
});
