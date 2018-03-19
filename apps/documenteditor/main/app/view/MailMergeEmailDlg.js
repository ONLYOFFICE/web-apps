/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 * User: Julia.Radzhabova
 * Date: 15.04.15
 * Time: 16:47
 */

define([    'text!documenteditor/main/app/template/MailMergeEmailDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/InputField'
], function (contentTemplate) {
    'use strict';

    DE.Views.MailMergeEmailDlg = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'MailMergeEmail',
            contentWidth: 500,
            height: 460
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                    '<div class="content-panel" style="padding: 0;">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>',
                    '<div class="separator horizontal"/>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;  width: 86px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.cancelButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this._arrFrom = [
            ];
            this.cmbFrom = new Common.UI.ComboBox({
                el: $('#merge-email-dlg-from'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrFrom
            });

            this._arrTo = [
            ];
            this.cmbTo = new Common.UI.ComboBox({
                el: $('#merge-email-dlg-to'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrTo
            });

            this.inputSubject = new Common.UI.InputField({
                el          : $('#merge-email-dlg-subject'),
                allowBlank  : true,
                validateOnBlur: false,
                placeHolder: this.subjectPlaceholder,
                style       : 'width: 100%;'
            });

            this._arrFormat = [
                {displayValue: this.textHTML,  value: Asc.c_oAscFileType.HTML},
                {displayValue: this.textAttachDocx,value: Asc.c_oAscFileType.DOCX},
                {displayValue: this.textAttachPdf,value: Asc.c_oAscFileType.PDF}
            ];
            this.cmbFormat = new Common.UI.ComboBox({
                el: $('#merge-email-dlg-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrFormat
            });
            this.cmbFormat.setValue(Asc.c_oAscFileType.HTML);
            this.cmbFormat.on('selected', _.bind(this.onCmbFormatSelect, this));

            this.inputFileName = new Common.UI.InputField({
                el          : $('#merge-email-dlg-filename'),
                allowBlank  : true,
                validateOnBlur: false,
                disabled: true,
                placeHolder: this.filePlaceholder,
                style       : 'width: 100%;'
            });

            this.textareaMessage = this.$window.find('textarea');

            this.lblFileName = $('#merge-email-dlg-lbl-filename');

            this.lblMessage = $('#merge-email-dlg-lbl-message');

            this._eventfunc = function(msg) {
                me._onWindowMessage(msg);
            };
//            this._bindWindowEvents.call(this);
//            this.on('close', function(obj){
//                me._unbindWindowEvents();
//            });

            this.mergeProps = this.options.props;
            this.mergedFileUrl = this.options.mergedFileUrl || '';

            this.afterRender();
        },

        _bindWindowEvents: function() {
            if (window.addEventListener) {
                window.addEventListener("message", this._eventfunc, false)
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", this._eventfunc);
            }
        },

        _unbindWindowEvents: function() {
            if (window.removeEventListener) {
                window.removeEventListener("message", this._eventfunc)
            } else if (window.detachEvent) {
                window.detachEvent("onmessage", this._eventfunc);
            }
        },

        _onWindowMessage: function(msg) {
            // TODO: check message origin
            if (msg && window.JSON) {
                try {
                    this._onMessage.call(this, window.JSON.parse(msg.data));
                } catch(e) {}
            }
        },

        _onMessage: function(msg) {
            if (msg) {
//                if ( !_.isEmpty(msg.folder) ) {
//                    this.trigger('mailmergefolder', this, msg.folder); // save last folder url
//                }
            }
        },

        afterRender: function() {
            this._setDefaults(this.mergeProps);
        },

        getSettings: function() {
            var filename = this.inputFileName.getValue(),
                mailformat = this.cmbFormat.getValue();
            if (mailformat!==Asc.c_oAscFileType.HTML) {
                if (_.isEmpty(filename)) filename = 'attach';
                var idx = filename.lastIndexOf('.'),
                    ext = (idx>0) ? filename.substring(idx, filename.length).toLowerCase() : '';
                if (mailformat==Asc.c_oAscFileType.PDF && ext!=='.pdf')
                    filename += '.pdf';
                else if (mailformat==Asc.c_oAscFileType.DOCX && ext!=='.docx')
                    filename += '.docx';
            }

            return {
                from: this.cmbFrom.getValue(),
                to: this.cmbTo.getValue(),
                subject: this.inputSubject.getValue(),
                mailFormat: mailformat,
                fileName: filename,
                message: this.textareaMessage.val()
            };
        },

        _setDefaults: function(props) {
            if (props ){
                if (props.fieldsList) {
                    var arr = [];
                    _.each(props.fieldsList, function(field, index) {
                        arr.push({displayValue: '<' + field + '>',    value: field});
                    });
                    this.cmbTo.setData(arr);
                    if (arr.length>0)
                        this.cmbTo.setValue(arr[0].value);
                }

                if (props.emailAddresses) {
                    var arr = [];
                    _.each(props.emailAddresses, function(field, index) {
                        arr.push({displayValue: field,    value: field});
                    });
                    this.cmbFrom.setData(arr);
                    if (arr.length>0)
                        this.cmbFrom.setValue(arr[0].value);
                }
            }
        },

        onPrimary: function() {
            return true;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = event.currentTarget.attributes['result'].value;
            if (state == 'ok') {
//                _.delay(function() {
//                    Common.Gateway.sendMergedUrl(me.mergedFileUrl);
//                }, 10);
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }
            this.close();
        },

        onCmbFormatSelect: function(combo, record) {
            var attachDisable = (record.value == Asc.c_oAscFileType.HTML);
            this.inputFileName.setDisabled(attachDisable);
            this.lblFileName.toggleClass('disabled', attachDisable);
            (attachDisable) ? this.textareaMessage.attr('disabled', 'disabled') : this.textareaMessage.removeAttr('disabled');
            this.textareaMessage.toggleClass('disabled', attachDisable);
            this.lblMessage.toggleClass('disabled', attachDisable);
        },

        textTitle:          'Send to E-mail',
        textFrom:           'From',
        textTo:             'To',
        textSubject:        'Subject Line',
        textFormat:         'Mail format',
        textFileName:       'File name',
        textMessage:        'Message',
        textHTML:           'HTML',
        textAttachDocx:     'Attach as DOCX',
        textAttachPdf:      'Attach as PDF',
        subjectPlaceholder: 'Theme',
        filePlaceholder:    'PDF',
        cancelButtonText:   'Cancel',
        okButtonText:       'Send',
        textWarning:        'Warning!',
        textWarningMsg:     'Please note that mailing cannot be stopped once your click the \'Send\' button.'

    }, DE.Views.MailMergeEmailDlg || {}));
});
