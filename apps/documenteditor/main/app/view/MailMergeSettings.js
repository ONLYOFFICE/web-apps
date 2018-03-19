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
 * Date: 20.02.15
 */

define([
    'text!documenteditor/main/app/template/MailMerge.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/Switcher',
    'documenteditor/main/app/view/MailMergeRecepients',
    'documenteditor/main/app/view/MailMergeSaveDlg',
    'documenteditor/main/app/view/MailMergeEmailDlg'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.enumLockMM = {
        lostConnect:    'disconnect',
        preview:        'preview',
        coAuth:         'co-auth',
        noFields:       'no-fields',
        noRecipients:   'no-recipients',
        radioAllCurr:   'radio-all-curr'
    };

    DE.Views.MailMergeSettings = Backbone.View.extend(_.extend({
        el: '#id-mail-merge-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'MailMergeSettings'
        },

        initialize: function () {
            var me = this,
                _set = DE.enumLockMM;

            this._initSettings = true;

            this._state = {
                recipientsCount: 0,
                fieldsList: []
            };
            this._locked = false;
            this.emptyDBControls = [];

            this._noApply = false;
            this._originalProps = null;
            this.defFileName = '';
            this.emailAddresses = undefined;
            this.mergeMailData = undefined;

            this.render();

            this.btnInsField = new Common.UI.Button({
                cls: 'btn-text-menu-default',
                caption: this.textInsertField,
                style: 'width: 100%;',
                lock: [_set.noFields, _set.preview, _set.coAuth, _set.lostConnect],
                menu        : new Common.UI.Menu({
                    style: 'min-width: 190px;max-width: 400px;',
                    maxHeight: 200,
                    items: []
                }).on('render:after', function(mnu) {
                        this.scroller = new Common.UI.Scroller({
                        el: this.$el.find('.dropdown-menu'),
                        useKeyboard: this.enableKeyEvents && !this.handleSelect,
                        suppressScrollX: true,
                        minScrollbarLength  : 40
                    });
                })
            });
            this.btnInsField.render( $('#mmerge-btn-ins-field',me.$el)) ;

            this.txtFieldNum = new Common.UI.InputField({
                el          : $('#mmerge-field-num', me.$el),
                allowBlank  : true,
                validateOnChange: false,
                style       : 'width: 80px; vertical-align: middle;',
                maskExp     : /[0-9]/,
                value       : 1,
                validation  : function(value) {
                    if (/(^[0-9]+$)/.test(value)) {
                        value = parseInt(value);
                        if (value===undefined || value===null || value<1)
                            me.txtFieldNum.setValue(1);
                        else if (value > me._state.recipientsCount)
                            me.txtFieldNum.setValue(me._state.recipientsCount);
                    } else
                        me.txtFieldNum.setValue(1);

                    return true;
                },
                lock: [_set.noRecipients, _set.lostConnect]
            }).on('changed:after', function(input, newValue, oldValue, e) {
                var val = parseInt(me.txtFieldNum.getValue());
                if (val !== parseInt(oldValue)) {
                    me.api.asc_PreviewMailMergeResult(val-1);
                    me.fireEvent('editcomplete', me);
                }
            });
            this.emptyDBControls.push(this.txtFieldNum);
        },

        render: function () {
            this.$el.html(this.template({
                scope: this
            }));
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onPreviewMailMergeResult',    _.bind(this.onPreviewMailMergeResult, this));
                this.api.asc_registerCallback('asc_onEndPreviewMailMergeResult', _.bind(this.onEndPreviewMailMergeResult, this));
                this.api.asc_registerCallback('asc_onStartMailMerge',            _.bind(this.onStartMailMerge, this));
                this.api.asc_registerCallback('asc_onSaveMailMerge',             _.bind(this.onSaveMailMerge, this));
                this.api.asc_registerCallback('asc_onEndAction',                 _.bind(this.onLongActionEnd, this));
                Common.Gateway.on('setemailaddresses',                           _.bind(this.onSetEmailAddresses, this));
                Common.Gateway.on('processmailmerge',                            _.bind(this.onProcessMailMerge, this));
            }
            return this;
        },

        createDelayedControls: function() {
            var me = this,
                _set = DE.enumLockMM;
            
            this.btnEditData = new Common.UI.Button({
                el: me.$el.find('#mmerge-button-edit-data'),
                lock: [_set.preview, _set.lostConnect]
            });
            this.btnEditData.on('click', _.bind(this.onEditData, this));

            this.lblAddRecipients = $('#mmerge-lbl-add-recipients');

            this.chHighlight = new Common.UI.Switcher({
                el: me.$el.find('#mmerge-switcher-highlight'),
                lock: [_set.noFields, _set.lostConnect]
            });
            this.chHighlight.on('change', _.bind(this.onCheckHighlightChange, this));

            this.chPreview = new Common.UI.Switcher({
                el: me.$el.find('#mmerge-switcher-preview'),
                lock: [_set.noRecipients, _set.lostConnect]
            });
            this.chPreview.on('change', _.bind(this.onCheckPreviewChange, this));
            this.emptyDBControls.push(this.chPreview);

            this.btnFirst = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-first',
                disabled: true,
                value: 0,
                hint: this.txtFirst,
                lock: [_set.noRecipients, _set.lostConnect]
            });
            this.btnFirst.render( $('#mmerge-button-first', me.$el));
            this.btnFirst.on('click', _.bind(this.onBtnPreviewFieldClick, this));
            this.emptyDBControls.push(this.btnFirst);

            this.btnPrev = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-prev',
                disabled: true,
                value: 1,
                hint: this.txtPrev,
                lock: [_set.noRecipients, _set.lostConnect]
            });
            this.btnPrev.render( $('#mmerge-button-prev', me.$el));
            this.btnPrev.on('click', _.bind(this.onBtnPreviewFieldClick, this));
            this.emptyDBControls.push(this.btnPrev);

            this.btnNext = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-next',
                value: 2,
                hint: this.txtNext,
                lock: [_set.noRecipients, _set.lostConnect]
            });
            this.btnNext.render( $('#mmerge-button-next', me.$el));
            this.btnNext.on('click', _.bind(this.onBtnPreviewFieldClick, this));
            this.emptyDBControls.push(this.btnNext);

            this.btnLast = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-last',
                value: 3,
                hint: this.txtLast,
                lock: [_set.noRecipients, _set.lostConnect]
            });
            this.btnLast.render( $('#mmerge-button-last', me.$el));
            this.btnLast.on('click', _.bind(this.onBtnPreviewFieldClick, this));
            this.emptyDBControls.push(this.btnLast);

            this._arrMergeSrc = [
                {displayValue: this.textPdf,    value: Asc.c_oAscFileType.PDF},
                {displayValue: this.textDocx,   value: Asc.c_oAscFileType.DOCX},
                {displayValue: this.textEmail,  value: Asc.c_oAscFileType.HTML}
            ];
            this.cmbMergeTo = new Common.UI.ComboBox({
                el: $('#mmerge-combo-merge-to', me.$el),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 190px;',
                editable: false,
                data: this._arrMergeSrc,
                lock: [_set.noRecipients, _set.lostConnect]
            });
            this.cmbMergeTo.setValue(this._arrMergeSrc[0].value);
            this.cmbMergeTo.on('selected', _.bind(this.onCmbMergeToSelect, this));
            this.emptyDBControls.push(this.cmbMergeTo);

            this.radioAll = new Common.UI.RadioBox({
                el: $('#mmerge-radio-all', me.$el),
                labelText: this.textAll,
                name: 'asc-radio-merge',
                checked: true,
                lock: [_set.noRecipients, _set.lostConnect]
            }).on('change', _.bind(this.onRadioAllCurrent, this));
            this.emptyDBControls.push(this.radioAll);

            this.radioCurrent = new Common.UI.RadioBox({
                el: $('#mmerge-radio-current', me.$el),
                labelText: this.textCurrent,
                name: 'asc-radio-merge',
                lock: [_set.noRecipients, _set.lostConnect]
            }).on('change', _.bind(this.onRadioAllCurrent, this));
            this.emptyDBControls.push(this.radioCurrent);

            this.radioFromTo = new Common.UI.RadioBox({
                el: $('#mmerge-radio-from-to', me.$el),
                labelText: this.textFrom,
                name: 'asc-radio-merge',
                lock: [_set.noRecipients, _set.lostConnect]
            }).on('change', _.bind(this.onRadioFromToChange, this));
            this.emptyDBControls.push(this.radioFromTo);

            this.txtFieldFrom = new Common.UI.InputField({
                el          : $('#mmerge-field-from', me.$el),
                allowBlank  : true,
                validateOnChange: false,
                style       : 'width: 50px;',
                maskExp     : /[0-9]/,
                value       : 0,
                disabled    : true,
                lock: [_set.radioAllCurr, _set.noRecipients, _set.lostConnect],
                validation  : function(value) {
                    if (/(^[0-9]+$)/.test(value)) {
                        value = parseInt(value);
                        if (value===undefined || value===null || value<1)
                            me.txtFieldFrom.setValue(1);
                        else if (value > me._state.recipientsCount)
                            me.txtFieldFrom.setValue(me._state.recipientsCount);
                    } else
                        me.txtFieldFrom.setValue(1);
                    value = parseInt(me.txtFieldFrom.getValue());
                    var tomax = Math.min(me._state.recipientsCount, value+99);
                    if (parseInt(me.txtFieldTo.getValue()) > tomax)
                        me.txtFieldTo.setValue(tomax);

                    if (me._checkFromToValues) {
                        if (value>parseInt(me.txtFieldTo.getValue()))
                            return me.txtFromToError;
                        else {
                            me._checkFromToValues = false;
                            me.txtFieldTo.checkValidate();
                        }
                    }
                    return true;
                }
            });
            this.emptyDBControls.push(this.txtFieldFrom);

            this.txtFieldTo = new Common.UI.InputField({
                el          : $('#mmerge-field-to', me.$el),
                allowBlank  : true,
                validateOnChange: false,
                style       : 'width: 50px;',
                maskExp     : /[0-9]/,
                value       : 0,
                disabled    : true,
                lock: [_set.radioAllCurr, _set.noRecipients, _set.lostConnect],
                validation  : function(value) {
                    if (/(^[0-9]+$)/.test(value)) {
                        value = parseInt(value);
                        if (value===undefined || value===null || value<1)
                            me.txtFieldTo.setValue(1);
                        else {
                            var tomax = Math.min(me._state.recipientsCount, parseInt(me.txtFieldFrom.getValue())+99);
                            if (value > tomax)
                                me.txtFieldTo.setValue(tomax);
                        }
                    } else
                        me.txtFieldTo.setValue(1);

                    if (me._checkFromToValues) {
                        if (parseInt(me.txtFieldFrom.getValue())>parseInt(me.txtFieldTo.getValue()))
                            return me.txtFromToError;
                        else {
                            me._checkFromToValues = false;
                            me.txtFieldFrom.checkValidate();
                        }
                    }
                    return true;
                }
            });
            this.txtFieldTo.on('changed:after', function() {
                me._isToChanged = true;
            });
            this.emptyDBControls.push(this.txtFieldTo);
            this.onRadioAllCurrent(this.radioAll, true);

            this.btnDownload = new Common.UI.Button({
                el: $('#mmerge-button-download', me.$el),
                lock: [_set.noRecipients, _set.lostConnect]
            }).on('click', _.bind(this.onDownloadClick, this, true));
            this.emptyDBControls.push(this.btnDownload);

            this.btnPortal = new Common.UI.Button({
                el: $('#mmerge-button-portal', me.$el),
                lock: [_set.noRecipients, _set.lostConnect]
            }).on('click', _.bind(this.onDownloadClick, this, false));

            this.btnMerge = new Common.UI.Button({
                el: $('#mmerge-button-merge', me.$el),
                lock: [_set.noRecipients, _set.lostConnect]
            }).on('click', _.bind(this.onMergeClick, this, false));
            this.emptyDBControls.push(this.btnMerge);

            this.linkReadMore = $('#mmerge-readmore-link', this.$el);
            this.$el.on('click', '#mmerge-readmore-link', _.bind(this.openHelp, this));

            if (this.mode) {
                if (!this.mode.mergeFolderUrl)
                    this.btnPortal.setVisible(false);
                if (!this.mode.canSendEmailAddresses) {
                    this._arrMergeSrc.pop();
                    this.cmbMergeTo.setData(this._arrMergeSrc);
                    this.cmbMergeTo.setValue(this._arrMergeSrc[0].value);
                }
            }

            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedControls();

            this.disableInsertControls(this._locked);

            if (props) {
                var me = this;
                this._state.recipientsCount = props.recipientsCount;
                this._state.fieldsList = props.fieldsList ? props.fieldsList : [];
//                this._state.fieldsList = ['name', 'address'];
//                this._state.recipientsCount = 5;
                
                if (this.btnInsField.menu.items.length<1) {
                    _.each(this._state.fieldsList, function(field, index) {
                        var mnu = new Common.UI.MenuItem({
                            caption: '«' + field + '»',
                            field: field
                        }).on('click', function(item, e) {
                            if (me.api) {
                                me.api.asc_AddMailMergeField(item.options.field);
                                me.fireEvent('editcomplete', me);
                            }
                        });
                        me.btnInsField.menu.addItem(mnu);
                    });
                }

                var numfrom = parseInt(this.txtFieldFrom.getValue());
                numfrom = isNaN(numfrom) ? 0 : numfrom-1;
                if (numfrom<0 || numfrom>this._state.recipientsCount-1) numfrom = 0;

                var numto = (this._isToChanged) ? parseInt(this.txtFieldTo.getValue()) : this._state.recipientsCount;
                numto = isNaN(numto) ? 0 : numto-1;
                if (numto<0 || numto>this._state.recipientsCount-1) numto = Math.max(this._state.recipientsCount-1, 0);

                if (numfrom>numto) {
                    numfrom = 0;
                    numto = this._state.recipientsCount-1;
                }
                this.txtFieldFrom.setValue(numfrom+1);
                this.txtFieldTo.setValue(Math.min(numto+1, numfrom+100));

                var num = parseInt(this.txtFieldNum.getValue());
                num = isNaN(num) ? 0 : num-1;
                if (num<0) num = 0;
                if (num>this._state.recipientsCount-1) num = this._state.recipientsCount-1;

                this.lockControls(DE.enumLockMM.noRecipients, this._state.recipientsCount<1, {
                    array: (this.mode.mergeFolderUrl) ? [this.btnPortal] : [],
                    merge: true
                });

                this.lockControls(DE.enumLockMM.noFields, this._state.fieldsList.length<1, {
                    array: [this.btnInsField, this.chHighlight]
                });

                this.lblAddRecipients[(this._state.fieldsList.length<1) ? 'show' : 'hide']();
                this.disableFieldBtns(num);
            }
        },

        onEditData: function() {
            var mergeEditor = DE.getController('Common.Controllers.ExternalMergeEditor').getView('Common.Views.ExternalMergeEditor');
            if (mergeEditor) {
                mergeEditor.show();

//                if (!mergeEditor.isEditMode()) {
                    var merge = this.api.asc_getMailMergeData();
                    if (merge) {
                        mergeEditor.setMergeData(merge);
                    }
//                }
            }
        },

        onCheckHighlightChange: function(field, newValue, eOpts) {
            if (this.api)   {
                this.api.asc_SetHighlightMailMergeFields(field.getValue());
            }
            this.fireEvent('editcomplete', this);
        },

        onCheckPreviewChange: function(field, newValue, eOpts) {
            var enable_preview = field.getValue();
            var value = parseInt(this.txtFieldNum.getValue());
            if (this.api)   {
                (enable_preview) ? this.api.asc_PreviewMailMergeResult(isNaN(value) ? 0 : value-1) :
                                   this.api.asc_EndPreviewMailMergeResult();
            }
            this.fireEvent('editcomplete', this);
        },

        onRadioFromToChange: function(field, newValue, eOpts) {
            if (newValue) {
                this.lockControls(DE.enumLockMM.radioAllCurr, false, {array: [this.txtFieldFrom, this.txtFieldTo]});
            }
        },

        onRadioAllCurrent: function(field, newValue, eOpts) {
            if (newValue) {
                this.lockControls(DE.enumLockMM.radioAllCurr, true, {array: [this.txtFieldFrom, this.txtFieldTo]});
            }
        },

        checkFromToValues: function() {
            this._checkFromToValues = true;
            var checkfrom = this.txtFieldFrom.checkValidate(),
                checkto = this.txtFieldTo.checkValidate();
                if (checkfrom !== true || checkto !== true)  {
                    this.txtFieldTo.cmpEl.find('input').focus();
                    return false;
                }
            this._checkFromToValues = false;
            return true;
        },

        onDownloadClick: function(type, btn, e) {
            if (this.api) {
                var from = 0, to = Math.min(Math.max(this._state.recipientsCount-1, 0), 99);
                if (this.radioCurrent.getValue()) {
                    from = to = parseInt(this.txtFieldNum.getValue())-1;
                } else if (this.radioFromTo.getValue()) {
                    if (!this.checkFromToValues())
                        return;

                    from = parseInt(this.txtFieldFrom.getValue())-1;
                    to = parseInt(this.txtFieldTo.getValue())-1;
                    to = Math.min(to, from + 99);
                    this.txtFieldTo.setValue(to+1);
                }
                if (!this.api.asc_DownloadAsMailMerge(this.cmbMergeTo.getValue(), from, to, type)) {
                    var config = {
                        closable: false,
                        title: this.notcriticalErrorTitle,
                        msg: this.errorMailMergeSaveFile,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: _.bind(function(btn){
                            this.fireEvent('editcomplete', this);
                        }, this)
                    };
                    Common.UI.alert(config);
                } else if (!type) {
                    var maincontroller = DE.getController('Main');
                    if (!maincontroller.loadMask)
                        maincontroller.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});
                    maincontroller.loadMask.setTitle(this.downloadMergeTitle);
                    maincontroller.loadMask.show();
                }
            }
        },

        onSaveMailMerge: function(url) {
            var loadMask = DE.getController('Main').loadMask;
            loadMask && loadMask.hide();

            if (this._mailMergeDlg) return;
            var me = this;
            if (this.cmbMergeTo.getValue() != Asc.c_oAscFileType.HTML) {
                me._mailMergeDlg = new DE.Views.MailMergeSaveDlg({
                                    mergeFolderUrl: me.mode.mergeFolderUrl,
                                    mergedFileUrl: url,
                                    defFileName: me.defFileName + ((this.cmbMergeTo.getValue() == Asc.c_oAscFileType.PDF) ? '.pdf' : '.docx')
                                });
                me._mailMergeDlg.on('mailmergefolder', function(obj, folder){ // save last folder
                }).on('mailmergeerror', function(obj, err){ // save last folder
                    var config = {
                        closable: false,
                        title: this.notcriticalErrorTitle,
                        msg: err,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: function(btn){
                            me.fireEvent('editcomplete', me);
                        }
                    };
                    Common.UI.alert(config);
                }).on('close', function(obj){
                    me._mailMergeDlg = undefined;
                });
                me._mailMergeDlg.show();
            }
        },

        onMergeClick: function(type, btn, e) {
            var from = 0, to = Math.min(Math.max(this._state.recipientsCount-1, 0), 99);
            if (this.radioFromTo.getValue()) {
                if (!this.checkFromToValues())
                    return;
                from = parseInt(this.txtFieldFrom.getValue())-1;
                to = parseInt(this.txtFieldTo.getValue())-1;
                to = Math.min(to, from + 99);
                this.txtFieldTo.setValue(to+1);
            }
            if (this.emailAddresses==undefined) {
                var maincontroller = DE.getController('Main');
                if (!maincontroller.loadMask)
                    maincontroller.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});
                maincontroller.loadMask.setTitle(this.requestMailsTitle);
                maincontroller.loadMask.show();
                Common.Gateway.requestEmailAddresses();
            } else {
                this.showMergeMailDlg();
            }
        },

        onSetEmailAddresses: function(opts) {
            var loadMask = DE.getController('Main').loadMask;
            loadMask && loadMask.hide();
            if (!opts || !opts.data) return;
            if (opts.data.error) {
                var config = {
                    width: 500,
                    closable: false,
                    title: this.notcriticalErrorTitle,
                    msg: opts.data.error,
                    iconCls: 'warn',
                    buttons: _.isEmpty(opts.data.createEmailAccountUrl) ? ['ok'] : ['custom', 'cancel'],
                    primary: _.isEmpty(opts.data.createEmailAccountUrl) ? ['ok'] : 'custom',
                    customButtonText: this.textGoToMail,
                    callback: _.bind(function(btn){
                        if (btn == 'custom') {
                            window.open(opts.data.createEmailAccountUrl, "_blank");
                        }
                        this.fireEvent('editcomplete', this);
                    }, this)
                };
                Common.UI.alert(config);
            } else {
                this.emailAddresses = opts.data.emailAddresses;
                this.showMergeMailDlg();
            }
        },

        showMergeMailDlg: function() {
            if (this._mailMergeDlg) return;

            var me = this;
            me._mailMergeDlg =  new DE.Views.MailMergeEmailDlg({
                props: {
                    fieldsList: this._state.fieldsList,
                    emailAddresses: this.emailAddresses
                },
                handler: function(result, value) {
                    if (result == 'ok') {
                        me.mergeMailData = value;
                        var maincontroller = DE.getController('Main');
                        if (!maincontroller.loadMask)
                            maincontroller.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});
                        maincontroller.loadMask.setTitle(me.downloadMergeTitle);
                        maincontroller.loadMask.show();
                        Common.Gateway.requestStartMailMerge();
                    }
                    me.fireEvent('editcomplete', me);
                }
            });
            me._mailMergeDlg.on('close', function(obj){
                me._mailMergeDlg = undefined;
            });
            me._mailMergeDlg.show();
        },

        onProcessMailMerge: function(data) {
            var loadMask = DE.getController('Main').loadMask;
            loadMask && loadMask.hide();
            if (data) {
                if (data.enabled) {
                    this.sendMergeDataByEmail();
                } else {
                    var config = {
                        closable: false,
                        title: this.notcriticalErrorTitle,
                        msg: _.isEmpty(data.message) ? this.warnProcessMailMerge : data.message,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: _.bind(function(btn){
                            this.fireEvent('editcomplete', this);
                        }, this)
                    };
                    Common.UI.alert(config);
                }
            }
        },

        sendMergeDataByEmail: function() {
            if (this.api) {
                var from = 0, to = Math.min(Math.max(this._state.recipientsCount-1, 0), 99);
                if (this.radioCurrent.getValue()) {
                    from = to = parseInt(this.txtFieldNum.getValue())-1;
                } else if (this.radioFromTo.getValue()) {
                    from = parseInt(this.txtFieldFrom.getValue())-1;
                    to = parseInt(this.txtFieldTo.getValue())-1;
                }
                var mmdata = new Asc.CMailMergeSendData();
                mmdata.put_RecordFrom(from);
                mmdata.put_RecordTo(to);
                mmdata.put_From(this.mergeMailData.from);
                mmdata.put_To(this.mergeMailData.to);
                mmdata.put_Subject(this.mergeMailData.subject);
                mmdata.put_MailFormat(this.mergeMailData.mailFormat);
                if (this.mergeMailData.mailFormat!==Asc.c_oAscFileType.HTML) {
                    mmdata.put_FileName(this.mergeMailData.fileName);
                    mmdata.put_Message(this.mergeMailData.message);
                }

                this.api.asc_sendMailMergeData(mmdata);
                this.fireEvent('editcomplete', this);
            }
        },

        onLongActionEnd: function(type, id) {
            if (id == Asc.c_oAscAsyncAction['SendMailMerge']) {
                Common.UI.info({
                    closable: false,
                    width: 500,
                    msg: this.textSendMsg,
                    iconCls: 'info',
                    buttons: ['ok'],
                    callback: _.bind(function(btn) {
                        this.fireEvent('editcomplete', this);
                    }, this)
                });
            }
        },

        onBtnPreviewFieldClick: function(btn, eOpts){
            var num = parseInt(this.txtFieldNum.getValue());
            num = isNaN(num) ? 0 : (num-1);
            switch (btn.options.value) {
                case 0:
                    num = 0;
                    break;
                case 1:
                    num--;
                    break;
                case 2:
                    num++;
                    break;
                case 3:
                    num = this._state.recipientsCount-1;
                    break;
            }
            if (num<0) num = 0;
            if (num>this._state.recipientsCount-1) num = this._state.recipientsCount-1;
            this.api.asc_PreviewMailMergeResult(num);
            this.fireEvent('editcomplete', this);
        },

        disableFieldBtns: function(num) {
            var disabled_cmn = (this._state.recipientsCount<1 || !this.chPreview.getValue());
            var disabled = (disabled_cmn || num<1);
            if (this.btnFirst.isDisabled() !== disabled) this.btnFirst.setDisabled(disabled);
            if (this.btnPrev.isDisabled() !== disabled) this.btnPrev.setDisabled(disabled);
            disabled = (disabled_cmn || num>this._state.recipientsCount-2);
            if (this.btnLast.isDisabled() !== disabled) this.btnLast.setDisabled(disabled);
            if (this.btnNext.isDisabled() !== disabled) this.btnNext.setDisabled(disabled);
            disabled = (disabled_cmn || num<0);
            if (this.txtFieldNum.isDisabled() !== disabled) this.txtFieldNum.setDisabled(disabled);
            if (num>=0)
                this.txtFieldNum.setValue(num+1);
        },

        onPreviewMailMergeResult: function(num) {
            if (!this.chPreview.getValue())
                this.chPreview.setValue(true);
            this.disableFieldBtns(num);
            this.disableEditing(true);
        },

        onEndPreviewMailMergeResult: function() {
            if (this.chPreview.getValue())
                this.chPreview.setValue(false);
            this.disableFieldBtns(-1);
            this.disableEditing(false);
        },

        onStartMailMerge: function() {
            this.btnInsField.menu.removeAll();
            this.txtFieldNum.setValue(1);
            this.ChangeSettings({
                recipientsCount: this.api.asc_GetReceptionsCount(),
                fieldsList: this.api.asc_GetMailMergeFieldsNameList()
            });
        },

        onCmbMergeToSelect: function(combo, record) {
            var mergeVisible = (record.value == Asc.c_oAscFileType.HTML);
            this.btnMerge.setVisible(mergeVisible);
            this.btnPortal.setVisible(!mergeVisible && this.mode.mergeFolderUrl);
            this.btnDownload.setVisible(!mergeVisible);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            this.lockControls(DE.enumLockMM.lostConnect, disable, {
                array: _.union([this.btnEditData, this.btnInsField, this.chHighlight], (this.mode.mergeFolderUrl) ? [this.btnPortal] : []),
                merge: true
            });
        },

        disableInsertControls: function(disable) {
            this.lockControls(DE.enumLockMM.coAuth, disable, {array: [this.btnInsField]});
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        disableEditing: function(disable) {
            DE.getController('Toolbar').DisableToolbar(disable, disable);
            DE.getController('RightMenu').SetDisabled(disable, true);
            DE.getController('LeftMenu').SetDisabled(disable);
            DE.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
            if (this.mode.canComments) {
                DE.getController('Common.Controllers.Comments').setMode(disable ? {canComments: false} : this.mode).onApiHideComment();
            }
            this.lockControls(DE.enumLockMM.preview, disable, {array: [this.btnInsField, this.btnEditData]});
        },

        setDocumentName: function(name) {
            this.defFileName = (name) ? name : this.txtUntitled;
            var idx = this.defFileName.lastIndexOf('.');
            if (idx>0)
                this.defFileName = this.defFileName.substring(0, idx);
        },

        openHelp: function(e) {
            DE.getController('LeftMenu').getView('LeftMenu').showMenu('file:help', 'UsageInstructions\/UseMailMerge.htm');
        },

        disablePreviewMode: function() {
            if (this.api && this.chPreview && this.chPreview.getValue())   {
                this.api.asc_EndPreviewMailMergeResult();
            }
        },

        lockControls: function(causes, lock, opts) {
            !opts && (opts = {});

            var controls = opts.array || this.emptyDBControls;
            opts.merge && (controls = _.union(this.emptyDBControls,controls));

            function doLock(cmp, cause) {
                if ( _.contains(cmp.options.lock, cause) ) {
                    var index = cmp.keepState.indexOf(cause);
                    if (lock) {
                        if (index < 0) {
                            cmp.keepState.push(cause);
                        }
                    } else {
                        if (!(index < 0)) {
                            cmp.keepState.splice(index, 1);
                        }
                    }
                }
            }

            _.each(controls, function(item) {
                if (_.isFunction(item.setDisabled)) {
                    !item.keepState && (item.keepState = []);
                    if (opts.clear && opts.clear.length > 0 && item.keepState.length > 0) {
                        item.keepState = _.difference(item.keepState, opts.clear);
                    }

                    _.isArray(causes) ? _.each(causes, function(c) {doLock(item, c)}) : doLock(item, causes);

                    if (!(item.keepState.length > 0)) {
                        item.isDisabled() && item.setDisabled(false);
                    } else {
                        !item.isDisabled() && item.setDisabled(true);
                    }
                }
            });
        },

        textDataSource:     'Data Source',
        textEditData:       'Edit recipients list',
        textInsertField:    'Insert Merge Field',
        textHighlight:      'Highlight merge fields',
        textPreview:        'Preview results',
        textPdf:            'PDF',
        textDocx:           'Docx',
        textEmail:          'E-mail',
        txtFirst:           'To first field',
        txtPrev:            'To previous field',
        txtNext:            'To next field',
        txtLast:            'To last field',
        textMergeTo:        'Merge to',
        textAll:            'All records',
        textCurrent:        'Current record',
        textFrom:           'From',
        textTo:             'To',
        textDownload:       'Download',
        textPortal:         'Save',
        errorMailMergeSaveFile: 'Merge failed.',
        downloadMergeTitle: 'Merging',
        requestMailsTitle:  'Requesting e-mails',
        textMerge:          'Merge',
        sendTitle:          'Send e-mail',
        textSendMsg:        'All mail messages are ready and will be sent out within some time.<br>The speed of mailing depends on your mail service.<br>' +
                            'You can continue working with document or close it. ' +
                            'After the operation is over the notification will be sent to your registration email address.',
        notcriticalErrorTitle: 'Warning',
        warnProcessMailMerge: 'Starting merge failed',
        txtUntitled: 'Untitled',
        textMaxRecepients: 'Max 100 recipients.',
        textReadMore: 'Read more',
        txtFromToError: '"From" value must be less than "To" value',
        textMergeFields: 'Merge Fields',
        textGoToMail: 'Go to Mail',
        textAddRecipients: 'Add some recipients to the list first'

    }, DE.Views.MailMergeSettings || {}));
});