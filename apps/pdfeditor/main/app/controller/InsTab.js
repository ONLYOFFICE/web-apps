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
 *  InsTab.js
 *
 *  Created on 12.03.2024
 *
 */

define([
    'core',
    'pdfeditor/main/app/view/InsTab',
    'pdfeditor/main/app/collection/ShapeGroups',
    'pdfeditor/main/app/collection/EquationGroups'
], function () {
    'use strict';

    PDFE.Controllers.InsTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
            'ShapeGroups',
            'EquationGroups'
        ],
        views : [
            'InsTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
        },

        onLaunch: function () {
            this._state = {};

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));

            this.binding = {
                checkInsertAutoshape: _.bind(this.checkInsertAutoshape, this)
            };
            PDFE.getCollection('ShapeGroups').bind({
                reset: this.onResetAutoshapes.bind(this)
            });
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onEndAddShape', _.bind(this.onApiEndAddShape, this)); //for shapes
                this.api.asc_registerCallback('asc_onTextLanguage',         _.bind(this.onTextLanguage, this));
                // this.api.asc_registerCallback('asc_onBeginSmartArtPreview', _.bind(this.onApiBeginSmartArtPreview, this));
                // this.api.asc_registerCallback('asc_onAddSmartArtPreview', _.bind(this.onApiAddSmartArtPreview, this));
                // this.api.asc_registerCallback('asc_onEndSmartArtPreview', _.bind(this.onApiEndSmartArtPreview, this));
                this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onCanAddHyperlink',      _.bind(this.onApiCanAddHyperlink, this));
                Common.NotificationCenter.on('storage:image-load',          _.bind(this.openImageFromStorage, this));
                Common.NotificationCenter.on('storage:image-insert',        _.bind(this.insertImageFromStorage, this));
                Common.Gateway.on('insertimage',                     _.bind(this.insertImage, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('InsTab', {
                toolbar: this.toolbar.toolbar,
                mode: this.mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.addListeners({
                'InsTab': {
                    'insert:image'      : this.onInsertImageClick.bind(this),
                    'insert:text-btn'   : this.onBtnInsertTextClick.bind(this),
                    'insert:text-menu'  : this.onMenuInsertTextClick.bind(this),
                    'insert:textart'    : this.onInsertTextart.bind(this),
                    'insert:shape'      : this.onInsertShape.bind(this),
                    'insert:page'       : this.onAddPage.bind(this),
                    'insert:chart'      : this.onSelectChart,
                    // 'insert:header'     : this.onEditHeaderClick,
                    'insert:hyperlink'  : this.onHyperlinkClick,
                    'insert:table'      : this.onInsertTableClick,
                    'insert:equation'   : this.onInsertEquationClick,
                    'insert:symbol'     : this.onInsertSymbolClick,
                    // 'insert:smartart'   : this.onInsertSmartArt,
                    // 'smartart:mouseenter': this.mouseenterSmartArt,
                    // 'smartart:mouseleave': this.mouseleaveSmartArt,
                }
            });
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
                    me.onApiMathTypes();
                });
            }
        },

        onDocumentReady: function() {
            if (this.mode && this.mode.isPDFEdit) {
                var shapes = this.api.asc_getPropertyEditorShapes();
                shapes && this.fillAutoShapes(shapes[0], shapes[1]);

                // this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').setApi(this.api).loadConfig({config:this.mode, customization: this.mode.customization});
                // this.getApplication().getController('Common.Controllers.ExternalOleEditor').setApi(this.api).loadConfig({config:this.mode, customization: this.mode.customization});

                Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {array: this.view.lockedControls});
            }
        },

        initNames: function() {
            this.shapeGroupNames = [
                this.txtBasicShapes,
                this.txtFiguredArrows,
                this.txtMath,
                this.txtCharts,
                this.txtStarsRibbons,
                this.txtCallouts,
                this.txtButtons,
                this.txtRectangles,
                this.txtLines
            ];
        },

        fillAutoShapes: function(groupNames, shapes){
            if (_.isEmpty(shapes) || _.isEmpty(groupNames) || shapes.length != groupNames.length)
                return;

            this.initNames();

            var me = this,
                shapegrouparray = [],
                name_arr = {};

            _.each(groupNames, function(groupName, index){
                var store = new Backbone.Collection([], {
                        model: PDFE.Models.ShapeModel
                    }),
                    arr = [];

                var cols = (shapes[index].length) > 18 ? 7 : 6,
                    height = Math.ceil(shapes[index].length/cols) * 35 + 3,
                    width = 30 * cols;

                _.each(shapes[index], function(shape, idx){
                    var name = me['txtShape_' + shape.Type];
                    arr.push({
                        data     : {shapeType: shape.Type},
                        tip      : name || (me.textShape + ' ' + (idx+1)),
                        allowSelected : true,
                        selected: false
                    });
                    if (name)
                        name_arr[shape.Type] = name;
                });
                store.add(arr);
                shapegrouparray.push({
                    groupName   : me.shapeGroupNames[index],
                    groupStore  : store,
                    groupWidth  : width,
                    groupHeight : height
                });
            });

            this.getCollection('ShapeGroups').reset(shapegrouparray);
            this.api.asc_setShapeNames(name_arr);
        },

        checkInsertAutoshape:  function(e) {
            var cmp = $(e.target),
                cmp_sdk = cmp.closest('#editor_sdk'),
                btn_id = cmp.closest('button').attr('id'),
                me = this;
            if (btn_id===undefined)
                btn_id = cmp.closest('.btn-group').attr('id');
            if (btn_id===undefined)
                btn_id = cmp.closest('.combo-dataview').attr('id');

            if (cmp.attr('id') != 'editor_sdk' && cmp_sdk.length<=0) {
                if ( this.view.btnsInsertText.pressed() && !this.view.btnsInsertText.contains(btn_id) ||
                    this.view.btnsInsertShape.pressed() && !this.view.btnsInsertShape.contains(btn_id) ||
                    this.view.cmbInsertShape.isComboViewRecActive() && this.view.cmbInsertShape.id !== btn_id)
                {
                    this._isAddingShape         = false;

                    this._addAutoshape(false);
                    this.view.btnsInsertShape.toggle(false, true);
                    this.view.btnsInsertText.toggle(false, true);
                    this.view.cmbInsertShape.deactivateRecords();
                    Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                } else
                if ( this.view.btnsInsertShape.pressed() && this.view.btnsInsertShape.contains(btn_id) ) {
                    _.defer(function(){
                        me.api.StartAddShape('', false);
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 100);
                }
            }
        },

        onApiEndAddShape: function() {
            this.view.fireEvent('insertshape', this.view);

            if ( this.view.btnsInsertShape.pressed() )
                this.view.btnsInsertShape.toggle(false, true);

            if ( this.view.btnsInsertText.pressed() ) {
                this.view.btnsInsertText.toggle(false, true);
                this.view.btnsInsertText.forEach(function(button) {
                    button.menu.clearAll();
                });
            }

            if ( this.view.cmbInsertShape.isComboViewRecActive() )
                this.view.cmbInsertShape.deactivateRecords();

            $(document.body).off('mouseup', this.binding.checkInsertAutoshape);
        },

        _addAutoshape:  function(isstart, type) {
            if (this.api) {
                if (isstart) {
                    this.api.StartAddShape(type, true);
                    $(document.body).on('mouseup', this.binding.checkInsertAutoshape);
                } else {
                    this.api.StartAddShape('', false);
                    $(document.body).off('mouseup', this.binding.checkInsertAutoshape);
                }
            }
        },

        onResetAutoshapes: function () {
            var me = this,
                collection = PDFE.getCollection('ShapeGroups');
            var onShowBefore = function(menu) {
                me.view.updateAutoshapeMenu(menu, collection);
                menu.off('show:before', onShowBefore);
            };
            me.view.btnsInsertShape.forEach(function (btn, index) {
                btn.menu.on('show:before', onShowBefore);
            });
            var onComboShowBefore = function (menu) {
                me.view.updateComboAutoshapeMenu(collection);
                menu.off('show:before', onComboShowBefore);
            }
            me.view.cmbInsertShape.openButton.menu.on('show:before', onComboShowBefore);
            me.view.cmbInsertShape.fillComboView(collection);
            me.view.cmbInsertShape.on('click', function (btn, record, cancel) {
                if (cancel) {
                    me._addAutoshape(false);
                    return;
                }
                if (record) {
                    me.view.cmbInsertShape.updateComboView(record);
                    me.onInsertShape(record.get('data').shapeType);
                }
            });
        },

        onHyperlinkClick: function(btn) {
            var me = this,
                win, props, text;

            if (me.api){

                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        (text!==false)
                            ? me.api.add_Hyperlink(props)
                            : me.api.change_Hyperlink(props);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.view);
                };

                text = me.api.can_AddHyperlink();

                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                if (text !== false) {
                    props = new Asc.CHyperlinkProperty();
                    props.put_Text(text);
                } else {
                    var selectedElements = me.api.getSelectedElements();
                    if (selectedElements && _.isArray(selectedElements)){
                        _.each(selectedElements, function(el, i) {
                            if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink)
                                props = selectedElements[i].get_ObjectValue();
                        });
                    }
                }
                if (props) {
                    win = new PDFE.Views.HyperlinkSettingsDialog({
                        api: me.api,
                        appOptions: me.mode,
                        handler: handlerDlg,
                        slides: _arr
                    });
                    win.show();
                    win.setSettings(props);
                }
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Add Hyperlink');
        },

        onInsertTableClick: function(type, columns, rows) {
            if (type==='picker') {
                this.view.fireEvent('inserttable', this.view);
                this.api.put_Table(columns, rows);
            } else if (type === 'custom') {
                var me = this;

                (new Common.Views.InsertTableDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                me.view.fireEvent('inserttable', me.view);

                                me.api.put_Table(value.columns, value.rows);
                            }

                            Common.component.Analytics.trackEvent('ToolBar', 'Table');
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.view);
                    }
                })).show();
            } else if (type == 'sse') {
                var oleEditor = this.getApplication().getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                if (oleEditor) {
                    oleEditor.setEditMode(false);
                    oleEditor.show();
                    oleEditor.setOleData("empty");
                }
            }
        },

        onInsertImageClick: function(opts, e) {
            var me = this;
            if (opts === 'file') {
                me.view.fireEvent('insertimage', this.view);

                setTimeout(function() {me.api.asc_addImage();}, 1);

                Common.NotificationCenter.trigger('edit:complete', this.view);
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            } else if (opts === 'url') {
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.view.fireEvent('insertimage', me.view);
                                    me.api.AddImageUrl([checkUrl]);

                                    Common.component.Analytics.trackEvent('ToolBar', 'Image');
                                } else {
                                    Common.UI.warning({
                                        msg: this.textEmptyImgUrl
                                    });
                                }
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.view);
                        }
                    }
                })).show();
            } else if (opts === 'storage') {
                Common.NotificationCenter.trigger('storage:image-load', 'add');
            }
        },

        openImageFromStorage: function(type) {
            var me = this;
            if (this.mode.canRequestInsertImage) {
                Common.Gateway.requestInsertImage(type);
            } else {
                (new Common.Views.SelectFileDlg({
                    fileChoiceUrl: this.mode.fileChoiceUrl.replace("{fileExt}", "").replace("{documentType}", "ImagesOnly")
                })).on('selectfile', function(obj, file){
                    file && (file.c = type);
                    !file.images && (file.images = [{fileType: file.fileType, url: file.url}]); // SelectFileDlg uses old format for inserting image
                    file.url = null;
                    me.insertImage(file);
                }).show();
            }
        },

        insertImageFromStorage: function(data) {
            if (data && data._urls && (!data.c || data.c=='add')) {
                this.view.fireEvent('insertimage', this.view);
                (data._urls.length>0) && this.api.AddImageUrl(data._urls, undefined, data.token);// for loading from storage
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            }
        },

        insertImage: function(data) { // gateway
            if (data && (data.url || data.images)) {
                data.url && console.log("Obsolete: The 'url' parameter of the 'insertImage' method is deprecated. Please use 'images' parameter instead.");

                var arr = [];
                if (data.images && data.images.length>0) {
                    for (var i=0; i<data.images.length; i++) {
                        data.images[i] && data.images[i].url && arr.push( data.images[i].url);
                    }
                } else
                    data.url && arr.push(data.url);
                data._urls = arr;
            }
            Common.NotificationCenter.trigger('storage:image-insert', data);
        },

        onBtnInsertTextClick: function(btn, e) {
            btn.menu.items.forEach(function(item) {
                if(item.value == btn.options.textboxType)
                    item.setChecked(true);
            });
            if(!btn.pressed) {
                btn.menu.clearAll();
            }
            this.onInsertText(btn.options.textboxType, btn, e);
        },

        onMenuInsertTextClick: function(btn, e) {
            var self = this;
            var oldType = btn.options.textboxType;
            var newType = e.value;

            btn.toggle(true);
            if(newType != oldType){
                this.view.btnsInsertText.forEach(function(button) {
                    button.updateHint([e.caption, self.views.tipInsertText]);
                    button.changeIcon({
                        next: e.options.iconClsForMainBtn,
                        curr: button.menu.items.filter(function(item){return item.value == oldType})[0].options.iconClsForMainBtn
                    });
                    button.options.textboxType = newType;
                });
            }
            this.onInsertText(newType, btn, e);
        },

        onInsertText: function(type, btn, e) {
            if (this.api)
                this._addAutoshape(btn.pressed, type);

            if ( this.view.btnsInsertShape.pressed() )
                this.view.btnsInsertShape.toggle(false, true);

            Common.NotificationCenter.trigger('edit:complete', this.view);
            Common.component.Analytics.trackEvent('ToolBar', 'Add Text');
        },

        onInsertShape: function (type) {
            var me = this;
            if ( type == 'menu:hide' ) {
                if ( me.view.btnsInsertShape.pressed() && !me._isAddingShape ) {
                    me.view.btnsInsertShape.toggle(false, true);
                }
                me._isAddingShape = false;

                Common.NotificationCenter.trigger('edit:complete', me.view);
            } else {
                me._addAutoshape(true, type);
                me._isAddingShape = true;

                if ( me.view.btnsInsertText.pressed() )
                    me.view.btnsInsertText.toggle(false, true);

                Common.NotificationCenter.trigger('edit:complete', me.view);
                Common.component.Analytics.trackEvent('ToolBar', 'Add Shape');
            }
        },

        onInsertTextart: function (data) {
            var me = this;

            me.view.fireEvent('inserttextart', me.view);
            me.api.AddTextArt(data);

            if ( me.view.btnsInsertShape.pressed() )
                me.view.btnsInsertShape.toggle(false, true);

            Common.NotificationCenter.trigger('edit:complete', me.view);
            Common.component.Analytics.trackEvent('ToolBar', 'Add Text Art');
        },

        onEditHeaderClick: function(type, e) {
            var selectedElements = this.api.getSelectedElements(),
                in_text = false;

            for (var i=0; i < selectedElements.length; i++) {
                if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                    in_text = true;
                    break;
                }
            }
            if (in_text && type=='slidenum') {
                this.api.asc_addPageNumber();
            } else if (in_text && type=='datetime') {
                //insert date time
                var me = this;
                (new PDFE.Views.DateTimeDialog({
                    api: this.api,
                    lang: this._state.lang,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                me.api.asc_addDateTime(value);
                            }
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.view);
                    }
                })).show();
            } else {
                //edit header/footer
                var me = this;
                (new PDFE.Views.HeaderFooterDialog({
                    api: this.api,
                    lang: this.api.asc_getDefaultLanguage(),
                    props: this.api.asc_getHeaderFooterProperties(),
                    isLockedApplyToAll: this._state.isLockedSlideHeaderAppyToAll,
                    handler: function(result, value) {
                        if (result == 'ok' || result == 'all') {
                            if (me.api) {
                                me.api.asc_setHeaderFooterProperties(value, result == 'all');
                            }
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.view);
                    }
                })).show();
            }
        },

        onAddPage: function(before) {
            this.api && this.api.asc_AddPage(!!before);
        },
/*
        mouseenterSmartArt: function (groupName, menu) {
            if (this.smartArtGenerating === undefined) {
                this.generateSmartArt(groupName, menu);
            } else {
                this.delayedSmartArt = groupName;
                this.delayedSmartArtMenu = menu;
            }
        },

        mouseleaveSmartArt: function (groupName) {
            if (this.delayedSmartArt === groupName) {
                this.delayedSmartArt = undefined;
            }
        },

        generateSmartArt: function (groupName, menu) {
            this.docHolderMenu = menu;
            this.api.asc_generateSmartArtPreviews(groupName);
        },

        onApiBeginSmartArtPreview: function (type) {
            this.smartArtGenerating = type;
            this.smartArtGroups = this.docHolderMenu ? this.docHolderMenu.items : this.view.btnInsertSmartArt.menu.items;
            var menuPicker = _.findWhere(this.smartArtGroups, {value: type}).menuPicker;
            menuPicker.loaded = true;
            this.smartArtData = Common.define.smartArt.getSmartArtData();
        },

        onApiAddSmartArtPreview: function (previews) {
            previews.forEach(_.bind(function (preview) {
                var image = preview.asc_getImage(),
                    sectionId = preview.asc_getSectionId(),
                    section = _.findWhere(this.smartArtData, {sectionId: sectionId}),
                    item = _.findWhere(section.items, {type: image.asc_getName()}),
                    menu = _.findWhere(this.smartArtGroups, {value: sectionId}),
                    menuPicker = menu.menuPicker,
                    pickerItem = menuPicker.store.findWhere({isLoading: true});
                if (pickerItem) {
                    pickerItem.set('isLoading', false, {silent: true});
                    pickerItem.set('value', item.type, {silent: true});
                    pickerItem.set('imageUrl', image.asc_getImage(), {silent: true});
                    pickerItem.set('tip', item.tip);
                }
                this.currentSmartArtCategoryMenu = menu;
            }, this));
        },

        onApiEndSmartArtPreview: function () {
            this.smartArtGenerating = undefined;
            if (this.currentSmartArtCategoryMenu) {
                this.currentSmartArtCategoryMenu.menu.alignPosition();
            }
            if (this.delayedSmartArt !== undefined) {
                var delayedSmartArt = this.delayedSmartArt;
                this.delayedSmartArt = undefined;
                this.generateSmartArt(delayedSmartArt, this.delayedSmartArtMenu);
            }
        },

        onInsertSmartArt: function (value) {
            if (this.api) {
                this.api.asc_createSmartArt(value);
            }
        },

        onSelectChart: function(type) {
            var me      = this,
                chart = false;

            var selectedElements = me.api.getSelectedElements();
            if (selectedElements && _.isArray(selectedElements)) {
                for (var i = 0; i< selectedElements.length; i++) {
                    if (Asc.c_oAscTypeSelectElement.Chart == selectedElements[i].get_ObjectType()) {
                        chart = selectedElements[i].get_ObjectValue();
                        break;
                    }
                }
            }

            if (chart) {
                var isCombo = (type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                    type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom);
                if (isCombo && chart.get_ChartProperties() && chart.get_ChartProperties().getSeries().length<2) {
                    Common.NotificationCenter.trigger('showerror', Asc.c_oAscError.ID.ComboSeriesError, Asc.c_oAscError.Level.NoCritical);
                } else
                    chart.changeType(type);
                Common.NotificationCenter.trigger('edit:complete', this.view);
            } else {
                if (!this.diagramEditor)
                    this.diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');

                if (this.diagramEditor && me.api) {
                    this.diagramEditor.setEditMode(false);
                    this.diagramEditor.show();

                    chart = me.api.asc_getChartObject(type);
                    if (chart) {
                        this.diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                    }
                    me.view.fireEvent('insertchart', me.view);
                }
            }
        },
*/
        onTextLanguage: function(langId) {
            this._state.lang = langId;
        },

        fillEquations: function() {
            if (!this.view.btnInsertEquation.rendered || this.view.btnInsertEquation.menu.items.length>0) return;

            var me = this, equationsStore = this.getApplication().getCollection('EquationGroups');

            me.view.btnInsertEquation.menu.removeAll();
            var onShowAfter = function(menu) {
                for (var i = 0; i < equationsStore.length; ++i) {
                    var equationPicker = new Common.UI.DataViewSimple({
                        el: $('#id-toolbar-menu-equationgroup' + i),
                        parentMenu: menu.items[i].menu,
                        store: equationsStore.at(i).get('groupStore'),
                        scrollAlwaysVisible: true,
                        itemTemplate: _.template(
                            '<div class="item-equation">' +
                            '<div class="equation-icon" style="background-position:<%= posX %>px <%= posY %>px;width:<%= width %>px;height:<%= height %>px;" id="<%= id %>"></div>' +
                            '</div>')
                    });
                    equationPicker.on('item:click', function(picker, item, record, e) {
                        if (me.api) {
                            if (record)
                                me.api.asc_AddMath(record.get('data').equationType);

                            if (me.view.btnsInsertText.pressed()) {
                                me.view.btnsInsertText.toggle(false, true);
                            }
                            if (me.view.btnsInsertShape.pressed()) {
                                me.view.btnsInsertShape.toggle(false, true);
                            }

                            if (e.type !== 'click')
                                me.view.btnInsertEquation.menu.hide();
                            Common.NotificationCenter.trigger('edit:complete', me.view, me.view.btnInsertEquation);
                            Common.component.Analytics.trackEvent('ToolBar', 'Add Equation');
                        }
                    });
                }
                menu.off('show:after', onShowAfter);
            };
            me.view.btnInsertEquation.menu.on('show:after', onShowAfter);

            for (var i = 0; i < equationsStore.length; ++i) {
                var equationGroup = equationsStore.at(i);
                var menuItem = new Common.UI.MenuItem({
                    caption: equationGroup.get('groupName'),
                    menu: new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="id-toolbar-menu-equationgroup' + i +
                                    '" class="menu-shape margin-left-5" style="width:' + (equationGroup.get('groupWidth') + 8) + 'px; ' +
                                    equationGroup.get('groupHeightStr') + '"></div>') }
                        ]
                    })
                });
                me.view.btnInsertEquation.menu.addItem(menuItem);
            }
        },

        onInsertEquationClick: function() {
            if (this.api) {
                this.api.asc_AddMath();
                Common.component.Analytics.trackEvent('ToolBar', 'Add Equation');
            }
            Common.NotificationCenter.trigger('edit:complete', this.view, this.view.btnInsertEquation);
        },

        onInsertSymbolClick: function(record) {
            if (!this.api) return;
            if (record)
                this.insertSymbol(record.get('font') , record.get('symbol'), record.get('special'));
            else {
                var me = this,
                    selected = me.api.asc_GetSelectedText(),
                    win = new Common.Views.SymbolTableDialog({
                        api: me.api,
                        lang: me.mode.lang,
                        type: 1,
                        special: true,
                        buttons: [{value: 'ok', caption: this.textInsert}, 'close'],
                        font: selected && selected.length>0 ? me.api.get_TextProps().get_TextPr().get_FontFamily().get_Name() : undefined,
                        symbol: selected && selected.length>0 ? selected.charAt(0) : undefined,
                        handler: function(dlg, result, settings) {
                            if (result == 'ok') {
                                me.insertSymbol(settings.font, settings.code, settings.special, settings.speccharacter);
                            } else
                                Common.NotificationCenter.trigger('edit:complete', me.view);
                        }
                    });
                win.show();
                win.on('symbol:dblclick', function(cmp, result, settings) {
                    me.insertSymbol(settings.font, settings.code, settings.special, settings.speccharacter);
                });
            }
        },

        insertSymbol: function(fontRecord, symbol, special, specCharacter){
            var font = fontRecord ? fontRecord: this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name();
            this.api.asc_insertSymbol(font, symbol, special);
            !specCharacter && this.view.saveSymbol(symbol, font);
        },

        onApiMathTypes: function(equation) {
            var me = this;
            var onShowBefore = function(menu) {
                var equationTemp = me.getApplication().getController('Toolbar')._equationTemp;
                me.onMathTypes(equationTemp);
                if (equationTemp && equationTemp.get_Data().length>0)
                    me.fillEquations();
                me.view.btnInsertEquation.menu.off('show:before', onShowBefore);
            };
            me.view.btnInsertEquation.menu.on('show:before', onShowBefore);
        },

        onMathTypes: function(equation) {
            var equationgrouparray = [],
                equationsStore = this.getCollection('EquationGroups');

            if (equationsStore.length>0)
                return;

            // equations groups

            var c_oAscMathMainTypeStrings = {};

            // [translate, count cells, scroll]

            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Symbol       ] = [this.textSymbols, 11, false, 'svg-icon-symbols'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Fraction     ] = [this.textFraction, 4, false, 'svg-icon-fraction'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Script       ] = [this.textScript, 4, false, 'svg-icon-script'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Radical      ] = [this.textRadical, 4, false, 'svg-icon-radical'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Integral     ] = [this.textIntegral, 3, true, 'svg-icon-integral'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LargeOperator] = [this.textLargeOperator, 5, true, 'svg-icon-largeOperator'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Bracket      ] = [this.textBracket, 4, true, 'svg-icon-bracket'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Function     ] = [this.textFunction, 3, true, 'svg-icon-function'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Accent       ] = [this.textAccent, 4, false, 'svg-icon-accent'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LimitLog     ] = [this.textLimitAndLog, 3, false, 'svg-icon-limAndLog'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Operator     ] = [this.textOperator, 4, false, 'svg-icon-operator'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Matrix       ] = [this.textMatrix, 4, true, 'svg-icon-matrix'];

            // equations sub groups

            // equations types

            var translationTable = {}, name = '', translate = '';
            for (name in Common.define.c_oAscMathType) {
                if (Common.define.c_oAscMathType.hasOwnProperty(name)) {
                    var arr = name.split('_');
                    if (arr.length==2 && arr[0]=='Symbol') {
                        translate = 'txt' + arr[0] + '_' + arr[1].toLocaleLowerCase();
                    } else
                        translate = 'txt' + name;
                    translationTable[Common.define.c_oAscMathType[name]] = this[translate];
                }
            }
            var i,id = 0, count = 0, length = 0, width = 0, height = 0, store = null, list = null, eqStore = null, eq = null, data;

            if (equation) {
                data = equation.get_Data();
                count = data.length;
                if (count) {
                    for (var j = 0; j < count; ++j) {
                        var group = data[j];
                        id = group.get_Id();
                        width = group.get_W();
                        height = group.get_H();

                        store = new Backbone.Collection([], {
                            model: PDFE.Models.EquationModel
                        });

                        if (store) {
                            var allItemsCount = 0, itemsCount = 0, ids = 0, arr = [];
                            length = group.get_Data().length;
                            for (i = 0; i < length; ++i) {
                                eqStore = group.get_Data()[i];
                                itemsCount = eqStore.get_Data().length;
                                for (var p = 0; p < itemsCount; ++p) {
                                    eq = eqStore.get_Data()[p];
                                    ids = eq.get_Id();

                                    translate = '';

                                    if (translationTable.hasOwnProperty(ids)) {
                                        translate = translationTable[ids];
                                    }
                                    arr.push({
                                        data            : {equationType: ids},
                                        tip             : translate,
                                        allowSelected   : true,
                                        selected        : false,
                                        width           : eqStore.get_W(),
                                        height          : eqStore.get_H(),
                                        posX            : -eq.get_X(),
                                        posY            : -eq.get_Y()
                                    });
                                }

                                allItemsCount += itemsCount;
                            }
                            store.add(arr);
                            width = c_oAscMathMainTypeStrings[id][1] * (width + 10);  // 4px margin + 4px margin + 1px border + 1px border

                            var normHeight = parseInt(370 / (height + 10)) * (height + 10);
                            equationgrouparray.push({
                                groupName   : c_oAscMathMainTypeStrings[id][0],
                                groupStore  : store,
                                groupWidth  : width,
                                groupHeight : normHeight,
                                groupHeightStr : c_oAscMathMainTypeStrings[id][2] ? ' height:'+ normHeight +'px!important; ' : '',
                                groupIcon: c_oAscMathMainTypeStrings[id][3]
                            });
                        }
                    }
                    equationsStore.add(equationgrouparray);
                    // this.fillEquations();
                }
            }
        },

        onApiFocusObject: function(selectedObjects) {
            var pr, i = -1, type,
                paragraph_locked = false,
                no_paragraph = true,
                in_chart = false;

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
        },

        onApiCanAddHyperlink: function(value) {
            if (this._state.can_hyper !== value) {
                Common.Utils.lockControls(Common.enumLock.hyperlinkLock, !value, {array: [this.view.btnInsertHyperlink]});
                if (this._state.activated) this._state.can_hyper = value;
            }
        },

        txtBasicShapes: 'Basic Shapes',
        txtFiguredArrows: 'Figured Arrows',
        txtMath: 'Math',
        txtCharts: 'Charts',
        txtStarsRibbons: 'Stars & Ribbons',
        txtCallouts: 'Callouts',
        txtButtons: 'Buttons',
        txtRectangles: 'Rectangles',
        txtLines: 'Lines',
        textShape: 'Shape',
        txtShape_textRect: 'Text Box',
        txtShape_rect: 'Rectangle',
        txtShape_ellipse: 'Ellipse',
        txtShape_triangle: 'Triangle',
        txtShape_rtTriangle: 'Right Triangle',
        txtShape_parallelogram: 'Parallelogram',
        txtShape_trapezoid: 'Trapezoid',
        txtShape_diamond: 'Diamond',
        txtShape_pentagon: 'Pentagon',
        txtShape_hexagon: 'Hexagon',
        txtShape_heptagon: 'Heptagon',
        txtShape_octagon: 'Octagon',
        txtShape_decagon: 'Decagon',
        txtShape_dodecagon: 'Dodecagon',
        txtShape_pie: 'Pie',
        txtShape_chord: 'Chord',
        txtShape_teardrop: 'Teardrop',
        txtShape_frame: 'Frame',
        txtShape_halfFrame: 'Half Frame',
        txtShape_corner: 'Corner',
        txtShape_diagStripe: 'Diagonal Stripe',
        txtShape_plus: 'Plus',
        txtShape_plaque: 'Sign',
        txtShape_can: 'Can',
        txtShape_cube: 'Cube',
        txtShape_bevel: 'Bevel',
        txtShape_donut: 'Donut',
        txtShape_noSmoking: '"No" Symbol',
        txtShape_blockArc: 'Block Arc',
        txtShape_foldedCorner: 'Folded Corner',
        txtShape_smileyFace: 'Smiley Face',
        txtShape_heart: 'Heart',
        txtShape_lightningBolt: 'Lightning Bolt',
        txtShape_sun: 'Sun',
        txtShape_moon: 'Moon',
        txtShape_cloud: 'Cloud',
        txtShape_arc: 'Arc',
        txtShape_bracePair: 'Double Brace',
        txtShape_leftBracket: 'Left Bracket',
        txtShape_rightBracket: 'Right Bracket',
        txtShape_leftBrace: 'Left Brace',
        txtShape_rightBrace: 'Right Brace',
        txtShape_rightArrow: 'Right Arrow',
        txtShape_leftArrow: 'Left Arrow',
        txtShape_upArrow: 'Up Arrow',
        txtShape_downArrow: 'Down Arrow',
        txtShape_leftRightArrow: 'Left Right Arrow',
        txtShape_upDownArrow: 'Up Down Arrow',
        txtShape_quadArrow: 'Quad Arrow',
        txtShape_leftRightUpArrow: 'Left Right Up Arrow',
        txtShape_bentArrow: 'Bent Arrow',
        txtShape_uturnArrow: 'U-Turn Arrow',
        txtShape_leftUpArrow: 'Left Up Arrow',
        txtShape_bentUpArrow: 'Bent Up Arrow',
        txtShape_curvedRightArrow: 'Curved Right Arrow',
        txtShape_curvedLeftArrow: 'Curved Left Arrow',
        txtShape_curvedUpArrow: 'Curved Up Arrow',
        txtShape_curvedDownArrow: 'Curved Down Arrow',
        txtShape_stripedRightArrow: 'Striped Right Arrow',
        txtShape_notchedRightArrow: 'Notched Right Arrow',
        txtShape_homePlate: 'Pentagon',
        txtShape_chevron: 'Chevron',
        txtShape_rightArrowCallout: 'Right Arrow Callout',
        txtShape_downArrowCallout: 'Down Arrow Callout',
        txtShape_leftArrowCallout: 'Left Arrow Callout',
        txtShape_upArrowCallout: 'Up Arrow Callout',
        txtShape_leftRightArrowCallout: 'Left Right Arrow Callout',
        txtShape_quadArrowCallout: 'Quad Arrow Callout',
        txtShape_circularArrow: 'Circular Arrow',
        txtShape_mathPlus: 'Plus',
        txtShape_mathMinus: 'Minus',
        txtShape_mathMultiply: 'Multiply',
        txtShape_mathDivide: 'Division',
        txtShape_mathEqual: 'Equal',
        txtShape_mathNotEqual: 'Not Equal',
        txtShape_flowChartProcess: 'Flowchart: Process',
        txtShape_flowChartAlternateProcess: 'Flowchart: Alternate Process',
        txtShape_flowChartDecision: 'Flowchart: Decision',
        txtShape_flowChartInputOutput: 'Flowchart: Data',
        txtShape_flowChartPredefinedProcess: 'Flowchart: Predefined Process',
        txtShape_flowChartInternalStorage: 'Flowchart: Internal Storage',
        txtShape_flowChartDocument: 'Flowchart: Document',
        txtShape_flowChartMultidocument: 'Flowchart: Multidocument ',
        txtShape_flowChartTerminator: 'Flowchart: Terminator',
        txtShape_flowChartPreparation: 'Flowchart: Preparation',
        txtShape_flowChartManualInput: 'Flowchart: Manual Input',
        txtShape_flowChartManualOperation: 'Flowchart: Manual Operation',
        txtShape_flowChartConnector: 'Flowchart: Connector',
        txtShape_flowChartOffpageConnector: 'Flowchart: Off-page Connector',
        txtShape_flowChartPunchedCard: 'Flowchart: Card',
        txtShape_flowChartPunchedTape: 'Flowchart: Punched Tape',
        txtShape_flowChartSummingJunction: 'Flowchart: Summing Junction',
        txtShape_flowChartOr: 'Flowchart: Or',
        txtShape_flowChartCollate: 'Flowchart: Collate',
        txtShape_flowChartSort: 'Flowchart: Sort',
        txtShape_flowChartExtract: 'Flowchart: Extract',
        txtShape_flowChartMerge: 'Flowchart: Merge',
        txtShape_flowChartOnlineStorage: 'Flowchart: Stored Data',
        txtShape_flowChartDelay: 'Flowchart: Delay',
        txtShape_flowChartMagneticTape: 'Flowchart: Sequential Access Storage',
        txtShape_flowChartMagneticDisk: 'Flowchart: Magnetic Disk',
        txtShape_flowChartMagneticDrum: 'Flowchart: Direct Access Storage',
        txtShape_flowChartDisplay: 'Flowchart: Display',
        txtShape_irregularSeal1: 'Explosion 1',
        txtShape_irregularSeal2: 'Explosion 2',
        txtShape_star4: '4-Point Star',
        txtShape_star5: '5-Point Star',
        txtShape_star6: '6-Point Star',
        txtShape_star7: '7-Point Star',
        txtShape_star8: '8-Point Star',
        txtShape_star10: '10-Point Star',
        txtShape_star12: '12-Point Star',
        txtShape_star16: '16-Point Star',
        txtShape_star24: '24-Point Star',
        txtShape_star32: '32-Point Star',
        txtShape_ribbon2: 'Up Ribbon',
        txtShape_ribbon: 'Down Ribbon',
        txtShape_ellipseRibbon2: 'Curved Up Ribbon',
        txtShape_ellipseRibbon: 'Curved Down Ribbon',
        txtShape_verticalScroll: 'Vertical Scroll',
        txtShape_horizontalScroll: 'Horizontal Scroll',
        txtShape_wave: 'Wave',
        txtShape_doubleWave: 'Double Wave',
        txtShape_wedgeRectCallout: 'Rectangular Callout',
        txtShape_wedgeRoundRectCallout: 'Rounded Rectangular Callout',
        txtShape_wedgeEllipseCallout: 'Oval Callout',
        txtShape_cloudCallout: 'Cloud Callout',
        txtShape_borderCallout1: 'Line Callout 1',
        txtShape_borderCallout2: 'Line Callout 2',
        txtShape_borderCallout3: 'Line Callout 3',
        txtShape_accentCallout1: 'Line Callout 1 (Accent Bar)',
        txtShape_accentCallout2: 'Line Callout 2 (Accent Bar)',
        txtShape_accentCallout3: 'Line Callout 3 (Accent Bar)',
        txtShape_callout1: 'Line Callout 1 (No Border)',
        txtShape_callout2: 'Line Callout 2 (No Border)',
        txtShape_callout3: 'Line Callout 3 (No Border)',
        txtShape_accentBorderCallout1: 'Line Callout 1 (Border and Accent Bar)',
        txtShape_accentBorderCallout2: 'Line Callout 2 (Border and Accent Bar)',
        txtShape_accentBorderCallout3: 'Line Callout 3 (Border and Accent Bar)',
        txtShape_actionButtonBackPrevious: 'Back or Previous Button',
        txtShape_actionButtonForwardNext: 'Forward or Next Button',
        txtShape_actionButtonBeginning: 'Beginning Button',
        txtShape_actionButtonEnd: 'End Button',
        txtShape_actionButtonHome: 'Home Button',
        txtShape_actionButtonInformation: 'Information Button',
        txtShape_actionButtonReturn: 'Return Button',
        txtShape_actionButtonMovie: 'Movie Button',
        txtShape_actionButtonDocument: 'Document Button',
        txtShape_actionButtonSound: 'Sound Button',
        txtShape_actionButtonHelp: 'Help Button',
        txtShape_actionButtonBlank: 'Blank Button',
        txtShape_roundRect: 'Round Corner Rectangle',
        txtShape_snip1Rect: 'Snip Single Corner Rectangle',
        txtShape_snip2SameRect: 'Snip Same Side Corner Rectangle',
        txtShape_snip2DiagRect: 'Snip Diagonal Corner Rectangle',
        txtShape_snipRoundRect: 'Snip and Round Single Corner Rectangle',
        txtShape_round1Rect: 'Round Single Corner Rectangle',
        txtShape_round2SameRect: 'Round Same Side Corner Rectangle',
        txtShape_round2DiagRect: 'Round Diagonal Corner Rectangle',
        txtShape_line: 'Line',
        txtShape_lineWithArrow: 'Arrow',
        txtShape_lineWithTwoArrows: 'Double Arrow',
        txtShape_bentConnector5: 'Elbow Connector',
        txtShape_bentConnector5WithArrow: 'Elbow Arrow Connector',
        txtShape_bentConnector5WithTwoArrows: 'Elbow Double-Arrow Connector',
        txtShape_curvedConnector3: 'Curved Connector',
        txtShape_curvedConnector3WithArrow: 'Curved Arrow Connector',
        txtShape_curvedConnector3WithTwoArrows: 'Curved Double-Arrow Connector',
        txtShape_spline: 'Curve',
        txtShape_polyline1: 'Scribble',
        txtShape_polyline2: 'Freeform',
        textSymbols                                : 'Symbols',
        textFraction                               : 'Fraction',
        textScript                                 : 'Script',
        textRadical                                : 'Radical',
        textIntegral                               : 'Integral',
        textLargeOperator                          : 'Large Operator',
        textBracket                                : 'Bracket',
        textFunction                               : 'Function',
        textAccent                                 : 'Accent',
        textLimitAndLog                            : 'Limit And Log',
        textOperator                               : 'Operator',
        textMatrix                                 : 'Matrix',

        txtSymbol_pm                               : 'Plus Minus',
        txtSymbol_infinity                         : 'Infinity',
        txtSymbol_equals                           : 'Equal',
        txtSymbol_neq                              : 'Not Equal To',
        txtSymbol_about                            : 'Approximately',
        txtSymbol_times                            : 'Multiplication Sign',
        txtSymbol_div                              : 'Division Sign',
        txtSymbol_factorial                        : 'Factorial',
        txtSymbol_propto                           : 'Proportional To',
        txtSymbol_less                             : 'Less Than',
        txtSymbol_ll                               : 'Much Less Than',
        txtSymbol_greater                          : 'Greater Than',
        txtSymbol_gg                               : 'Much Greater Than',
        txtSymbol_leq                              : 'Less Than or Equal To',
        txtSymbol_geq                              : 'Greater Than or Equal To',
        txtSymbol_mp                               : 'Minus Plus',
        txtSymbol_cong                             : 'Approximately Equal To',
        txtSymbol_approx                           : 'Almost Equal To',
        txtSymbol_equiv                            : 'Identical To',
        txtSymbol_forall                           : 'For All',
        txtSymbol_additional                       : 'Complement',
        txtSymbol_partial                          : 'Partial Differential',
        txtSymbol_sqrt                             : 'Radical Sign',
        txtSymbol_cbrt                             : 'Cube Root',
        txtSymbol_qdrt                             : 'Fourth Root',
        txtSymbol_cup                              : 'Union',
        txtSymbol_cap                              : 'Intersection',
        txtSymbol_emptyset                         : 'Empty Set',
        txtSymbol_percent                          : 'Percentage',
        txtSymbol_degree                           : 'Degrees',
        txtSymbol_fahrenheit                       : 'Degrees Fahrenheit',
        txtSymbol_celsius                          : 'Degrees Celsius',
        txtSymbol_inc                              : 'Increment',
        txtSymbol_nabla                            : 'Nabla',
        txtSymbol_exists                           : 'There Exist',
        txtSymbol_notexists                        : 'There Does Not Exist',
        txtSymbol_in                               : 'Element Of',
        txtSymbol_ni                               : 'Contains as Member',
        txtSymbol_leftarrow                        : 'Left Arrow',
        txtSymbol_uparrow                          : 'Up Arrow',
        txtSymbol_rightarrow                       : 'Right Arrow',
        txtSymbol_downarrow                        : 'Down Arrow',
        txtSymbol_leftrightarrow                   : 'Left-Right Arrow',
        txtSymbol_therefore                        : 'Therefore',
        txtSymbol_plus                             : 'Plus',
        txtSymbol_minus                            : 'Minus',
        txtSymbol_not                              : 'Not Sign',
        txtSymbol_ast                              : 'Asterisk Operator',
        txtSymbol_bullet                           : 'Bulet Operator',
        txtSymbol_vdots                            : 'Vertical Ellipsis',
        txtSymbol_cdots                            : 'Midline Horizontal Ellipsis',
        txtSymbol_rddots                           : 'Up Right Diagonal Ellipsis',
        txtSymbol_ddots                            : 'Down Right Diagonal Ellipsis',
        txtSymbol_aleph                            : 'Alef',
        txtSymbol_beth                             : 'Bet',
        txtSymbol_qed                              : 'End of Proof',
        txtSymbol_alpha                            : 'Alpha',
        txtSymbol_beta                             : 'Beta',
        txtSymbol_gamma                            : 'Gamma',
        txtSymbol_delta                            : 'Delta',
        txtSymbol_varepsilon                       : 'Epsilon Variant',
        txtSymbol_epsilon                          : 'Epsilon',
        txtSymbol_zeta                             : 'Zeta',
        txtSymbol_eta                              : 'Eta',
        txtSymbol_theta                            : 'Theta',
        txtSymbol_vartheta                         : 'Theta Variant',
        txtSymbol_iota                             : 'Iota',
        txtSymbol_kappa                            : 'Kappa',
        txtSymbol_lambda                           : 'Lambda',
        txtSymbol_mu                               : 'Mu',
        txtSymbol_nu                               : 'Nu',
        txtSymbol_xsi                              : 'Xi',
        txtSymbol_o                                : 'Omicron',
        txtSymbol_pi                               : 'Pi',
        txtSymbol_varpi                            : 'Pi Variant',
        txtSymbol_rho                              : 'Rho',
        txtSymbol_varrho                           : 'Rho Variant',
        txtSymbol_sigma                            : 'Sigma',
        txtSymbol_varsigma                         : 'Sigma Variant',
        txtSymbol_tau                              : 'Tau',
        txtSymbol_upsilon                          : 'Upsilon',
        txtSymbol_varphi                           : 'Phi Variant',
        txtSymbol_phi                              : 'Phi',
        txtSymbol_chi                              : 'Chi',
        txtSymbol_psi                              : 'Psi',
        txtSymbol_omega                            : 'Omega',

        txtFractionVertical                        : 'Stacked Fraction',
        txtFractionDiagonal                        : 'Skewed Fraction',
        txtFractionHorizontal                      : 'Linear Fraction',
        txtFractionSmall                           : 'Small Fraction',
        txtFractionDifferential_1                  : 'Differential',
        txtFractionDifferential_2                  : 'Differential',
        txtFractionDifferential_3                  : 'Differential',
        txtFractionDifferential_4                  : 'Differential',
        txtFractionPi_2                            : 'Pi Over 2',

        txtScriptSup                               : 'Superscript',
        txtScriptSub                               : 'Subscript',
        txtScriptSubSup                            : 'Subscript-Superscript',
        txtScriptSubSupLeft                        : 'Left Subscript-Superscript',
        txtScriptCustom_1                          : 'Script',
        txtScriptCustom_2                          : 'Script',
        txtScriptCustom_3                          : 'Script',
        txtScriptCustom_4                          : 'Script',

        txtRadicalSqrt                             : 'Square Root',
        txtRadicalRoot_n                           : 'Radical With Degree',
        txtRadicalRoot_2                           : 'Square Root With Degree',
        txtRadicalRoot_3                           : 'Cubic Root',
        txtRadicalCustom_1                         : 'Radical',
        txtRadicalCustom_2                         : 'Radical',

        txtIntegral                                : 'Integral',
        txtIntegralSubSup                          : 'Integral',
        txtIntegralCenterSubSup                    : 'Integral',
        txtIntegralDouble                          : 'Double Integral',
        txtIntegralDoubleSubSup                    : 'Double Integral',
        txtIntegralDoubleCenterSubSup              : 'Double Integral',
        txtIntegralTriple                          : 'Triple Integral',
        txtIntegralTripleSubSup                    : 'Triple Integral',
        txtIntegralTripleCenterSubSup              : 'Triple Integral',
        txtIntegralOriented                        : 'Contour Integral',
        txtIntegralOrientedSubSup                  : 'Contour Integral',
        txtIntegralOrientedCenterSubSup            : 'Contour Integral',
        txtIntegralOrientedDouble                  : 'Surface Integral',
        txtIntegralOrientedDoubleSubSup            : 'Surface Integral',
        txtIntegralOrientedDoubleCenterSubSup      : 'Surface Integral',
        txtIntegralOrientedTriple                  : 'Volume Integral',
        txtIntegralOrientedTripleSubSup            : 'Volume Integral',
        txtIntegralOrientedTripleCenterSubSup      : 'Volume Integral',
        txtIntegral_dx                             : 'Differential x',
        txtIntegral_dy                             : 'Differential y',
        txtIntegral_dtheta                         : 'Differential theta',

        txtLargeOperator_Sum                       : 'Summation',
        txtLargeOperator_Sum_CenterSubSup          : 'Summation',
        txtLargeOperator_Sum_SubSup                : 'Summation',
        txtLargeOperator_Sum_CenterSub             : 'Summation',
        txtLargeOperator_Sum_Sub                   : 'Summation',
        txtLargeOperator_Prod                      : 'Product',
        txtLargeOperator_Prod_CenterSubSup         : 'Product',
        txtLargeOperator_Prod_SubSup               : 'Product',
        txtLargeOperator_Prod_CenterSub            : 'Product',
        txtLargeOperator_Prod_Sub                  : 'Product',
        txtLargeOperator_CoProd                    : 'Co-Product',
        txtLargeOperator_CoProd_CenterSubSup       : 'Co-Product',
        txtLargeOperator_CoProd_SubSup             : 'Co-Product',
        txtLargeOperator_CoProd_CenterSub          : 'Co-Product',
        txtLargeOperator_CoProd_Sub                : 'Co-Product',
        txtLargeOperator_Union                     : 'Union',
        txtLargeOperator_Union_CenterSubSup        : 'Union',
        txtLargeOperator_Union_SubSup              : 'Union',
        txtLargeOperator_Union_CenterSub           : 'Union',
        txtLargeOperator_Union_Sub                 : 'Union',
        txtLargeOperator_Intersection              : 'Intersection',
        txtLargeOperator_Intersection_CenterSubSup : 'Intersection',
        txtLargeOperator_Intersection_SubSup       : 'Intersection',
        txtLargeOperator_Intersection_CenterSub    : 'Intersection',
        txtLargeOperator_Intersection_Sub          : 'Intersection',
        txtLargeOperator_Disjunction               : 'Vee',
        txtLargeOperator_Disjunction_CenterSubSup  : 'Vee',
        txtLargeOperator_Disjunction_SubSup        : 'Vee',
        txtLargeOperator_Disjunction_CenterSub     : 'Vee',
        txtLargeOperator_Disjunction_Sub           : 'Vee',
        txtLargeOperator_Conjunction               : 'Wedge',
        txtLargeOperator_Conjunction_CenterSubSup  : 'Wedge',
        txtLargeOperator_Conjunction_SubSup        : 'Wedge',
        txtLargeOperator_Conjunction_CenterSub     : 'Wedge',
        txtLargeOperator_Conjunction_Sub           : 'Wedge',
        txtLargeOperator_Custom_1                  : 'Summation',
        txtLargeOperator_Custom_2                  : 'Summation',
        txtLargeOperator_Custom_3                  : 'Summation',
        txtLargeOperator_Custom_4                  : 'Product',
        txtLargeOperator_Custom_5                  : 'Union',

        txtBracket_Round                           : 'Brackets',
        txtBracket_Square                          : 'Brackets',
        txtBracket_Curve                           : 'Brackets',
        txtBracket_Angle                           : 'Brackets',
        txtBracket_LowLim                          : 'Brackets',
        txtBracket_UppLim                          : 'Brackets',
        txtBracket_Line                            : 'Brackets',
        txtBracket_LineDouble                      : 'Brackets',
        txtBracket_Square_OpenOpen                 : 'Brackets',
        txtBracket_Square_CloseClose               : 'Brackets',
        txtBracket_Square_CloseOpen                : 'Brackets',
        txtBracket_SquareDouble                    : 'Brackets',

        txtBracket_Round_Delimiter_2               : 'Brackets with Separators',
        txtBracket_Curve_Delimiter_2               : 'Brackets with Separators',
        txtBracket_Angle_Delimiter_2               : 'Brackets with Separators',
        txtBracket_Angle_Delimiter_3               : 'Brackets with Separators',
        txtBracket_Round_OpenNone                  : 'Single Bracket',
        txtBracket_Round_NoneOpen                  : 'Single Bracket',
        txtBracket_Square_OpenNone                 : 'Single Bracket',
        txtBracket_Square_NoneOpen                 : 'Single Bracket',
        txtBracket_Curve_OpenNone                  : 'Single Bracket',
        txtBracket_Curve_NoneOpen                  : 'Single Bracket',
        txtBracket_Angle_OpenNone                  : 'Single Bracket',
        txtBracket_Angle_NoneOpen                  : 'Single Bracket',
        txtBracket_LowLim_OpenNone                 : 'Single Bracket',
        txtBracket_LowLim_NoneNone                 : 'Single Bracket',
        txtBracket_UppLim_OpenNone                 : 'Single Bracket',
        txtBracket_UppLim_NoneOpen                 : 'Single Bracket',
        txtBracket_Line_OpenNone                   : 'Single Bracket',
        txtBracket_Line_NoneOpen                   : 'Single Bracket',
        txtBracket_LineDouble_OpenNone             : 'Single Bracket',
        txtBracket_LineDouble_NoneOpen             : 'Single Bracket',
        txtBracket_SquareDouble_OpenNone           : 'Single Bracket',
        txtBracket_SquareDouble_NoneOpen           : 'Single Bracket',
        txtBracket_Custom_1                        : 'Case (Two Conditions)',
        txtBracket_Custom_2                        : 'Cases (Three Conditions)',
        txtBracket_Custom_3                        : 'Stack Object',
        txtBracket_Custom_4                        : 'Stack Object',
        txtBracket_Custom_5                        : 'Cases Example',
        txtBracket_Custom_6                        : 'Binomial Coefficient',
        txtBracket_Custom_7                        : 'Binomial Coefficient',

        txtFunction_Sin                            : 'Sine Function',
        txtFunction_Cos                            : 'Cosine Function',
        txtFunction_Tan                            : 'Tangent Function',
        txtFunction_Csc                            : 'Cosecant Function',
        txtFunction_Sec                            : 'Secant Function',
        txtFunction_Cot                            : 'Cotangent Function',
        txtFunction_1_Sin                          : 'Inverse Sine Function',
        txtFunction_1_Cos                          : 'Inverse Cosine Function',
        txtFunction_1_Tan                          : 'Inverse Tangent Function',
        txtFunction_1_Csc                          : 'Inverse Cosecant Function',
        txtFunction_1_Sec                          : 'Inverse Secant Function',
        txtFunction_1_Cot                          : 'Inverse Cotangent Function',
        txtFunction_Sinh                           : 'Hyperbolic Sine Function',
        txtFunction_Cosh                           : 'Hyperbolic Cosine Function',
        txtFunction_Tanh                           : 'Hyperbolic Tangent Function',
        txtFunction_Csch                           : 'Hyperbolic Cosecant Function',
        txtFunction_Sech                           : 'Hyperbolic Secant Function',
        txtFunction_Coth                           : 'Hyperbolic Cotangent Function',
        txtFunction_1_Sinh                         : 'Hyperbolic Inverse Sine Function',
        txtFunction_1_Cosh                         : 'Hyperbolic Inverse Cosine Function',
        txtFunction_1_Tanh                         : 'Hyperbolic Inverse Tangent Function',
        txtFunction_1_Csch                         : 'Hyperbolic Inverse Cosecant Function',
        txtFunction_1_Sech                         : 'Hyperbolic Inverse Secant Function',
        txtFunction_1_Coth                         : 'Hyperbolic Inverse Cotangent Function',
        txtFunction_Custom_1                       : 'Sine theta',
        txtFunction_Custom_2                       : 'Cos 2x',
        txtFunction_Custom_3                       : 'Tangent formula',

        txtAccent_Dot                              : 'Dot',
        txtAccent_DDot                             : 'Double Dot',
        txtAccent_DDDot                            : 'Triple Dot',
        txtAccent_Hat                              : 'Hat',
        txtAccent_Check                            : 'Check',
        txtAccent_Accent                           : 'Acute',
        txtAccent_Grave                            : 'Grave',
        txtAccent_Smile                            : 'Breve',
        txtAccent_Tilde                            : 'Tilde',
        txtAccent_Bar                              : 'Bar',
        txtAccent_DoubleBar                        : 'Double Overbar',
        txtAccent_CurveBracketTop                  : 'Overbrace',
        txtAccent_CurveBracketBot                  : 'Underbrace',
        txtAccent_GroupTop                         : 'Grouping Character Above',
        txtAccent_GroupBot                         : 'Grouping Character Below',
        txtAccent_ArrowL                           : 'Leftwards Arrow Above',
        txtAccent_ArrowR                           : 'Rightwards Arrow Above',
        txtAccent_ArrowD                           : 'Right-Left Arrow Above',
        txtAccent_HarpoonL                         : 'Leftwards Harpoon Above',
        txtAccent_HarpoonR                         : 'Rightwards Harpoon Above',
        txtAccent_BorderBox                        : 'Boxed Formula (With Placeholder)',
        txtAccent_BorderBoxCustom                  : 'Boxed Formula (Example)',
        txtAccent_BarTop                           : 'Overbar',
        txtAccent_BarBot                           : 'Underbar',
        txtAccent_Custom_1                         : 'Vector A',
        txtAccent_Custom_2                         : 'ABC With Overbar',
        txtAccent_Custom_3                         : 'x XOR y With Overbar',

        txtLimitLog_LogBase                        : 'Logarithm',
        txtLimitLog_Log                            : 'Logarithm',
        txtLimitLog_Lim                            : 'Limit',
        txtLimitLog_Min                            : 'Minimum',
        txtLimitLog_Max                            : 'Maximum',
        txtLimitLog_Ln                             : 'Natural Logarithm',
        txtLimitLog_Custom_1                       : 'Limit Example',
        txtLimitLog_Custom_2                       : 'Maximum Example',

        txtOperator_ColonEquals                    : 'Colon Equal',
        txtOperator_EqualsEquals                   : 'Equal Equal',
        txtOperator_PlusEquals                     : 'Plus Equal',
        txtOperator_MinusEquals                    : 'Minus Equal',
        txtOperator_Definition                     : 'Equal to By Definition',
        txtOperator_UnitOfMeasure                  : 'Measured By',
        txtOperator_DeltaEquals                    : 'Delta Equal To',
        txtOperator_ArrowL_Top                     : 'Leftwards Arrow Above',
        txtOperator_ArrowR_Top                     : 'Rightwards Arrow Above',
        txtOperator_ArrowL_Bot                     : 'Leftwards Arrow Below',
        txtOperator_ArrowR_Bot                     : 'Rightwards Arrow Below',
        txtOperator_DoubleArrowL_Top               : 'Leftwards Arrow Above',
        txtOperator_DoubleArrowR_Top               : 'Rightwards Arrow Above',
        txtOperator_DoubleArrowL_Bot               : 'Leftwards Arrow Below',
        txtOperator_DoubleArrowR_Bot               : 'Rightwards Arrow Below',
        txtOperator_ArrowD_Top                     : 'Right-Left Arrow Above',
        txtOperator_ArrowD_Bot                     : 'Right-Left Arrow Above',
        txtOperator_DoubleArrowD_Top               : 'Right-Left Arrow Below',
        txtOperator_DoubleArrowD_Bot               : 'Right-Left Arrow Below',
        txtOperator_Custom_1                       : 'Yileds',
        txtOperator_Custom_2                       : 'Delta Yields',

        txtMatrix_1_2                              : '1x2 Empty Matrix',
        txtMatrix_2_1                              : '2x1 Empty Matrix',
        txtMatrix_1_3                              : '1x3 Empty Matrix',
        txtMatrix_3_1                              : '3x1 Empty Matrix',
        txtMatrix_2_2                              : '2x2 Empty Matrix',
        txtMatrix_2_3                              : '2x3 Empty Matrix',
        txtMatrix_3_2                              : '3x2 Empty Matrix',
        txtMatrix_3_3                              : '3x3 Empty Matrix',
        txtMatrix_Dots_Center                      : 'Midline Dots',
        txtMatrix_Dots_Baseline                    : 'Baseline Dots',
        txtMatrix_Dots_Vertical                    : 'Vertical Dots',
        txtMatrix_Dots_Diagonal                    : 'Diagonal Dots',
        txtMatrix_Identity_2                       : '2x2 Identity Matrix',
        txtMatrix_Identity_2_NoZeros               : '3x3 Identity Matrix',
        txtMatrix_Identity_3                       : '3x3 Identity Matrix',
        txtMatrix_Identity_3_NoZeros               : '3x3 Identity Matrix',
        txtMatrix_2_2_RoundBracket                 : 'Empty Matrix with Brackets',
        txtMatrix_2_2_SquareBracket                : 'Empty Matrix with Brackets',
        txtMatrix_2_2_LineBracket                  : 'Empty Matrix with Brackets',
        txtMatrix_2_2_DLineBracket                 : 'Empty Matrix with Brackets',
        txtMatrix_Flat_Round                       : 'Sparse Matrix',
        txtMatrix_Flat_Square                      : 'Sparse Matrix',
        textInsert: 'Insert'

    }, PDFE.Controllers.InsTab || {}));
});