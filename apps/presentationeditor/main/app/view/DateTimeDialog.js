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
 *  DateTimeDialog.js
 *
 *  Created on 26.06.2019
 *
 */

define([], function () {
    'use strict';

    PE.Views.DateTimeDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            id: 'window-date-time',
            buttons: ['ok', 'cancel']
        },

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<label class="font-weight-bold">' + this.textLang + '</label>',
                    '</div>',
                    '<div id="datetime-dlg-lang" class="input-row" style="margin-bottom: 8px;"></div>',
                    '<div class="input-row">',
                        '<label class="font-weight-bold">' + this.textFormat + '</label>',
                    '</div>',
                    '<div id="datetime-dlg-format" class="" style="margin-bottom: 10px;width: 100%; height: 162px; overflow: hidden;"></div>',
                    '<div class="input-row" style="margin-bottom: 8px;">',
                        '<div id="datetime-dlg-update" style="margin-top: 3px;margin-bottom: 10px;"></div>',
                        '<button type="button" class="btn btn-text-default auto float-right" id="datetime-dlg-default">' + this.textDefault + '</button>',
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

            var data = [{ value: 0x0401 }, { value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0406 }, { value: 0x0C07 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x3809 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
                { value: 0x040B }, { value: 0x040C }, { value: 0x100C }, { value: 0x0421 }, { value: 0x0410 }, { value: 0x0810 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x040E }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
                { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x281A }, { value: 0x241A }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }, { value: 0x0404 }];
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
                scrollAlwaysVisible: true,
                tabindex: 1,
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
                            this.api.asc_setDefaultDateTimeFormat(this.defaultFormats);
                            var arr = [];
                            for (var name in this.defaultFormats) {
                                if (name) {
                                    arr.push(name + ' ' + this.defaultFormats[name]);
                                }
                            }
                            var value = arr.join(';');
                            Common.localStorage.setItem("pe-settings-datetime-default", value);
                            Common.Utils.InternalSettings.set("pe-settings-datetime-default", value);
                        }
                        this.listFormats.focus();
                    }, this)
                });
            }, this));

            if (this.chUpdate.$el.outerWidth() + this.btnDefault.$el.outerWidth() > this.$window.find('.box').width()) {
                this.btnDefault.$el.removeClass('float-right');
                this.listFormats.$el.height(139);
            }

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
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

            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [this.cmbLang, this.listFormats, this.chUpdate, this.btnDefault].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.cmbLang;
        },

        _setDefaults: function () {
            this.props = new AscCommonSlide.CAscDateTime();
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
            var data = this.props.get_DateTimeExamples(),
                arr = [];
            var store = this.listFormats.store;
            for (var name in data) {
                if (data[name])  {
                    var rec = new Common.UI.DataViewModel();
                    rec.set({
                        format: name,
                        value: data[name]
                    });
                    arr.push(rec);
                }
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
            if (this.chUpdate.getValue()=='checked') {
                this.props.put_DateTime(record.get('format'));
            } else {
                this.props.put_DateTime(null);
                this.props.put_CustomDateTime(record.get('value'));
            }
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

    }, PE.Views.DateTimeDialog || {}));
});