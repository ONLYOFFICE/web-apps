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
 *  DateTimeDialog.js
 *
 *  Created by Julia Radzhabova on 26.06.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ListView'
], function () {
    'use strict';

    DE.Views.DateTimeDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 272px;">',
                    '<div class="input-row">',
                        '<label style="font-weight: bold;">' + this.textLang + '</label>',
                    '</div>',
                    '<div id="datetime-dlg-lang" class="input-row" style="margin-bottom: 8px;"></div>',
                    '<div class="input-row">',
                        '<label style="font-weight: bold;">' + this.textFormat + '</label>',
                    '</div>',
                    '<div id="datetime-dlg-format" class="" style="margin-bottom: 10px;width: 100%; height: 162px; overflow: hidden;"></div>',
                    '<div class="input-row">',
                        '<div id="datetime-dlg-update" style="margin-top: 3px;"></div>',
                        '<button type="button" class="btn btn-text-default auto" id="datetime-dlg-default" style="float: right;">' + this.textDefault + '</button>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this.lang = this.options.lang;
            this.handler =   this.options.handler;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            var data = [{ value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0C07 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
                { value: 0x040B }, { value: 0x040C }, { value: 0x0410 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x040E }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
                { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }];
            data.forEach(function(item) {
                var langinfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
                item.displayValue = langinfo[1];
                item.langName = langinfo[0];
            });

            this.cmbLang = new Common.UI.ComboBox({
                el          : $('#datetime-dlg-lang'),
                menuStyle   : 'min-width: 100%; max-height: 185px;',
                cls         : 'input-group-nr',
                editable    : false,
                takeFocusOnClose: true,
                data        : data,
                search: true,
                scrollAlwaysVisible: true
            });
            this.cmbLang.setValue(0x0409);
            this.cmbLang.on('selected', _.bind(function(combo, record) {
                this.updateFormats(record.value);
            }, this));

            this.chUpdate = new Common.UI.CheckBox({
                el: $('#datetime-dlg-update'),
                labelText: this.textUpdate
            });
            this.chUpdate.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this.onSelectFormat(this.listFormats, null, this.listFormats.getSelectedRec());
            }, this));

            this.listFormats = new Common.UI.ListView({
                el: $('#datetime-dlg-format'),
                store: new Common.UI.DataViewStore(),
                tabindex: 1,
                scrollAlwaysVisible: true,
                cls: 'dbl-clickable'
            });

            this.listFormats.on('item:select', _.bind(this.onSelectFormat, this));
            this.listFormats.on('item:dblclick', _.bind(this.onDblClickFormat, this));
            this.listFormats.on('entervalue', _.bind(this.onPrimary, this));

            this.btnDefault = new Common.UI.Button({
                el: $('#datetime-dlg-default')
            });
            this.btnDefault.on('click', _.bind(function(btn, e) {
                var rec = this.listFormats.getSelectedRec();
                Common.UI.warning({
                    msg: Common.Utils.String.format(this.confirmDefault, Common.util.LanguageInfo.getLocalLanguageName(this.cmbLang.getValue())[1], rec ? rec.get('value') : ''),
                    buttons: ['yes', 'no'],
                    primary: 'yes',
                    callback: _.bind(function(btn) {
                        if (btn == 'yes') {
                            this.defaultFormats[this.cmbLang.getValue()] = rec ? rec.get('format') : '';
                            // this.api.asc_setDefaultDateTimeFormat(this.defaultFormats);
                            var arr = [];
                            for (var name in this.defaultFormats) {
                                if (name) {
                                    arr.push({lang: name, format: this.defaultFormats[name]});
                                }
                            }
                            var value = JSON.stringify(arr);
                            Common.localStorage.setItem("de-settings-datetime-default", value);
                            Common.Utils.InternalSettings.set("de-settings-datetime-default", value);
                        }
                        this.listFormats.focus();
                    }, this)
                });
            }, this));

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.afterRender();
        },

        afterRender: function() {
            var me = this,
                value =  Common.Utils.InternalSettings.get("de-settings-datetime-default"),
                arr = value ? JSON.parse(value) : [];
            this.defaultFormats = [];
            arr.forEach(function(item){
                if (item.lang)
                    me.defaultFormats[parseInt(item.lang)] = item.format;
            });

            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [this.cmbLang, this.listFormats, this.chUpdate, this.btnDefault];
        },

        getDefaultFocusableComponent: function () {
            return this.cmbLang;
        },

        _setDefaults: function () {
            this.props = new Asc.CAscDateTime();
            if (this.lang) {
                var item = this.cmbLang.store.findWhere({value: this.lang});
                item = item ? item.get('value') : 0x0409;
                this.cmbLang.setValue(item)
            }
            this.updateFormats(this.cmbLang.getValue());
        },

        getSettings: function () {
            return this.props;
        },

        updateFormats: function(lang) {
            this.props.put_Lang(lang);
            var formats = this.props.get_FormatsExamples(),
                arr = [];
            var store = this.listFormats.store;
            for (var i = 0, len = formats.length; i < len; i++)
            {
                var rec = new Common.UI.DataViewModel();
                rec.set({
                    format: formats[i],
                    value: this.props.get_String(formats[i], undefined, lang)
                });
                arr.push(rec);
            }
            store.reset(arr);
            var format = this.defaultFormats[lang];
            format ? this.listFormats.selectRecord(store.findWhere({format: format})) : this.listFormats.selectByIndex(0);
            var rec = this.listFormats.getSelectedRec();
            this.listFormats.scrollToRecord(rec);
            this.onSelectFormat(this.listFormats, null, rec);
        },

        onSelectFormat: function(lisvView, itemView, record) {
            if (!record) return;
            this.props.put_Format(record.get('format'));
            this.props.put_Update(this.chUpdate.getValue()=='checked');
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onDblClickFormat: function () {
            this._handleInput('ok');
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        //
        txtTitle: 'Date & Time',
        textLang: 'Language',
        textFormat: 'Formats',
        textUpdate: 'Update automatically',
        textDefault: 'Set as default',
        confirmDefault: 'Set default format for {0}: "{1}"'

    }, DE.Views.DateTimeDialog || {}));
});