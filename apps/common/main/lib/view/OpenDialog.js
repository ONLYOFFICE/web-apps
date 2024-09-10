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
 *  OpenDialog.js
 *
 *  Select Codepage for open CSV/TXT format file.
 *
 *  Created on 29/04/14
 *
 */

define([
    'common/main/lib/component/Window'
], function () {
    'use strict';

    Common.Views.OpenDialog = Common.UI.Window.extend(_.extend({

        applyFunction: undefined,

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                closable        : false, // true if save settings
                preview         : options.preview,
                warning         : options.warning,
                codepages       : options.codepages,
                warningMsg      : options.warningMsg,
                width           : options.preview ? 414 : (options.type !== Common.Utils.importTextType.DRM) ? 340 : (options.warning ? 420 : 280),
                header          : true,
                cls             : 'modal-dlg open-dlg',
                contentTemplate : '',
                toolcallback    : _.bind(t.onToolClose, t),
                closeFile       : false,
                buttons         : ['ok'].concat(options.closeFile ? [{value: 'cancel', caption: this.closeButtonText}] : []).concat(options.closable ? ['cancel'] : []),
            }, options);

            this.txtOpenFile = options.txtOpenFile || this.txtOpenFile;

            this.template = options.template || [
                '<div class="box">',
                    '<div class="content-panel" >',
                    '<% if (type == Common.Utils.importTextType.DRM) { %>',
                        '<% if (warning) { %>',
                        '<div>',
                            '<div class="icon warn"></div>',
                            '<div class="padding-left-50"><div style="font-size: 12px;word-break:break-word;">' + (typeof _options.warningMsg=='string' ? _options.warningMsg : t.txtProtected) + '</div>',
                                '<label class="header" style="margin-top: 15px;">' + t.txtPassword + '</label>',
                                '<div id="id-password-txt" style="width: 290px;"></div></div>',
                        '</div>',
                        '<% } else { %>',
                        '<div>',
                            '<label class="">' + t.txtOpenFile + '</label>',
                            '<div id="id-password-txt"></div>',
                        '</div>',
                        '<% } %>',
                    '<% } else { %>',
                        '<% if (codepages && codepages.length>0) { %>',
                        '<div <% if (!!preview && (type == Common.Utils.importTextType.CSV || type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns)) { %> class="margin-right-10" style="width: 230px;display: inline-block;" <% } else { %> style="width: 100%;"<% } %> >',
                            '<label class="header">' + t.txtEncoding + '</label>',
                            '<div>',
                            '<div id="id-codepages-combo" class="input-group-nr" style="width: 100%; display: inline-block; vertical-align: middle;"></div>',
                            '</div>',
                        '</div>',
                        '<% } %>',
                        '<% if (type == Common.Utils.importTextType.CSV) { %>',
                        '<div style="display: inline-block; <% if (!preview) { %> margin-top:15px;<% } %>">',
                            '<label class="header">' + t.txtDelimiter + '</label>',
                            '<div>',
                                '<div id="id-delimiters-combo" class="input-group-nr" style="max-width: 100px;display: inline-block; vertical-align: middle;"></div>',
                                '<div id="id-delimiter-other" class="input-row margin-left-10" style="display: inline-block; vertical-align: middle;"></div>',
                            '</div>',
                        '</div>',
                        '<% } %>',
                        '<% if (type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns || type == Common.Utils.importTextType.Data) { %>',
                        '<div style="display: inline-block; <% if (codepages && codepages.length>0) { %>margin-top:15px;<% } %>width: 100%;">',
                            '<label class="header">' + t.txtDelimiter + '</label>',
                            '<div>',
                                '<div id="id-delimiters-combo" class="input-group-nr" style="max-width: 100px;display: inline-block; vertical-align: middle;"></div>',
                                '<div id="id-delimiter-other" class="input-row margin-left-10" style="display: inline-block; vertical-align: middle;"></div>',
                                '<button type="button" class="btn auto btn-text-default float-right" id="id-delimiters-advanced" style="min-width:100px; display: inline-block;">' + t.txtAdvanced + '</button>',
                            '</div>',
                        '</div>',
                        '<% } %>',
                        '<% if (!!preview) { %>',
                            '<div style="margin-top:15px;">',
                                '<label class="header">' + t.txtPreview + '</label>',
                                '<div style="position: relative;">',
                                    '<div style="width: 100%;">',
                                        '<div id="id-preview">',
                                            '<div>',
                                                '<div style="position: absolute; top: 0;"><div id="id-preview-data"></div></div>',
                                            '</div>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        '<% } %>',
                        '<% if (type == Common.Utils.importTextType.Data) { %>',
                            '<label class="header" style="margin-top:15px;">' + t.txtDestData + '</label>',
                            '<div id="id-open-data-range" class="input-row" style="width: 100%;"></div>',
                        '<% } %>',
                    '<% } %>',
                    '</div>',
                '</div>'
            ].join('');

            this.handler        =   _options.handler;
            this.type           =   _options.type;
            this.preview        =   _options.preview;
            this.previewData    =   _options.previewData;
            this.warning        =   _options.warning || false;
            this.closable       =   _options.closable;
            this.codepages      =   _options.codepages;
            this.settings       =   _options.settings;
            this.api            =   _options.api;
            this.validatePwd    =   _options.validatePwd || false;

            _options.tpl        =   _.template(this.template)(_options);

            this._previewTdWidth = [];
            this._previewTdMaxLength = 0;
            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            if (this.$window) {
                var me = this;
                if (!this.closable)
                    this.$window.find('.tool').hide();
                this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

                this.previewPanel = this.$window.find('#id-preview-data');
                this.previewParent = this.previewPanel.parent();
                this.previewScrolled = this.$window.find('#id-preview');
                this.previewInner = this.previewScrolled.find('> div:first-child');

                if (this.type == Common.Utils.importTextType.DRM) {
                    this.inputPwd = new Common.UI.InputFieldBtnPassword({
                        el: $('#id-password-txt'),
                        type: 'password',
                        showCls: (this.options.iconType==='svg' ? 'svg-icon' : 'toolbar__icon') + ' btn-sheet-view',
                        hideCls: (this.options.iconType==='svg' ? 'svg-icon hide-password' : 'toolbar__icon btn-hide-password'),
                        maxLength: this.options.maxPasswordLength,
                        validateOnBlur: false,
                        showPwdOnClick: false,
                        validation  : function(value) {
                            return me.txtIncorrectPwd;
                        }
                    });
                } else {
                    this.initCodePages();
                    if (this.preview) {
                        (this.previewData) ? this.previewCallback(this.previewData) : this.updatePreview();
                    }
                }
                if (this.type == Common.Utils.importTextType.Data) {
                    this.txtDestRange = new Common.UI.InputFieldBtn({
                        el          : $('#id-open-data-range'),
                        name        : 'range',
                        style       : 'width: 100%;',
                        btnHint     : this.textSelectData,
                        allowBlank  : true,
                        validateOnChange: true,
                        validateOnBlur: false
                    });
                    this.txtDestRange.on('button:click', _.bind(this.onSelectData, this));
                    this.dataDestValid = this.api.asc_getActiveRangeStr(Asc.referenceType.A, true);
                    this.txtDestRange.setValue(this.dataDestValid);
                }

                this.onPrimary = function() {
                    me._handleInput('ok');
                    return false;
                };
            }
        },

        getFocusedComponents: function() {
            var arr = [];
            this.inputPwd && arr.push(this.inputPwd);
            this.cmbEncoding && arr.push(this.cmbEncoding);
            this.cmbDelimiter && arr.push(this.cmbDelimiter);
            this.inputDelimiter && arr.push(this.inputDelimiter);
            this.btnAdvanced && arr.push(this.btnAdvanced);
            this.txtDestRange && arr.push(this.txtDestRange);

            return arr.concat(this.getFooterButtons());
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
             if (this.type == Common.Utils.importTextType.DRM) {
                 setTimeout(function(){
                     me.inputPwd.focus();
                     if (me.validatePwd)
                         me.inputPwd.checkValidate();
                 }, 500);
             } else {
                 var cmp = me.txtDestRange ? me.txtDestRange : (me.cmbEncoding ? me.cmbEncoding : me.cmbDelimiter);
                 cmp && setTimeout(function(){cmp.focus();}, 500);
             }
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onToolClose: function() {
            this._handleInput('cancel');
        },

        _handleInput: function(state) {
            if (this.handler) {
                if (this.type == Common.Utils.importTextType.DRM) {
                    this.handler.call(this, state, {drmOptions: new Asc.asc_CDRMAdvancedOptions(this.inputPwd.getValue())});
                } else {
                    if ( this.type == Common.Utils.importTextType.Data && state == 'ok' && !this.isRangeValid() ) {
                        return;
                    }

                    var encoding = (this.cmbEncoding && !this.cmbEncoding.isDisabled()) ? this.cmbEncoding.getValue() :
                            ((this.settings && this.settings.asc_getCodePage()) ? this.settings.asc_getCodePage() : 0),
                        delimiter = this.cmbDelimiter ? this.cmbDelimiter.getValue() : null,
                        delimiterChar = (delimiter == -1) ? this.inputDelimiter.getValue() : null;
                    (delimiter == -1) && (delimiter = null);
                    if (!this.closable && this.type == Common.Utils.importTextType.TXT) { //save last encoding only for opening txt files
                        Common.localStorage.setItem("de-settings-open-encoding", encoding);
                    }
                    if (this.type === Common.Utils.importTextType.CSV) { // only for csv files
                        Common.localStorage.setItem("sse-settings-csv-delimiter", delimiter === null ? -1 : delimiter);
                        Common.localStorage.setItem("sse-settings-csv-delimiter-char", delimiterChar || '');
                        Common.localStorage.setItem("sse-settings-csv-encoding", encoding);
                    }

                    var decimal = this.separatorOptions ? this.separatorOptions.decimal : undefined,
                        thousands = this.separatorOptions ? this.separatorOptions.thousands : undefined,
                        qualifier = this.separatorOptions ? this.separatorOptions.qualifier : '"';
                    var options = new Asc.asc_CTextOptions(encoding, delimiter, delimiterChar);
                    decimal && options.asc_setNumberDecimalSeparator(decimal);
                    thousands && options.asc_setNumberGroupSeparator(thousands);
                    qualifier && options.asc_setTextQualifier(qualifier);
                    this.handler.call(this, state, {
                        textOptions: options,
                        range: this.txtDestRange ? this.txtDestRange.getValue() : '',
                        data: this.data
                    });
                }
            }

            this.close();
        },

        initCodePages: function () {
            var i, c, codepage, encodedata = [], listItems = [], length = 0, lcid_width = 0;

            if (this.codepages) {
                encodedata = [];
                for (i = 0; i < this.codepages.length; ++i) {
                    codepage = this.codepages[i];
                    c = [];
                    c[0] = codepage.asc_getCodePage();
                    c[1] = codepage.asc_getCodePageName();
                    c[2] = codepage.asc_getLcid();

                    encodedata.push(c);
                }
                lcid_width = 50;
            }
            length = encodedata.length;

            if (length) {
                for (i = 0; i < length; ++i) {
                    listItems.push({
                        value: encodedata[i][0],
                        displayValue: Common.Utils.String.htmlEncode(encodedata[i][1]),
                        lcid: encodedata[i][2] || ''
                    });
                }

                var itemsTemplate =
                    _.template([
                        '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                        '<div style="display: inline-block;"><%= item.displayValue %></div>',
                        '<label class="text-align-right" style="width:' + lcid_width + 'px;"><%= item.lcid %></label>',
                        '</a></li>',
                        '<% }); %>'
                    ].join(''));

                this.cmbEncoding = new Common.UI.ComboBox({
                    el: $('#id-codepages-combo', this.$window),
                    style: 'width: 100%;',
                    menuStyle: 'min-width: 100%; max-height: 200px;',
                    cls: 'input-group-nr',
                    menuCls: 'scrollable-menu',
                    data: listItems,
                    editable: false,
                    disabled: true,
                    search: true,
                    itemsTemplate: itemsTemplate,
                    takeFocusOnClose: true
                });

                this.cmbEncoding.setDisabled(false);
                var encoding = (this.settings && this.settings.asc_getCodePage()) ? this.settings.asc_getCodePage() : encodedata[0][0];
                if (!this.closable && this.type == Common.Utils.importTextType.TXT) { // only for opening txt files
                    var value = Common.localStorage.getItem("de-settings-open-encoding");
                    value && (encoding = parseInt(value));
                } else if (this.type === Common.Utils.importTextType.CSV) { // only for csv files
                    var value = Common.localStorage.getItem("sse-settings-csv-encoding");
                    value && (encoding = parseInt(value));
                }
                this.cmbEncoding.setValue(encoding);
                if (this.preview)
                    this.cmbEncoding.on('selected', _.bind(this.onCmbEncodingSelect, this));

                var ul = this.cmbEncoding.cmpEl.find('ul'),
                    a = ul.find('li:nth(0) a'),
                    width = ul.width() - parseInt(a.css('padding-left')) - parseInt(a.css('padding-right')) - 50;
                ul.find('li div').width(width);
            }

            if (this.type == Common.Utils.importTextType.CSV || this.type == Common.Utils.importTextType.Paste || this.type == Common.Utils.importTextType.Columns || this.type == Common.Utils.importTextType.Data) {
                var delimiter = this.settings && this.settings.asc_getDelimiter() ? this.settings.asc_getDelimiter() : 4,
                    delimiterChar = this.settings && this.settings.asc_getDelimiterChar() ? this.settings.asc_getDelimiterChar() : '';
                if (this.type == Common.Utils.importTextType.CSV) { // only for csv files
                    var value = Common.localStorage.getItem("sse-settings-csv-delimiter");
                    if (value) {
                        value = parseInt(value);
                        if (!isNaN(value)) {
                            delimiter = value;
                            (delimiter===-1) && (delimiterChar = Common.localStorage.getItem("sse-settings-csv-delimiter-char") || '');
                        }
                    }
                }

                this.cmbDelimiter = new Common.UI.ComboBox({
                    el: $('#id-delimiters-combo', this.$window),
                    style: 'width: 100px;',
                    menuStyle: 'min-width: 100px;',
                    cls: 'input-group-nr',
                    data: [
                        {value: 4, displayValue: this.txtComma},
                        {value: 2, displayValue: this.txtSemicolon},
                        {value: 3, displayValue: this.txtColon},
                        {value: 1, displayValue: this.txtTab},
                        {value: 5, displayValue: this.txtSpace},
                        {value: -1, displayValue: this.txtOther}],
                    editable: false,
                    takeFocusOnClose: true
                });
                this.cmbDelimiter.setValue( delimiter);
                this.cmbDelimiter.on('selected', _.bind(this.onCmbDelimiterSelect, this));

                this.inputDelimiter = new Common.UI.InputField({
                    el          : $('#id-delimiter-other'),
                    style       : 'width: 30px;',
                    maxLength: 1,
                    validateOnChange: true,
                    validateOnBlur: false,
                    value: delimiterChar
                });
                this.inputDelimiter.setVisible(delimiter===-1);
                if (this.preview)
                    this.inputDelimiter.on ('changing', _.bind(this.updatePreview, this));

                if (this.type == Common.Utils.importTextType.Paste || this.type == Common.Utils.importTextType.Columns || this.type == Common.Utils.importTextType.Data) {
                    this.btnAdvanced = new Common.UI.Button({
                        el: $('#id-delimiters-advanced')
                    });
                    this.btnAdvanced.on('click', _.bind(this.onAdvancedClick, this));
                }
            }
        },

        updatePreview: function() {
            this._previewTdWidth = [];
            this._previewTdMaxLength = 0;

            var encoding = (this.cmbEncoding && !this.cmbEncoding.isDisabled()) ? this.cmbEncoding.getValue() :
                ((this.settings && this.settings.asc_getCodePage()) ? this.settings.asc_getCodePage() : 0);
            var delimiter = this.cmbDelimiter ? this.cmbDelimiter.getValue() : null,
                delimiterChar = (delimiter == -1) ? this.inputDelimiter.getValue() : null;
            (delimiter == -1) && (delimiter = null);

            var options = new Asc.asc_CTextOptions(encoding, delimiter, delimiterChar);
            if (this.separatorOptions) {
                options.asc_setNumberDecimalSeparator(this.separatorOptions.decimal);
                options.asc_setNumberGroupSeparator(this.separatorOptions.thousands);
                options.asc_setTextQualifier(this.separatorOptions.qualifier);
            }

            switch (this.type) {
                case Common.Utils.importTextType.CSV:
                case Common.Utils.importTextType.TXT:
                case Common.Utils.importTextType.Data:
                    this.api.asc_decodeBuffer(this.preview, options, _.bind(this.previewCallback, this));
                    break;
                case Common.Utils.importTextType.Paste:
                case Common.Utils.importTextType.Columns:
                    this.api.asc_TextImport(options, _.bind(this.previewCallback, this), this.type == Common.Utils.importTextType.Paste);
                    break;
            }
        },

        previewCallback: function(data) {
            if (!data || !data.length) return;

            this.data = data;
            this.previewInner.height(data.length*17);

            if (!this.scrollerY)
                this.scrollerY = new Common.UI.Scroller({
                el: this.previewScrolled,
                minScrollbarLength  : 20,
                alwaysVisibleY: true,
                alwaysVisibleX: true,
                onChange: _.bind(function(){
                    if (this.scrollerY) {
                        var startPos = this.scrollerY.getScrollTop(),
                            start = Math.floor(startPos/17+0.5),
                            end = start+Math.min(6, this.data.length);
                        if (end>this.data.length) {
                            end = this.data.length;
                            start = this.data.length-6;
                            startPos = start*17;
                        }
                        this.previewParent.height(108);
                        this.previewParent.css({top: startPos});
                        this.previewDataBlock(this.data.slice(start, end));
                    }
                }, this)
            });
            this.scrollerY.update();
            this.scrollerY.scrollTop(0);
        },

        previewDataBlock: function(data) {
            if (!_.isUndefined(this.scrollerX)) {
                this.scrollerX.destroy();
                delete this.scrollerX;
            }

            if (this.type == Common.Utils.importTextType.CSV || this.type == Common.Utils.importTextType.Paste || this.type == Common.Utils.importTextType.Columns || this.type == Common.Utils.importTextType.Data) {
                var maxlength = 0;
                for (var i=0; i<data.length; i++) {
                    var str = data[i] || '';
                    if (str.length>maxlength)
                        maxlength = str.length;
                }
                this._previewTdMaxLength = Math.max(this._previewTdMaxLength, maxlength);
                var tpl = '<table>';
                for (var i=0; i<data.length; i++) {
                    var str = data[i] || '';
                    tpl += '<tr style="vertical-align: top;">';
                    for (var j=0; j<str.length; j++) {
                        var style = '';
                        if (i==0 && this._previewTdWidth[j]) { // set td style only for first tr
                            style = 'style="min-width:' + this._previewTdWidth[j] + 'px;"';
                        }
                        tpl += '<td '+ style +'>' + Common.Utils.String.htmlEncode(str[j]) + '</td>';
                    }
                    for (j=str.length; j<this._previewTdMaxLength; j++) {
                        var style = '';
                        if (i==0 && this._previewTdWidth[j]) { // set td style only for first tr
                            style = 'style="min-width:' + this._previewTdWidth[j] + 'px;"';
                        }
                        tpl += '<td '+ style +'></td>';
                    }
                    tpl += '</tr>';
                }
                tpl += '</table>';
            } else {
                var tpl = '<table>';
                for (var i=0; i<data.length; i++) {
                    var str = data[i] || '';
                    tpl += '<tr style="vertical-align: top;"><td>' + Common.Utils.String.htmlEncode(str) + '</td></tr>';
                }
                tpl += '</table>';
            }
            this.previewPanel.html(tpl);

            if (data.length>0) {
                var me = this;
                (this._previewTdWidth.length===0) && this.previewScrolled.scrollLeft(0);
                this.previewPanel.find('tr:first td').each(function(index, el){
                    me._previewTdWidth[index] = Math.max(Math.max(Math.ceil($(el).outerWidth()), 30), me._previewTdWidth[index] || 0);
                });
            }

            this.scrollerX = new Common.UI.Scroller({
                el: this.previewPanel,
                suppressScrollY: true,
                alwaysVisibleX: true,
                minScrollbarLength  : 20
            });
        },

        onCmbDelimiterSelect: function(combo, record){
            this.inputDelimiter.setVisible(record.value == -1);
            var me = this;
            if (record.value == -1)
                setTimeout(function(){me.inputDelimiter.focus();}, 10);
            if (this.preview)
                this.updatePreview();
        },

        onCmbEncodingSelect: function(combo, record){
            this.updatePreview();
        },

        onAdvancedClick: function() {
            if (!SSE) return;

            var me = this,
                decimal = this.separatorOptions ? this.separatorOptions.decimal : this.api.asc_getDecimalSeparator(),
                thousands = this.separatorOptions ? this.separatorOptions.thousands : this.api.asc_getGroupSeparator(),
                qualifier = this.separatorOptions ? this.separatorOptions.qualifier : (this.settings || (new Asc.asc_CTextOptions())).asc_getTextQualifier();
            (new SSE.Views.AdvancedSeparatorDialog({
                props: {
                    decimal: decimal,
                    thousands: thousands,
                    qualifier: qualifier
                },
                handler: function(result, value) {
                    if (result == 'ok') {
                        me.separatorOptions = {
                            decimal: (value.decimal.length > 0) ? value.decimal : decimal,
                            thousands: (value.thousands.length > 0) ? value.thousands : thousands,
                            qualifier: value.qualifier
                        };
                        me.preview && me.updatePreview();
                    }
                }
            })).on('close', function() {
                me.btnAdvanced.focus();
            }).show();
        },

        onSelectData: function(type) {
            var me = this,
                txtRange = me.txtDestRange;

            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        var txt = dlg.getSettings();
                        me.dataDestValid = txt;
                        txtRange.setValue(txt);
                        txtRange.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                    _.delay(function(){
                        txtRange.focus();
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(txtRange.getValue()) && (txtRange.checkValidate()==true)) ? txtRange.getValue() : (me.dataDestValid),
                    type    : Asc.c_oAscSelectionDialogType.Chart
                });
            }
        },

        isRangeValid: function() {
            var isvalid = true,
                txtError = '';
            if (_.isEmpty(this.txtDestRange.getValue())) {
                isvalid = false;
                txtError = this.txtEmpty;
            } else {
                isvalid = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, this.txtDestRange.getValue());
                isvalid = (isvalid == Asc.c_oAscError.ID.No);
                !isvalid && (txtError = this.textInvalidRange);
            }
            if (!isvalid) {
                this.txtDestRange.showError([txtError]);
                this.txtDestRange.focus();
                return isvalid;
            }

            return isvalid;
        },

        txtDelimiter       : "Delimiter",
        txtEncoding        : "Encoding ",
        txtSpace           : "Space",
        txtTab             : "Tab",
        txtTitle           : "Choose %1 options",
        txtPassword        : "Password",
        txtTitleProtected  : "Protected File",
        txtOther: 'Other',
        txtIncorrectPwd: 'Password is incorrect.',
        closeButtonText: 'Close File',
        txtPreview: 'Preview',
        txtComma: 'Comma',
        txtColon: 'Colon',
        txtSemicolon: 'Semicolon',
        txtProtected: 'Once you enter the password and open the file, the current password to the file will be reset.',
        txtAdvanced: 'Advanced',
        txtOpenFile: "Enter a password to open the file",
        textSelectData: 'Select data',
        txtDestData: 'Choose where to put the data',
        txtEmpty:           'This field is required',
        textInvalidRange:   'Invalid cells range'

    }, Common.Views.OpenDialog || {}));
});