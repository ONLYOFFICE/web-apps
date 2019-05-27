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
 *  OpenDialog.js
 *
 *  Select Codepage for open CSV/TXT format file.
 *
 *  Created by Alexey.Musinov on 29/04/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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

            var width, height;

            if (options.preview) {
                width = 414;
                height = 277;
            } else {
                width = (options.type !== Common.Utils.importTextType.DRM) ? 340 : (options.warning ? 370 : 262);
                height = (options.type == Common.Utils.importTextType.CSV || options.type == Common.Utils.importTextType.Paste || options.type == Common.Utils.importTextType.Columns) ? 190 : (options.warning ? 187 : 147);
            }

            _.extend(_options,  {
                closable        : false, // true if save settings
                preview         : options.preview,
                warning         : options.warning,
                codepages       : options.codepages,
                width           : width,
                height          : height,
                header          : true,
                cls             : 'open-dlg',
                contentTemplate : '',
                toolcallback    : _.bind(t.onToolClose, t),
                closeFile       : false

            }, options);

            this.template = options.template || [
                '<div class="box" style="height:' + (_options.height - 85) + 'px;">',
                    '<div class="content-panel" >',
                    '<% if (type == Common.Utils.importTextType.DRM) { %>',
                        '<% if (warning) { %>',
                        '<div>',
                            '<div class="icon img-commonctrl warn"/>',
                            '<div style="padding-left: 50px;"><div style="font-size: 12px;">' + t.txtProtected+ '</div>',
                                '<label class="header" style="margin-top: 15px;">' + t.txtPassword + '</label>',
                                '<div id="id-password-txt" style="width: 240px;"></div></div>',
                        '</div>',
                        '<% } else { %>',
                        '<div>',
                            '<label class="header">' + t.txtPassword + '</label>',
                            '<div id="id-password-txt"></div>',
                        '</div>',
                        '<% } %>',
                    '<% } else { %>',
                        '<% if (codepages && codepages.length>0) { %>',
                        '<div style="<% if (!!preview && (type == Common.Utils.importTextType.CSV || type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns)) { %>width: 230px;margin-right: 10px;display: inline-block;<% } else { %>width: 100%;<% } %>margin-bottom:15px;">',
                            '<label class="header">' + t.txtEncoding + '</label>',
                            '<div>',
                            '<div id="id-codepages-combo" class="input-group-nr" style="width: 100%; display: inline-block; vertical-align: middle;"></div>',
                            '</div>',
                        '</div>',
                        '<% } %>',
                        '<% if (type == Common.Utils.importTextType.CSV || type == Common.Utils.importTextType.Paste || type == Common.Utils.importTextType.Columns) { %>',
                        '<div style="display: inline-block; margin-bottom:15px;">',
                            '<label class="header">' + t.txtDelimiter + '</label>',
                            '<div>',
                                '<div id="id-delimiters-combo" class="input-group-nr" style="max-width: 100px;display: inline-block; vertical-align: middle;"></div>',
                                '<div id="id-delimiter-other" class="input-row" style="display: inline-block; vertical-align: middle;margin-left: 10px;"></div>',
                            '</div>',
                        '</div>',
                        '<% } %>',
                        '<% if (!!preview) { %>',
                            '<div style="">',
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
                    '<% } %>',
                    '</div>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok">' + t.okButtonText + '</button>',
                    '<% if (closeFile) { %>',
                    '<button class="btn normal dlg-btn" result="cancel" style="margin-left:10px;">' + t.closeButtonText + '</button>',
                    '<% } %>',
                    '<% if (closable) { %>',
                    '<button class="btn normal dlg-btn" result="cancel" style="margin-left:10px;">' + t.cancelButtonText + '</button>',
                    '<% } %>',
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
                this.previewInner = this.previewScrolled.find('div:first-child');

                if (this.type == Common.Utils.importTextType.DRM) {
                    this.inputPwd = new Common.UI.InputField({
                        el: $('#id-password-txt'),
                        type: 'text',
                        validateOnBlur: false,
                        validation  : function(value) {
                            return me.txtIncorrectPwd;
                        }
                    });

                    this.$window.find('input').on('input', function(){
                        if ($(this).val() !== '') {
                            ($(this).attr('type') !== 'password') && $(this).attr('type', 'password');
                        } else {
                            $(this).attr('type', 'text');
                        }
                    });
                } else {
                    this.initCodePages();
                    if (this.preview) {
                        (this.previewData) ? this.previewCallback(this.previewData) : this.updatePreview();
                    }
                }
                this.onPrimary = function() {
                    me._handleInput('ok');
                    return false;
                };
            }
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

             if (this.type == Common.Utils.importTextType.DRM) {
                 var me = this;
                 setTimeout(function(){
                     me.inputPwd.cmpEl.find('input').focus();
                     if (me.validatePwd)
                         me.inputPwd.checkValidate();
                 }, 500);
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
                    this.handler.call(this, state, this.inputPwd.getValue());
                } else {
                    var encoding = (this.cmbEncoding && !this.cmbEncoding.isDisabled()) ? this.cmbEncoding.getValue() :
                            ((this.settings && this.settings.asc_getCodePage()) ? this.settings.asc_getCodePage() : 0),
                        delimiter = this.cmbDelimiter ? this.cmbDelimiter.getValue() : null,
                        delimiterChar = (delimiter == -1) ? this.inputDelimiter.getValue() : null;
                    (delimiter == -1) && (delimiter = null);
                    this.handler.call(this, state, encoding, delimiter, delimiterChar);
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
                        '<label style="text-align: right;width:' + lcid_width + 'px;"><%= item.lcid %></label>',
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
                    itemsTemplate: itemsTemplate
                });

                this.cmbEncoding.setDisabled(false);
                this.cmbEncoding.setValue((this.settings && this.settings.asc_getCodePage()) ? this.settings.asc_getCodePage() : encodedata[0][0]);
                if (this.preview)
                    this.cmbEncoding.on('selected', _.bind(this.onCmbEncodingSelect, this));

                var ul = this.cmbEncoding.cmpEl.find('ul'),
                    a = ul.find('li:nth(0) a'),
                    width = ul.width() - parseInt(a.css('padding-left')) - parseInt(a.css('padding-right')) - 50;
                ul.find('li div').width(width);
            }

            if (this.type == Common.Utils.importTextType.CSV || this.type == Common.Utils.importTextType.Paste || this.type == Common.Utils.importTextType.Columns) {
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
                    editable: false
                });
                this.cmbDelimiter.setValue( (this.settings && this.settings.asc_getDelimiter()) ? this.settings.asc_getDelimiter() : 4);
                this.cmbDelimiter.on('selected', _.bind(this.onCmbDelimiterSelect, this));

                this.inputDelimiter = new Common.UI.InputField({
                    el          : $('#id-delimiter-other'),
                    style       : 'width: 30px;',
                    maxLength: 1,
                    validateOnChange: true,
                    validateOnBlur: false,
                    value: (this.settings && this.settings.asc_getDelimiterChar()) ? this.settings.asc_getDelimiterChar() : ''
                });
                this.inputDelimiter.setVisible(false);
                if (this.preview)
                    this.inputDelimiter.on ('changing', _.bind(this.updatePreview, this));
            }
        },

        updatePreview: function() {
            var encoding = (this.cmbEncoding && !this.cmbEncoding.isDisabled()) ? this.cmbEncoding.getValue() :
                ((this.settings && this.settings.asc_getCodePage()) ? this.settings.asc_getCodePage() : 0);
            var delimiter = this.cmbDelimiter ? this.cmbDelimiter.getValue() : null,
                delimiterChar = (delimiter == -1) ? this.inputDelimiter.getValue() : null;
            (delimiter == -1) && (delimiter = null);

            switch (this.type) {
                case Common.Utils.importTextType.CSV:
                    this.api.asc_decodeBuffer(this.preview, new Asc.asc_CCSVAdvancedOptions(encoding, delimiter, delimiterChar), _.bind(this.previewCallback, this));
                    break;
                case Common.Utils.importTextType.TXT:
                    this.api.asc_decodeBuffer(this.preview, new Asc.asc_CTXTAdvancedOptions(encoding), _.bind(this.previewCallback, this));
                    break;
                case Common.Utils.importTextType.Paste:
                case Common.Utils.importTextType.Columns:
                    this.api.asc_TextImport(new Asc.asc_CCSVAdvancedOptions(encoding, delimiter, delimiterChar), _.bind(this.previewCallback, this), this.type == Common.Utils.importTextType.Paste);
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

            if (this.type == Common.Utils.importTextType.CSV || this.type == Common.Utils.importTextType.Paste || this.type == Common.Utils.importTextType.Columns) {
                var maxlength = 0;
                for (var i=0; i<data.length; i++) {
                    if (data[i].length>maxlength)
                        maxlength = data[i].length;
                }
                var tpl = '<table>';
                for (var i=0; i<data.length; i++) {
                    tpl += '<tr style="vertical-align: top;">';
                    for (var j=0; j<data[i].length; j++) {
                        tpl += '<td>' + Common.Utils.String.htmlEncode(data[i][j]) + '</td>';
                    }
                    for (j=data[i].length; j<maxlength; j++) {
                        tpl += '<td></td>';
                    }
                    tpl += '</tr>';
                }
                tpl += '</table>';
            } else {
                var tpl = '<table>';
                for (var i=0; i<data.length; i++) {
                    tpl += '<tr style="vertical-align: top;"><td>' + Common.Utils.String.htmlEncode(data[i]) + '</td></tr>';
                }
                tpl += '</table>';
            }
            this.previewPanel.html(tpl);

            this.scrollerX = new Common.UI.Scroller({
                el: this.previewPanel,
                suppressScrollY: true,
                alwaysVisibleX: true,
                minScrollbarLength  : 20
            });
        },

        onCmbDelimiterSelect: function(combo, record){
            this.inputDelimiter.setVisible(record.value == -1);
            if (this.preview)
                this.updatePreview();
        },

        onCmbEncodingSelect: function(combo, record){
            this.updatePreview();
        },

        okButtonText       : "OK",
        cancelButtonText   : "Cancel",
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
        txtProtected: 'Once you enter the password and open the file, the current password to the file will be reset.'

    }, Common.Views.OpenDialog || {}));
});