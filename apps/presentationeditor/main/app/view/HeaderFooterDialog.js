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
 *  HeaderFooterDialog.js
 *
 *  Created by Julia Radzhabova on 09.07.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define(['text!presentationeditor/main/app/template/HeaderFooterDialog.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/RadioBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (template) { 'use strict';

    PE.Views.HeaderFooterDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 360,
            height: 340
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: _.template(
                    [
                        '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                            '<div class="content-panel" style="padding: 10px 5px;"><div class="inner-content">',
                                '<div class="settings-panel active">',
                                template,
                                '</div></div>',
                            '</div>',
                            '<div class="separator"/>',
                            '<div class="menu-panel" style="width: 130px; padding-top: 17px;">',
                                '<label  style="display:block; margin-left: 15px;" class="input-label">' + me.textPreview + '</label>',
                                '<div style="width: 100px; height: 80px; padding: 5px; margin-left: 15px; border: 1px solid #AFAFAF; border-radius: 2px; background: #ffffff;">',
                                    '<div id="hf-dlg-canvas-preview" style="width: 100%;height: 100%;"></div>',
                                '</div>',
                            '</div>',
                        '</div>',
                        '<div class="separator horizontal"/>',
                        '<div class="footer center">',
                            '<button class="btn normal dlg-btn primary" result="all" style="margin-right: 10px;">' + me.applyAllText + '</button>',
                            '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + me.applyText + '</button>',
                            '<button class="btn normal dlg-btn" result="cancel">' + me.cancelButtonText + '</button>',
                        '</div>'
                    ].join('')
                )({
                    scope: this
                })
            }, options);

            this.lang       = options.lang;
            this.handler    = options.handler;
            this.hfProps    = options.props;
            this.api        = options.api;
            this.dateControls = [];

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.chDateTime = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-datetime'),
                labelText: this.textDateTime
            });
            this.chDateTime.on('change', _.bind(this.setType, this, 'date'));

            this.chSlide = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-slide'),
                labelText: this.textSlideNum
            });
            this.chSlide.on('change', _.bind(this.setType, this, 'slide'));

            this.chFooter = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-text'),
                labelText: this.textFooter
            });
            this.chFooter.on('change', _.bind(this.setType, this, 'footer'));

            this.inputFooter = new Common.UI.InputField({
                el          : $('#hf-dlg-text'),
                validateOnBlur: false,
                style       : 'width: 100%;'
            });

            var data = [{ value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
                { value: 0x040B }, { value: 0x040C }, { value: 0x0410 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
                { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }];
            data.forEach(function(item) {
                var langinfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
                item.displayValue = langinfo[1];
                item.langName = langinfo[0];
            });

            this.cmbLang = new Common.UI.ComboBox({
                el          : $('#hf-dlg-combo-lang'),
                menuStyle   : 'min-width: 100%; max-height: 185px;',
                cls         : 'input-group-nr',
                editable    : false,
                data        : data
            });
            this.cmbLang.setValue(0x0409);
            this.cmbLang.on('selected', _.bind(function(combo, record) {
                this.props.get_DateTime().put_Lang(record.value);
                this.updateFormats(record.value);
                this.onSelectFormat();
            }, this));
            this.dateControls.push(this.cmbLang);

            this.cmbFormat = new Common.UI.ComboBox({
                el          : $('#hf-dlg-combo-format'),
                menuStyle   : 'min-width: 100%; max-height: 185px;',
                cls         : 'input-group-nr',
                editable    : false,
                data        : []
            });
            this.cmbFormat.on('selected', _.bind(function(combo, record) {
                this.onSelectFormat(record.value);
            }, this));
            this.dateControls.push(this.cmbFormat);

            this.chUpdate = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-update'),
                labelText: this.textUpdate,
                value: 'checked'
            });
            this.chUpdate.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this.onSelectFormat();
            }, this));
            this.dateControls.push(this.chUpdate);

            this.chNotTitle = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-not-title'),
                labelText: this.textNotTitle
            });
            this.chNotTitle.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this.props.put_ShowOnTitleSlide(newValue!='checked');
            }, this));

            this.afterRender();
        },

        afterRender: function() {
            var me = this,
                value =  Common.Utils.InternalSettings.get("pe-settings-datetime-default"),
                arr = (value) ? value.split(';') : [];
            this.defaultFormats = [];
            arr.forEach(function(item){
                var pair = item.split(' ');
                me.defaultFormats[parseInt(pair[0])] = pair[1];
            });

            this._setDefaults(this.hfProps);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        setType: function(type, field, newValue) {
            newValue = (newValue=='checked');
            if (type == 'date') {
                _.each(this.dateControls, function(item) {
                    item.setDisabled(!newValue);
                });
                this.props.put_ShowDateTime(newValue);
                if (newValue) {
                    !this.props.get_DateTime() && this.props.put_DateTime(new AscCommonSlide.CAscDateTime());
                    this.props.get_DateTime().put_Lang(this.cmbLang.getValue());
                    this.onSelectFormat();
                }
            } else if (type == 'slide') {
                this.props.put_ShowSlideNum(newValue);
            } else if (type == 'footer') {
                this.inputFooter.setDisabled(!newValue);
                this.props.put_ShowFooter(newValue);
            }
            this.props.updateView();
        },

        updateFormats: function(lang, format) {
            var props = new AscCommonSlide.CAscDateTime();
            props.put_Lang(lang);
            var data = props.get_DateTimeExamples(),
                arr = [];
            for (var name in data) {
                if (data[name])  {
                    arr.push({
                        value: name,
                        displayValue: data[name]
                    });
                }
            }
            this.cmbFormat.setData(arr);
            format = format || this.defaultFormats[lang];
            this.cmbFormat.setValue(format ? format : arr[0].value);
        },

        onSelectFormat: function(format) {
            format = format || this.cmbFormat.getValue();
            if (this.chUpdate.getValue()=='checked') {
                this.props.get_DateTime().put_DateTime(format);
            } else {
                this.props.get_DateTime().put_DateTime(null);
                this.props.get_DateTime().put_CustomDateTime(format);
            }
        },

        _setDefaults: function (props) {
            if (props) {
                var slideprops = props.get_Slide() || new AscCommonSlide.CAscHFProps();

                var val = slideprops.get_ShowDateTime();
                this.chDateTime.setValue(val, true);
                _.each(this.dateControls, function(item) {
                    item.setDisabled(!val);
                });

                var lang = this.lang,
                    format;
                if (val) {
                    var datetime = slideprops.get_DateTime();
                    lang = datetime.get_Lang() || this.lang;
                    format = datetime.get_DateTime();
                    this.chUpdate.setValue(!!format, true);
                    !format && (format = datetime.get_CustomDateTime());
                }
                var item = this.cmbLang.store.findWhere({value: lang});
                item = item ? item.get('value') : 0x0409;
                this.cmbLang.setValue(item);
                this.updateFormats(this.cmbLang.getValue(), format);

                val = slideprops.get_ShowSlideNum();
                this.chSlide.setValue(val, true);

                val = slideprops.get_ShowFooter();
                this.chFooter.setValue(val, true);
                this.inputFooter.setDisabled(!val);
                val && this.inputFooter.setValue(slideprops.get_Footer() || '');

                val = slideprops.get_ShowOnTitleSlide();
                this.chNotTitle.setValue(!val, true);

                this.props = slideprops;
            } else
                this.props = new AscCommonSlide.CAscHFProps();

            this.props.put_DivId('hf-dlg-canvas-preview');
            this.props.put_Api(this.api);
            this.props.updateView();
        },

        getSettings: function () {
            if (this.chFooter.getValue()=='checked') {
                this.props.put_Footer(this.inputFooter.getValue());
            }
            this.hfProps.put_Slide(this.props);
            return this.hfProps;
        },

        onDlgBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            this.handler && this.handler.call(this, state, this.getSettings());
            this.close();
        },

        textTitle: 'Header/Footer Settings',
        cancelButtonText: 'Cancel',
        applyAllText: 'Apply to all',
        applyText: 'Apply',
        textLang: 'Language',
        textFormat: 'Formats',
        textUpdate: 'Update automatically',
        textDateTime: 'Date and time',
        textSlideNum: 'Slide number',
        textFooter: 'Text in footer',
        textNotTitle: 'Don\'t show on title slide',
        textPreview: 'Preview'

    }, PE.Views.HeaderFooterDialog || {}))
});