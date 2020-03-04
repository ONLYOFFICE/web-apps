/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  HyperlinkSettingsDialog.js
 *
 *  Created by Alexander Yuzhin on 4/9/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window',
    'common/main/lib/component/TreeView'
], function () { 'use strict';

    SSE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width   : 350,
            style   : 'min-width: 230px;',
            cls     : 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 290px;">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external" style="border-top-right-radius: 0;border-bottom-right-radius: 0;">', this.textExternalLink,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal" style="border-top-left-radius: 0;border-bottom-left-radius: 0;">', this.textInternalLink,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            '<label>' + this.strLinkTo + ' *</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div id="id-internal-link" class="hidden">',
                        '<div class="input-row">',
                            '<label>' + this.strRange + ' *</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-range" class="input-row" style="margin-bottom: 5px;"></div>',
                        '<div id="id-dlg-hyperlink-list" style="width:100%; height: 115px;border: 1px solid #cfcfcf;"></div>',
                    '</div>',
                    '<div class="input-row">',
                        '<label>' + this.strDisplay + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textTipText + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-tip" class="input-row" style="margin-bottom: 5px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild(),
                me = this;

            me.btnExternal = new Common.UI.Button({
                el: $('#id-dlg-hyperlink-external'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false,
                pressed: true
            });
            me.btnExternal.on('click', _.bind(me.onLinkTypeClick, me, Asc.c_oAscHyperlinkType.WebLink));

            me.btnInternal = new Common.UI.Button({
                el: $('#id-dlg-hyperlink-internal'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false
            });
            me.btnInternal.on('click', _.bind(me.onLinkTypeClick, me, Asc.c_oAscHyperlinkType.RangeLink));

            me.inputUrl = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-url'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                validateOnBlur: false,
                style       : 'width: 100%;',
                validation  : function(value) {
                    var urltype = me.api.asc_getUrlType($.trim(value));
                    me.isEmail = (urltype==2);
                    return (urltype>0) ? true : me.txtNotUrl;
                }
            });

            me.inputRange = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-range'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                validateOnChange: true,
                validateOnBlur: false,
                value: Common.Utils.InternalSettings.get("sse-settings-r1c1") ? 'R1C1' : 'A1',
                validation  : function(value) {
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.FormatTable, value, false);
                    if (isvalid == Asc.c_oAscError.ID.No) {
                        return true;
                    } else {
                        return me.textInvalidRange;
                    }
                }
            });

            me.inputDisplay = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-display'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            });

            me.inputTip = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-tip'),
                style       : 'width: 100%;',
                maxLength   : Asc.c_oAscMaxTooltipLength
            });

            me.internalList = new Common.UI.TreeView({
                el: $('#id-dlg-hyperlink-list'),
                store: new Common.UI.TreeViewStore(),
                enableKeyEvents: true
            });
            me.internalList.on('item:select', _.bind(this.onSelectItem, this));

            me.btnOk = new Common.UI.Button({
                el: $window.find('.primary')
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            me.internalList.on('entervalue', _.bind(me.onPrimary, me));
            me.externalPanel = $window.find('#id-external-link');
            me.internalPanel = $window.find('#id-internal-link');
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                if (me.focusedInput) me.focusedInput.focus();
            },50);
        },

        setSettings: function(settings) {
            if (settings) {
                var me = this;
                me.settings = settings;

                var type = (settings.props) ? settings.props.asc_getType() : Asc.c_oAscHyperlinkType.WebLink;
                (type == Asc.c_oAscHyperlinkType.WebLink) ? me.btnExternal.toggle(true) : me.btnInternal.toggle(true);
                me.ShowHideElem(type);
                me.btnInternal.setDisabled(!settings.allowInternal && (type == Asc.c_oAscHyperlinkType.WebLink));
                me.btnExternal.setDisabled(!settings.allowInternal && (type == Asc.c_oAscHyperlinkType.RangeLink));

                var sheet = settings.currentSheet;
                if (!settings.props) {
                    this.inputDisplay.setValue(settings.isLock ? this.textDefault : settings.text);
                    this.focusedInput = this.inputUrl.cmpEl.find('input');
                } else {
                    if (type == Asc.c_oAscHyperlinkType.RangeLink) {
                        sheet = settings.props.asc_getSheet();
                        this.inputRange.setValue(settings.props.asc_getRange());
                        this.focusedInput = this.inputRange.cmpEl.find('input');
                    } else {
                        this.inputUrl.setValue(settings.props.asc_getHyperlinkUrl().replace(new RegExp(" ",'g'), "%20"));
                        this.focusedInput = this.inputUrl.cmpEl.find('input');
                    }
                    this.inputDisplay.setValue(settings.isLock ? this.textDefault : settings.props.asc_getText());
                    this.inputTip.setValue(settings.props.asc_getTooltip());
                }
                var rec = this.internalList.store.findWhere({name: sheet });
                rec && this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                this.inputDisplay.setDisabled(settings.isLock);
            }
        },

        getSettings: function() {
            var props = new Asc.asc_CHyperlink(),
                def_display = "";
            props.asc_setType(this.btnInternal.isActive() ? Asc.c_oAscHyperlinkType.RangeLink : Asc.c_oAscHyperlinkType.WebLink);

            if (this.btnInternal.isActive()) {
                var rec = this.internalList.getSelectedRec();
                if (rec) {
                    props.asc_setSheet(rec.get('name'));
                    props.asc_setRange(this.inputRange.getValue());
                    def_display = rec.get('name') + '!' + this.inputRange.getValue();
                }
            } else {
                var url = this.inputUrl.getValue().replace(/^\s+|\s+$/g,'');
                if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = ( (this.isEmail) ? 'mailto:' : 'http://' ) + url;
                url = url.replace(new RegExp("%20",'g')," ");
                props.asc_setHyperlinkUrl(url);
                def_display = url;
            }

            if (this.inputDisplay.isDisabled())
                props.asc_setText(null);
            else {
                if (_.isEmpty(this.inputDisplay.getValue()))
                    this.inputDisplay.setValue(def_display);
                props.asc_setText(this.inputDisplay.getValue());
            }

            props.asc_setTooltip(this.inputTip.getValue());

            return props;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    var checkurl = (this.btnExternal.isActive()) ? this.inputUrl.checkValidate() : true,
                        checkrange = (this.btnInternal.isActive()) ? this.inputRange.checkValidate() : true,
                        checkdisp = this.inputDisplay.checkValidate();
                    if (checkurl !== true)  {
                        this.inputUrl.cmpEl.find('input').focus();
                        return;
                    }
                    if (checkrange !== true)  {
                        this.inputRange.cmpEl.find('input').focus();
                        return;
                    }
                    if (checkdisp !== true) {
                        this.inputDisplay.cmpEl.find('input').focus();
                        return;
                    }
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        ShowHideElem: function(value) {
            this.externalPanel.toggleClass('hidden', value !== Asc.c_oAscHyperlinkType.WebLink);
            this.internalPanel.toggleClass('hidden', value !== Asc.c_oAscHyperlinkType.RangeLink);
            var store = this.internalList.store;
            if (value==Asc.c_oAscHyperlinkType.RangeLink) {
                if (store.length<1 && this.settings) {
                    var sheets = this.settings.sheets,
                        count = sheets.length,
                        arr = [];
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.textSheets,
                        level: 0,
                        index: 0,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: true,
                        hasSubItems: true
                    }));
                    for (var i=0; i<count; i++) {
                        arr.push(new Common.UI.TreeViewModel({
                            name : sheets[i],
                            level: 1,
                            index: i+1,
                            type: 0, // sheet
                            hasParent: true
                        }));
                    }
                    arr.push(new Common.UI.TreeViewModel({
                        name : this.textNames,
                        level: 0,
                        index: arr.length,
                        hasParent: false,
                        isEmptyItem: false,
                        isNotHeader: false,
                        hasSubItems: false
                    }));
                    var ranges = this.settings.ranges,
                        prev_level = 0;
                    count = ranges.length;
                    for (var i=0; i<count; i++) {
                        var range = ranges[i];
                        if (!range.asc_getIsTable()) {
                            if (prev_level<1)
                                arr[arr.length-1].set('hasSubItems', true);
                            arr.push(new Common.UI.TreeViewModel({
                                name : range.asc_getName(),
                                level: 1,
                                index: arr.length,
                                type: 1, // defined name
                                hasParent: true
                            }));
                            prev_level = 1;
                        }
                    }
                    store.reset(arr);
                }
                var rec = this.internalList.store.findWhere({name: this.settings.currentSheet });
                rec && this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                this.btnOk.setDisabled(!rec || rec.get('level')==0);

            } else
                this.btnOk.setDisabled(false);
        },

        onLinkTypeClick: function(type, btn, event) {
            this.ShowHideElem(type);
        },

        onSelectItem: function(picker, item, record, e){
            this.btnOk.setDisabled(record.get('level')==0);
            this.inputRange.setDisabled(record.get('type')==1 || record.get('level')==0);
        },

        textTitle:          'Hyperlink Settings',
        textInternalLink:   'Place in Document',
        textExternalLink:   'Web Link',
        textEmptyLink:      'Enter link here',
        textEmptyDesc:      'Enter caption here',
        textEmptyTooltip:   'Enter tooltip here',
        strSheet:           'Sheet',
        strRange:           'Range',
        strDisplay:         'Display',
        textTipText:        'Screen Tip Text',
        strLinkTo:          'Link To',
        txtEmpty:           'This field is required',
        textInvalidRange:   'ERROR! Invalid cells range',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        textDefault:        'Selected range',
        textSheets:         'Sheets',
        textNames:          'Defined names'
    }, SSE.Views.HyperlinkSettingsDialog || {}))
});