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
                '<div class="box" style="height: 313px;">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-external" style="border-top-right-radius: 0;border-bottom-right-radius: 0;">', this.textExternalLink,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hyperlink-internal" style="border-top-left-radius: 0;border-bottom-left-radius: 0;border-left-width: 0;margin-left: -1px;">', this.textInternalLink,'</button>',
                    '</div>',
                    '<div id="id-external-link">',
                        '<div class="input-row">',
                            '<label>' + this.strLinkTo + '</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '</div>',
                    '<div id="id-internal-link" class="hidden">',
                        '<div class="input-row">',
                            '<label>' + this.strLinkTo + '</label>',
                            '<div style="display: inline-block; position: relative;min-width: 150px;float: right;">',
                                '<label class="link dropdown-toggle" data-toggle="dropdown" id="id-dlg-hyperlink-get-link" style="line-height: 14px; margin-top: 3px;float: right;">' + this.textGetLink + '</label>',
                                '<div id="id-clip-copy-box" class="dropdown-menu" style="width: 291px; left: -139px; padding: 10px;">',
                                    '<div id="id-dlg-clip-copy"></div>',
                                    '<button id="id-dlg-copy-btn" class="btn btn-text-default" style="margin-left: 5px; width: 86px;">' + this.textCopy + '</button>',
                                '</div>',
                            '</div>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-list" style="width:100%; height: 115px;"></div>',
                        '<div class="input-row">',
                            '<label>' + this.strRange + '</label>',
                        '</div>',
                        '<div id="id-dlg-hyperlink-range" class="input-row" style="margin-bottom: 5px;"></div>',
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
            this.appOptions = options.appOptions;
            this.dataRangeValid = '';

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
                    var trimmed = $.trim(value);
                    if (me.api.asc_getFullHyperlinkLength(trimmed)>2083) return me.txtSizeLimit;

                    var urltype = me.api.asc_getUrlType(trimmed);
                    me.isEmail = (urltype==2);
                    return (urltype>0) ? true : me.txtNotUrl;
                }
            });
            me.inputUrl._input.on('input', function (e) {
                me.isInputFirstChange_url && me.inputUrl.showError();
                me.isInputFirstChange_url = false;
                var val = $(e.target).val();
                me.isAutoUpdate && me.inputDisplay.setValue(val);
                me.btnOk.setDisabled($.trim(val)=='');
            });

            me.inputRange = new Common.UI.InputFieldBtn({
                el          : $('#id-dlg-hyperlink-range'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                btnHint     : me.textSelectData,
                validateOnChange: true,
                validateOnBlur: false,
                value: Common.Utils.InternalSettings.get("sse-settings-r1c1") ? 'R1C1' : 'A1',
                validation  : function(value) {
                    if (me.inputRange.isDisabled()) // named range
                        return true;
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.FormatTable, value, false);
                    if (isvalid == Asc.c_oAscError.ID.No) {
                        return true;
                    } else {
                        return me.textInvalidRange;
                    }
                }
            });
            me.inputRange._input.on('input', function (e) {
                me.isInputFirstChange_range && me.inputRange.showError();
                me.isInputFirstChange_range = false;
                var val = $(e.target).val();
                me.isAutoUpdate && me.inputDisplay.setValue(me.internalList.getSelectedRec().get('name') + (val!=='' ? '!' + val : ''));
                me.btnOk.setDisabled($.trim(val)=='');
            });
            me.inputRange.on('button:click', _.bind(me.onSelectData, me));

            me.inputDisplay = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-display'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            });
            me.inputDisplay._input.on('input', function (e) {
                me.isAutoUpdate = ($(e.target).val()=='');
            });

            me.inputTip = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-tip'),
                style       : 'width: 100%;',
                maxLength   : Asc.c_oAscMaxTooltipLength
            });

            me.internalList = new Common.UI.TreeView({
                el: $('#id-dlg-hyperlink-list'),
                store: new Common.UI.TreeViewStore(),
                tabindex: 1,
                enableKeyEvents: true
            });
            me.internalList.on('item:select', _.bind(this.onSelectItem, this));

            if (me.appOptions && me.appOptions.canMakeActionLink) {
                var inputCopy = new Common.UI.InputField({
                    el          : $('#id-dlg-clip-copy'),
                    editable    : false,
                    style       : 'width: 176px;'
                });

                var copyBox = $window.find('#id-clip-copy-box');
                copyBox.on('click', _.bind(function() {
                    return false;
                }, this));
                copyBox.parent().on({
                    'shown.bs.dropdown': function () {
                        _.delay(function(){
                            inputCopy._input.select().focus();
                        },100);
                    }
                });
                copyBox.find('button').on('click', function() {
                    inputCopy._input.select();
                    document.execCommand("copy");
                });

                Common.Gateway.on('setactionlink', function (url) {
                    inputCopy.setValue(url);
                });
            }

            me.linkGetLink = $('#id-dlg-hyperlink-get-link');
            me.linkGetLink.toggleClass('hidden', !(me.appOptions && me.appOptions.canMakeActionLink));

            me.btnOk = new Common.UI.Button({
                el: $window.find('.primary'),
                disabled: true
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            me.internalList.on('entervalue', _.bind(me.onPrimary, me));
            $window.on('click', '#id-dlg-hyperlink-get-link', _.bind(me.getLink, me));

            me.externalPanel = $window.find('#id-external-link');
            me.internalPanel = $window.find('#id-internal-link');
        },

        getFocusedComponents: function() {
            return [this.inputUrl, this.internalList, this.inputRange, this.inputDisplay, this.inputTip];
        },

        setSettings: function(settings) {
            if (settings) {
                var me = this;
                me.settings = settings;

                var type = (settings.props) ? settings.props.asc_getType() : (Common.Utils.InternalSettings.get("sse-settings-link-type") && settings.allowInternal ? Asc.c_oAscHyperlinkType.RangeLink : Asc.c_oAscHyperlinkType.WebLink);
                (type == Asc.c_oAscHyperlinkType.WebLink) ? me.btnExternal.toggle(true) : me.btnInternal.toggle(true);
                me.ShowHideElem(type, settings.props);
                me.btnInternal.setDisabled(!settings.allowInternal && (type == Asc.c_oAscHyperlinkType.WebLink));
                me.btnExternal.setDisabled(!settings.allowInternal && (type == Asc.c_oAscHyperlinkType.RangeLink));

                var defrange = '';
                if (!settings.props) { // add link
                    this.inputDisplay.setValue(settings.isLock ? this.textDefault : settings.text);
                } else {
                    if (type == Asc.c_oAscHyperlinkType.RangeLink) {
                        if (settings.props.asc_getSheet()) {
                            this.inputRange.setValue(settings.props.asc_getRange());
                            this.dataRangeValid = this.inputRange.getValue();
                            defrange = settings.props.asc_getSheet() + '!' +  settings.props.asc_getRange();
                        } else {// named range
                            this.inputRange.setDisabled(true);
                            defrange = settings.props.asc_getLocation();
                        }
                    } else {
                        this.inputUrl.setValue(settings.props.asc_getHyperlinkUrl().replace(new RegExp(" ",'g'), "%20"));
                        this.btnOk.setDisabled($.trim(this.inputUrl.getValue())=='');
                    }
                    this.inputDisplay.setValue(settings.isLock ? this.textDefault : settings.props.asc_getText());
                    this.inputTip.setValue(settings.props.asc_getTooltip());
                }
                this.inputDisplay.setDisabled(settings.isLock);
                !settings.isLock && (this.isAutoUpdate = (this.inputDisplay.getValue()=='' || type == Asc.c_oAscHyperlinkType.WebLink && me.inputUrl.getValue()==me.inputDisplay.getValue()) ||
                                                                                              type == Asc.c_oAscHyperlinkType.RangeLink && defrange==me.inputDisplay.getValue());
            }
        },

        getSettings: function() {
            var props = new Asc.asc_CHyperlink(),
                def_display = "",
                type = this.btnInternal.isActive() ? Asc.c_oAscHyperlinkType.RangeLink : Asc.c_oAscHyperlinkType.WebLink;
            props.asc_setType(type);

            if (type==Asc.c_oAscHyperlinkType.RangeLink) {
                var rec = this.internalList.getSelectedRec();
                if (rec && rec.get('level')>0) {
                    if (rec.get('type')) {// named range
                        props.asc_setSheet(null);
                        props.asc_setLocation(rec.get('name'));
                        def_display = rec.get('name');
                    } else {
                        props.asc_setSheet(rec.get('name'));
                        props.asc_setRange(this.inputRange.getValue());
                        def_display = rec.get('name') + '!' + this.inputRange.getValue();
                    }
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
                if (_.isEmpty(this.inputDisplay.getValue()) || type==Asc.c_oAscHyperlinkType.WebLink && this.isAutoUpdate)
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
                        this.inputUrl.focus();
                        this.isInputFirstChange_url = true;
                        return;
                    }
                    if (checkrange !== true)  {
                        this.inputRange.focus();
                        this.isInputFirstChange_range = true;
                        return;
                    }
                    if (checkdisp !== true) {
                        this.inputDisplay.focus();
                        return;
                    }
                    !this.settings.props && Common.Utils.InternalSettings.set("sse-settings-link-type", this.btnInternal.isActive()); // save last added hyperlink
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        ShowHideElem: function(value, props) {
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
                        isExpanded: false,
                        hasSubItems: true
                    }));
                    for (var i=0; i<count; i++) {
                        !sheets[i].hidden && arr.push(new Common.UI.TreeViewModel({
                            name : sheets[i].name,
                            level: 1,
                            index: i+1,
                            type: 0, // sheet
                            isVisible: false,
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
                        isExpanded: false,
                        hasSubItems: false
                    }));
                    var definedNames = arr[arr.length-1];
                    var ranges = this.settings.ranges,
                        prev_level = 0;
                    count = ranges.length;
                    for (var i=0; i<count; i++) {
                        var range = ranges[i],
                            scope = range.asc_getScope();
                        if (!range.asc_getIsHidden()) {
                            if (prev_level<1)
                                arr[arr.length-1].set('hasSubItems', true);
                            arr.push(new Common.UI.TreeViewModel({
                                name : (range.asc_getIsXlnm() && sheets[scope] ? sheets[scope].name + '!' : '') + range.asc_getName(), // add sheet name for print area
                                level: 1,
                                index: arr.length,
                                type: 1, // defined name
                                isVisible: false,
                                hasParent: true
                            }));
                            prev_level = 1;
                        }
                    }
                    store.reset(arr);
                    var sheet = props ? (props.asc_getSheet() || props.asc_getLocation()) : this.settings.currentSheet,
                        rec = store.findWhere({name: sheet });
                    if (rec) {
                        this.internalList.expandRecord(rec.get('type') ? definedNames : store.at(0));
                        this.internalList.scrollToRecord(this.internalList.selectRecord(rec));
                    }
                }
                var rec = this.internalList.getSelectedRec();
                this.btnOk.setDisabled(!rec || rec.get('level')==0 || rec.get('type')==0 && $.trim(this.inputRange.getValue())=='');
                var me = this;
                _.delay(function(){
                    if (me.inputRange.isDisabled())
                        me.internalList.focus();
                    else
                        me.inputRange.focus();
                },50);
            } else {
                this.btnOk.setDisabled($.trim(this.inputUrl.getValue())=='');
                var me = this;
                _.delay(function(){
                    me.inputUrl.focus();
                },50);
            }
        },

        onLinkTypeClick: function(type, btn, event) {
            this.ShowHideElem(type);
            if (this.isAutoUpdate) {
                if (type==Asc.c_oAscHyperlinkType.RangeLink) {
                    var rec = this.internalList.getSelectedRec(),
                        list = rec && rec.get('level') ? rec.get('name') : '';
                    if (rec && rec.get('type')==1) {
                        this.inputDisplay.setValue(list);
                    } else {
                        var val = this.inputRange.getValue();
                        this.inputDisplay.setValue(list + (list!=='' && val!=='' ? '!' : '') + val);
                    }

                } else {
                    this.inputDisplay.setValue(this.inputUrl.getValue());
                }
            }
        },

        onSelectItem: function(picker, item, record, e){
            this.btnOk.setDisabled(record.get('level')==0 || record.get('type')==0 && $.trim(this.inputRange.getValue())=='');
            this.inputRange.setDisabled(record.get('type')==1 || record.get('level')==0);
            if (this.isAutoUpdate) {
                var list = record.get('level') ? record.get('name') : '';
                if (record.get('type')==1) {
                    this.inputDisplay.setValue(list);
                } else {
                    var val = this.inputRange.getValue();
                    this.inputDisplay.setValue(list + ((list!=='' && val!=='') ? '!' : '') + val);
                }
            }
            this.linkGetLink.toggleClass('disabled', record.get('level')==0);
        },

        getLink: function(btn) {
            if (btn.cmpEl && btn.cmpEl.parent().hasClass('open')) return;

            var record = this.internalList.getSelectedRec();
            if (record && record.get('level')) {
                var name = record.get('name');
                if (record.get('type')==1) {
                    this.inputDisplay.setValue(name);
                } else {
                    var val = this.inputRange.getValue();
                    name = this.api.asc_getEscapeSheetName(name);
                    name = (name + ((name!=='' && val!=='') ? '!' : '') + val);
                }
                name && Common.Gateway.requestMakeActionLink({
                    action: {
                        type: "internallink", data: name
                    }
                });
            }
        },

        onSelectData: function() {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        me.dataRangeValid = dlg.getSettings();
                        me.inputRange.setValue(me.dataRangeValid);
                        me.inputRange.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                    _.delay(function(){
                        me.inputRange.focus();
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(me.inputRange.getValue()) && (me.inputRange.checkValidate()==true)) ? me.inputRange.getValue() : me.dataRangeValid,
                    type    : Asc.c_oAscSelectionDialogType.FormatTable
                });
            }
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
        textNames:          'Defined names',
        textGetLink: 'Get Link',
        textCopy: 'Copy',
        textSelectData: 'Select data',
        txtSizeLimit: 'This field is limited to 2083 characters'
    }, SSE.Views.HyperlinkSettingsDialog || {}))
});