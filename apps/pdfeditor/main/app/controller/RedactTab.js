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
    'pdfeditor/main/app/collection/ShapeGroups',
    'pdfeditor/main/app/collection/EquationGroups'
], function () {
    'use strict';

    PDFE.Controllers.RedactTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
            'ShapeGroups',
            'EquationGroups'
        ],
        views : [
            'RedactTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
        },

        onLaunch: function () {
            this._state = {};

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
                    // 'smartart:mouseenter': this.mouseenterSmartArt,
                    // 'smartart:mouseleave': this.mouseleaveSmartArt,
                }
            });
        },

        onApplyRedact: function() {
            this.api.ApplyRedact();
        },

        onStartRedact: function(isMarkMode) {
            this.api.SetRedactTool(isMarkMode)
        },

        onRedactCurrentPage: function() {
            this.api.RedactPages([0]);
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
        },

        onDocumentReady: function() {
            if (this.mode && this.mode.isPDFEdit) {
                var shapes = this.api.asc_getPropertyEditorShapes();

                // this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').setApi(this.api).loadConfig({config:this.mode, customization: this.mode.customization});
                // this.getApplication().getController('Common.Controllers.ExternalOleEditor').setApi(this.api).loadConfig({config:this.mode, customization: this.mode.customization});

                Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {array: this.view.lockedControls});
            }
        },

        initNames: function() {
        },

        onApiFocusObject: function(selectedObjects) {
            var pr, i = -1, type,
                paragraph_locked = false,
                no_paragraph = true,
                in_chart = false,
                page_deleted = false;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    no_paragraph = false;
                } else if (type == Asc.c_oAscTypeSelectElement.Image || type == Asc.c_oAscTypeSelectElement.Shape || type == Asc.c_oAscTypeSelectElement.Chart || type == Asc.c_oAscTypeSelectElement.Table) {
                    if (type == Asc.c_oAscTypeSelectElement.Table ||
                        type == Asc.c_oAscTypeSelectElement.Shape && !pr.get_FromImage() && !pr.get_FromChart()) {
                        no_paragraph = false;
                    }
                    if (type == Asc.c_oAscTypeSelectElement.Chart) {
                        in_chart = true;
                    }
                } else if (type == Asc.c_oAscTypeSelectElement.PdfPage) {
                    page_deleted = pr.asc_getDeleteLock();
                }
            }

            // if (in_chart !== this._state.in_chart) {
            //     this.view.btnInsertChart.updateHint(in_chart ? this.view.tipChangeChart : this.view.tipInsertChart);
            //     this._state.in_chart = in_chart;
            // }

            if (this._state.prcontrolsdisable !== paragraph_locked) {
                if (this._state.activated) this._state.prcontrolsdisable = paragraph_locked;
                Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked===true, {array: this.view.lockedControls});
            }

            if (this._state.no_paragraph !== no_paragraph) {
                if (this._state.activated) this._state.no_paragraph = no_paragraph;
                Common.Utils.lockControls(Common.enumLock.noParagraphSelected, no_paragraph, {array: this.view.lockedControls});
            }

            if (page_deleted !== undefined && this._state.pagecontrolsdisable !== page_deleted) {
                if (this._state.activated) this._state.pagecontrolsdisable = page_deleted;
                Common.Utils.lockControls(Common.enumLock.pageDeleted, page_deleted, {array: this.view.lockedControls});
            }
        },

    }, PDFE.Controllers.RedactTab || {}));
});