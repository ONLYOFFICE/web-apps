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
 *  DataTab.js
 *
 *  Created on 30.05.2019
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/DataTab'
], function () {
    'use strict';

    SSE.Controllers.DataTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'DataTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
            this._state = {
                CSVOptions: new Asc.asc_CTextOptions(0, 4, '')
            };
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
        },
        onLaunch: function () {
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
                this.api.asc_registerCallback('asc_onWorksheetLocked',      _.bind(this.onWorksheetLocked, this));
                this.api.asc_registerCallback('asc_onChangeProtectWorkbook',_.bind(this.onChangeProtectWorkbook, this));
                this.api.asc_registerCallback('asc_onGoalSeekUpdate',       _.bind(this.onUpdateGoalSeekStatus, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('protect:wslock',              _.bind(this.onChangeProtectSheet, this));
                Common.NotificationCenter.on('document:ready',              _.bind(this.onDocumentReady, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.view = this.createView('DataTab', {
                toolbar: this.toolbar.toolbar
            });
            this.addListeners({
                'DataTab': {
                    'data:group': this.onGroup,
                    'data:ungroup': this.onUngroup,
                    'data:tocolumns': this.onTextToColumn,
                    'data:show': this.onShowClick,
                    'data:hide': this.onHideClick,
                    'data:groupsettings': this.onGroupSettings,
                    'data:sortcustom': this.onCustomSort,
                    'data:remduplicates': this.onRemoveDuplicates,
                    'data:datavalidation': this.onDataValidation,
                    'data:fromtext': this.onDataFromText,
                    'data:externallinks': this.onExternalLinks,
                    'data:goalseek': this.onGoalSeek
                },
                'Statusbar': {
                    'sheet:changed': this.onApiSheetChanged
                }
            });
            Common.NotificationCenter.on('data:remduplicates', _.bind(this.onRemoveDuplicates, this));
            Common.NotificationCenter.on('data:sortcustom', _.bind(this.onCustomSort, this));
            if ((this.toolbar.mode.canRequestReferenceData || this.toolbar.mode.isOffline) && this.api) {
                this.api.asc_registerCallback('asc_onNeedUpdateExternalReferenceOnOpen', _.bind(this.onNeedUpdateExternalReferenceOnOpen, this));
                this.api.asc_registerCallback('asc_onStartUpdateExternalReference', _.bind(this.onStartUpdateExternalReference, this));
                this.api.asc_registerCallback('asc_onUpdateExternalReference', _.bind(this.onUpdateExternalReference, this));
                this.api.asc_registerCallback('asc_onErrorUpdateExternalReference', _.bind(this.onErrorUpdateExternalReference, this));
                this.api.asc_registerCallback('asc_onNeedUpdateExternalReference', _.bind(this.onNeedUpdateExternalReference, this));
                Common.Gateway.on('setreferencedata', _.bind(this.setReferenceData, this));
            }
            if (this.toolbar.mode.canRequestReferenceSource) {
                Common.Gateway.on('setreferencesource', _.bind(this.setReferenceSource, this));
            }
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onSelectionChanged: function(info) {
            if (!this.toolbar.editMode || !this.view) return;

            var view = this.view;
            // special disable conditions
            Common.Utils.lockControls(Common.enumLock.multiselectCols, info.asc_getSelectedColsCount()>1, {array: [view.btnTextToColumns]});
            Common.Utils.lockControls(Common.enumLock.multiselect, info.asc_getMultiselect(), {array: [view.btnTextToColumns]});
            Common.Utils.lockControls(Common.enumLock.userProtected, info.asc_getUserProtected(), {array: view.lockedControls});
        },

        onUngroup: function(type) {
            var me = this;
            if (type=='rows') {
                (me.api.asc_checkAddGroup(true)!==undefined) && me.api.asc_ungroup(true)
            } else if (type=='columns') {
                (me.api.asc_checkAddGroup(true)!==undefined) && me.api.asc_ungroup(false)
            } else if (type=='clear') {
                me.api.asc_clearOutline();
            } else {
                var val = me.api.asc_checkAddGroup(true);
                if (val===null) {
                    (new Common.Views.OptionsDialog({
                        title: me.view.capBtnUngroup,
                        items: [
                            {caption: this.textRows, value: true, checked: true},
                            {caption: this.textColumns, value: false, checked: false}
                        ],
                        handler: function (dlg, result) {
                            if (result=='ok') {
                                me.api.asc_ungroup(dlg.getSettings());
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    })).show();
                } else if (val!==undefined) //undefined - error, true - rows, false - columns
                    me.api.asc_ungroup(val);
            }
            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
        },

        onGroup: function(type, checked) {
            if (type=='rows') {
                (this.api.asc_checkAddGroup()!==undefined) && this.api.asc_group(true)
            } else if (type=='columns') {
                (this.api.asc_checkAddGroup()!==undefined) && this.api.asc_group(false)
            } else if (type=='below') {
                this.api.asc_setGroupSummary(checked, false);
            } else if (type=='right') {
                this.api.asc_setGroupSummary(checked, true);
            } else {
                var me = this,
                    val = me.api.asc_checkAddGroup();
                if (val===null) {
                    (new Common.Views.OptionsDialog({
                        title: me.view.capBtnGroup,
                        items: [
                            {caption: this.textRows, value: true, checked: true},
                            {caption: this.textColumns, value: false, checked: false}
                        ],
                        handler: function (dlg, result) {
                            if (result=='ok') {
                                me.api.asc_group(dlg.getSettings());
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    })).show();
                } else if (val!==undefined) //undefined - error, true - rows, false - columns
                    me.api.asc_group(val);
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onGroupSettings: function(menu) {
            var value = this.api.asc_getGroupSummaryBelow();
            menu.items[3].setChecked(!!value, true);
            value = this.api.asc_getGroupSummaryRight();
            menu.items[4].setChecked(!!value, true);
        },

        onTextToColumn: function() {
            this.api.asc_TextImport(this._state.CSVOptions, _.bind(this.onTextToColumnCallback, this), false);
        },

        onTextToColumnCallback: function(data) {
            if (!data || !data.length) return;

            var me = this;
            (new Common.Views.OpenDialog({
                title: me.textWizard,
                closable: true,
                type: Common.Utils.importTextType.Columns,
                preview: true,
                previewData: data,
                settings: me._state.CSVOptions,
                api: me.api,
                handler: function (result, settings) {
                    if (result == 'ok' && me.api) {
                        me.api.asc_TextToColumns(settings.textOptions);
                    }
                }
            })).show();
        },

        onDataFromText: function(type) {
            var me = this;
            if (type === 'file') {
                if (this.api)
                    this.api.asc_TextFromFileOrUrl(this._state.CSVOptions, _.bind(this.onDataFromTextCallback, this));

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            } else if (type === 'url') {
                (new Common.Views.ImageFromUrlDialog({
                    label: me.txtUrlTitle,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/\s/g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.api.asc_TextFromFileOrUrl(me._state.CSVOptions, _.bind(me.onDataFromTextCallback, me), checkUrl);
                                } else {
                                    Common.UI.warning({
                                        msg: me.textEmptyUrl
                                    });
                                }
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    }
                })).show();
            } else if (type === 'storage') {
                // Common.NotificationCenter.trigger('storage:data-load', 'add');
            } else if (type === 'xml') {
                Common.Utils.InternalSettings.set('import-xml-start', true);
                this.api && this.api.asc_ImportXmlStart(_.bind(this.onDataFromXMLCallback, this));
            }
        },

        onDataFromTextCallback: function(advOptions) {
            var me = this;
            (new Common.Views.OpenDialog({
                title: me.txtImportWizard,
                closable: true,
                type: Common.Utils.importTextType.Data,
                preview: advOptions.asc_getData(),
                settings: advOptions ? advOptions.asc_getRecommendedSettings() : me._state.CSVOptions,
                codepages: advOptions ? advOptions.asc_getCodePages() : null,
                api: me.api,
                handler: function (result, settings) {
                    if (result == 'ok' && me.api) {
                        me.api.asc_TextToColumns(settings.textOptions, settings.data, settings.range);
                    }
                }
            })).show();
        },

        onDataFromXMLCallback: function(fileContent) {
            setTimeout(function() {
                Common.Utils.InternalSettings.set('import-xml-start', false);
            }, 500);

            if (!fileContent) return;

            var me = this;
            (new SSE.Views.ImportFromXmlDialog({
                api: me.api,
                handler: function (result, settings) {
                    if (result == 'ok' && settings) {
                        if (settings.destination)
                            me.api.asc_ImportXmlEnd(fileContent, settings.destination, me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex()));
                        else
                            me.api.asc_ImportXmlEnd(fileContent, null, me.createSheetName());
                    }
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            })).show();
        },

        createSheetName: function() {
            var items = [], wc = this.api.asc_getWorksheetsCount();
            while (wc--) {
                items.push(this.api.asc_getWorksheetName(wc).toLowerCase());
            }

            var index = 0, name;
            while(++index < 1000) {
                name = this.strSheet + index;
                if (items.indexOf(name.toLowerCase()) < 0) break;
            }

            return name;
        },

        onShowClick: function() {
            this.api.asc_changeGroupDetails(true);
        },

        onHideClick: function() {
            this.api.asc_changeGroupDetails(false);
        },

        onCustomSort: function() {
            Common.NotificationCenter.trigger('protect:check', this.onCustomSortCallback, this);
        },

        onCustomSortCallback: function() {
            var me = this;
            if (this.api) {
                var res = this.api.asc_sortCellsRangeExpand();
                switch (res) {
                    case Asc.c_oAscSelectionSortExpand.showExpandMessage:
                        var config = {
                            width: 500,
                            title: this.toolbar.txtSorting,
                            msg: this.toolbar.txtExpandSort,
                            buttons: [  {caption: this.toolbar.txtExpand, primary: true, value: 'expand'},
                                {caption: this.toolbar.txtSortSelected, value: 'sort'},
                                'cancel'],
                            callback: function(btn){
                                if (btn == 'expand' || btn == 'sort') {
                                    setTimeout(function(){
                                        me.showCustomSort(btn == 'expand');
                                    },1);
                                }
                            }
                        };
                        Common.UI.alert(config);
                        break;
                    case Asc.c_oAscSelectionSortExpand.showLockMessage:
                        var config = {
                            width: 500,
                            title: this.toolbar.txtSorting,
                            msg: this.toolbar.txtLockSort,
                            buttons: ['yes', 'no'],
                            primary: 'yes',
                            callback: function(btn){
                                (btn == 'yes') && setTimeout(function(){
                                                    me.showCustomSort(false);
                                                },1);
                            }
                        };
                        Common.UI.alert(config);
                        break;
                    case Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage:
                    case Asc.c_oAscSelectionSortExpand.notExpandAndNotShowMessage:
                        me.showCustomSort(res === Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage);
                        break;
                }
            }
        },

        showCustomSort: function(expand) {
            if (this.api.asc_getCellInfo().asc_getPivotTableInfo()) {
                var info = this.api.asc_getPivotInfo();
                if (info) {
                    var dlgSort = new SSE.Views.SortFilterDialog({api:this.api}).on({
                        'close': function() {
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    });
                    dlgSort.setSettings({filter : info.asc_getFilter(), rowFilter: info.asc_getFilterRow(), colFilter: info.asc_getFilterCol()});
                    dlgSort.show();
                }
            } else {
                var me = this,
                    props = me.api.asc_getSortProps(expand);
                // props = new Asc.CSortProperties();
                if (props) {
                    (new SSE.Views.SortDialog({
                        props: props,
                        api: me.api,
                        handler: function (result, settings) {
                            if (me && me.api) {
                                me.api.asc_setSortProps(settings, result != 'ok');
                            }
                        }
                    })).show();
                }
            }
        },

        onRemoveDuplicates: function() {
            var me = this;
            if (this.api) {
                var res = this.api.asc_sortCellsRangeExpand();
                if (res===Asc.c_oAscSelectionSortExpand.showExpandMessage) {
                    var config = {
                        width: 500,
                        title: this.txtRemDuplicates,
                        msg: this.txtExpandRemDuplicates,
                        buttons: [  {caption: this.txtExpand, primary: true, value: 'expand'},
                            {caption: this.txtRemSelected, value: 'remove'},
                            'cancel'],
                        callback: function(btn){
                            if (btn == 'expand' || btn == 'remove') {
                                setTimeout(function(){
                                    me.showRemDuplicates(btn == 'expand');
                                },1);
                            }
                        }
                    };
                    Common.UI.alert(config);
                } else if (res !== Asc.c_oAscSelectionSortExpand.showLockMessage)
                    me.showRemDuplicates(res===Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage);
            }
        },

        showRemDuplicates: function(expand) {
            var me = this,
                props = me.api.asc_getRemoveDuplicates(expand);
            if (props) {
                (new SSE.Views.RemoveDuplicatesDialog({
                    props: props,
                    api: me.api,
                    handler: function (result, settings) {
                        if (me && me.api) {
                            me.api.asc_setRemoveDuplicates(settings, result != 'ok');
                        }
                    }
                })).show();
            }
        },

        onDataValidation: function() {
            var me = this;
            if (this.api) {
                var res = this.api.asc_getDataValidationProps();
                if (typeof res !== 'object') {
                    var config = {
                        maxwidth: 500,
                        title: this.txtDataValidation,
                        msg: res===Asc.c_oAscError.ID.MoreOneTypeDataValidate ? this.txtRemoveDataValidation : this.txtExtendDataValidation,
                        buttons: res===Asc.c_oAscError.ID.MoreOneTypeDataValidate ? ['ok', 'cancel'] : ['yes', 'no', 'cancel'],
                        primary: res===Asc.c_oAscError.ID.MoreOneTypeDataValidate ? 'ok' : ['yes', 'no'],
                        callback: function(btn){
                            if (btn == 'yes' || btn == 'no' || btn == 'ok') {
                                setTimeout(function(){
                                    var props = me.api.asc_getDataValidationProps((btn=='ok') ? null : (btn == 'yes'));
                                    me.showDataValidation(props);
                                },1);
                            }
                        }
                    };
                    Common.UI.alert(config);
                } else
                    me.showDataValidation(res);
            }
        },

        showDataValidation: function(props) {
            var me = this;
            if (props) {
                (new SSE.Views.DataValidationDialog({
                    title: this.txtDataValidation,
                    props: props,
                    api: me.api,
                    handler: function (result, settings) {
                        if (me && me.api && result == 'ok') {
                            me.api.asc_setDataValidation(settings);
                        }
                    }
                })).show();
            }
        },

        onExternalLinks: function() {
            var me = this;
            this.externalLinksDlg = (new SSE.Views.ExternalLinksDlg({
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

        onGoalSeek: function() {
            var me = this;
            (new SSE.Views.GoalSeekDlg({
                api: me.api,
                handler: function(result, settings) {
                    if (result == 'ok' && settings) {
                        me.api.asc_StartGoalSeek(settings.formulaCell, settings.expectedValue, settings.changingCell);
                    }
                    Common.NotificationCenter.trigger('edit:complete');
                }
            })).show();
        },

        onUpdateGoalSeekStatus: function (targetValue, currentValue, iteration, cellName) {
            var me = this;
            if (!this.GoalSeekStatusDlg) {
                this.GoalSeekStatusDlg = new SSE.Views.GoalSeekStatusDlg({
                    api: me.api,
                    handler: function (result) {
                        me.api.asc_CloseGoalClose(result == 'ok');
                        me.GoalSeekStatusDlg = undefined;
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });
                this.GoalSeekStatusDlg.on('close', function() {
                    if (me.GoalSeekStatusDlg !== undefined) {
                        me.api.asc_CloseGoalClose(false);
                        me.GoalSeekStatusDlg = undefined;
                    }
                });
                this.GoalSeekStatusDlg.show();
            }
            this.GoalSeekStatusDlg.setSettings({targetValue: targetValue, currentValue: currentValue, iteration: iteration, cellName: cellName});
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
                    data && me.externalData.stackRequests.push({data: data, id: item.asc_getId(), isExternal: item.asc_isExternalLink()});
                });
                me.externalData.callback = callback;
                me.requestReferenceData();
            }
        },

        requestReferenceData: function() {
            if (this.externalData.stackRequests.length>0) {
                var item = this.externalData.stackRequests.shift();
                this.externalData.linkStatus.id = item.id;
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
                    }
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
        },

        onNeedUpdateExternalReferenceOnOpen: function() {
            Common.UI.warning({
                msg: this.warnUpdateExternalData,
                buttons: [{value: 'ok', caption: this.textUpdate, primary: true}, {value: 'cancel', caption: this.textDontUpdate}],
                maxwidth: 600,
                callback: _.bind(function(btn) {
                    if (btn==='ok') {
                        var links = this.api.asc_getExternalReferences();
                        links && (links.length>0) && this.api.asc_updateExternalReferences(links);
                    }
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
            if (this.toolbar.mode.isEdit && this.toolbar.editMode) {
                this.api.asc_changeExternalReference(this.externalSource.externalRef, data);
            }
        },

        onWorksheetLocked: function(index,locked) {
            if (index == this.api.asc_getActiveWorksheetIndex()) {
                Common.Utils.lockControls(Common.enumLock.sheetLock, locked, {array: this.view.btnsSortDown.concat(this.view.btnsSortUp, this.view.btnCustomSort, this.view.btnGroup, this.view.btnUngroup)});
            }
        },

        onChangeProtectWorkbook: function() {
            Common.Utils.lockControls(Common.enumLock.wbLock, this.api.asc_isProtectedWorkbook(), {array: [this.view.btnDataFromText, this.view.btnExternalLinks]});
        },

        onApiSheetChanged: function() {
            if (!this.toolbar.mode || !this.toolbar.mode.isEdit || this.toolbar.mode.isEditDiagram || this.toolbar.mode.isEditMailMerge || this.toolbar.mode.isEditOle) return;

            var currentSheet = this.api.asc_getActiveWorksheetIndex();
            this.onWorksheetLocked(currentSheet, this.api.asc_isWorksheetLockedOrDeleted(currentSheet));
        },

        onChangeProtectSheet: function(props) {
            if (!props) {
                var wbprotect = this.getApplication().getController('WBProtection');
                props = wbprotect ? wbprotect.getWSProps() : null;
            }
            props && props.wsProps && Common.Utils.lockControls(Common.enumLock['Sort'], props.wsProps['Sort'], {array: this.view.btnsSortDown.concat(this.view.btnsSortUp, this.view.btnCustomSort)});
        },

        onDocumentReady: function() {
            this.onChangeProtectSheet();
        },

        textWizard: 'Text to Columns Wizard',
        txtRemDuplicates: 'Remove Duplicates',
        txtExpandRemDuplicates: 'The data next to the selection will not be removed. Do you want to expand the selection to include the adjacent data or continue with the currently selected cells only?',
        txtExpand: 'Expand',
        txtRemSelected: 'Remove in selected',
        textRows: 'Rows',
        textColumns: 'Columns',
        txtDataValidation: 'Data Validation',
        txtExtendDataValidation: 'The selection contains some cells without Data Validation settings.<br>Do you want to extend Data Validation to these cells?',
        txtRemoveDataValidation: 'The selection contains more than one type of validation.<br>Erase current settings and continue?',
        textEmptyUrl: 'You need to specify URL.',
        txtImportWizard: 'Text Import Wizard',
        txtUrlTitle: 'Paste a data URL',
        txtErrorExternalLink: 'Error: updating is failed',
        strSheet: 'Sheet',
        warnUpdateExternalData: 'This workbook contains links to one or more external sources that could be unsafe.<br>If you trust the links, update them to get the latest data.',
        textUpdate: 'Update',
        textDontUpdate: 'Don\'t Update',
        textAddExternalData: 'The link to an external source has been added. You can update such links in the Data tab.'

    }, SSE.Controllers.DataTab || {}));
});