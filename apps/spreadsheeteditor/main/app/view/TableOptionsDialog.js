/**
 *  TableOptionsDialog.js
 *
 *  Created by Alexander Yuzhin on 4/9/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window'
], function () { 'use strict';

    SSE.Views.TableOptionsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width   : 350,
            cls     : 'modal-dlg',
            modal   : false
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtFormat
            }, options);

            this.template = [
                '<div class="box">',
                    '<div id="id-dlg-tableoptions-range" class="input-row"  style="margin-bottom: 5px;"></div>',
                    '<div class="input-row" id="id-dlg-tableoptions-title" style="margin-top: 5px;"></div>',
                '</div>',
                '<div class="footer right">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template, this.options);
            this.checkRangeType = c_oAscSelectionDialogType.FormatTable;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild(),
                me = this;

            me.inputRange = new Common.UI.InputField({
                el          : $('#id-dlg-tableoptions-range'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : false,
                blankError  : this.txtEmpty,
                validateOnChange: true
            });

            me.cbTitle = new Common.UI.CheckBox({
                el          : $('#id-dlg-tableoptions-title'),
                labelText   : this.txtTitle
            });

            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));
            me.inputRange.cmpEl.find('input').on('keypress', _.bind(this.onKeyPress, this));

            this.on('close', _.bind(this.onClose, this));
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setSettings: function(settings) {
            var me = this;

            if (settings.api) {
                me.api = settings.api;

                if (settings.range) {
                    me.cbTitle.setVisible(false);
                    me.setHeight(130);
                    me.checkRangeType = c_oAscSelectionDialogType.FormatTableChangeRange;
                    me.inputRange.setValue(settings.range);
                    me.api.asc_setSelectionDialogMode(c_oAscSelectionDialogType.FormatTable, settings.range);
                } else {
                    var options = me.api.asc_getAddFormatTableOptions();
                    me.inputRange.setValue(options.asc_getRange());
                    me.cbTitle.setValue(options.asc_getIsTitle());
                    me.api.asc_setSelectionDialogMode(c_oAscSelectionDialogType.FormatTable, options.asc_getRange());
                }

                me.api.asc_unregisterCallback('asc_onSelectionRangeChanged', _.bind(me.onApiRangeChanged, me));
                me.api.asc_registerCallback('asc_onSelectionRangeChanged', _.bind(me.onApiRangeChanged, me));
                Common.NotificationCenter.trigger('cells:range', c_oAscSelectionDialogType.FormatTable);
            }

            me.inputRange.validation = function(value) {
                var isvalid = me.api.asc_checkDataRange(me.checkRangeType, value, false);
                return (isvalid==c_oAscError.ID.DataRangeError) ? me.txtInvalidRange : true;
            };
        },

        getSettings: function () {
            if (this.checkRangeType == c_oAscSelectionDialogType.FormatTable) {
                var options = this.api.asc_getAddFormatTableOptions(this.inputRange.getValue());
                options.asc_setIsTitle(this.cbTitle.checked);
                return options;
            } else
                return this.inputRange.getValue();
        },

        onApiRangeChanged: function(info) {
            this.inputRange.setValue(info);
            if (this.inputRange.cmpEl.hasClass('error'))
                this.inputRange.cmpEl.removeClass('error');
        },

        isRangeValid: function() {
            var isvalid = this.api.asc_checkDataRange(this.checkRangeType, this.inputRange.getValue(), true);
            if (isvalid == c_oAscError.ID.No)
                return true;
            else {
                if (isvalid == c_oAscError.ID.AutoFilterDataRangeError) {
                    Common.UI.warning({msg: this.errorAutoFilterDataRange});
                }
            }
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onClose: function(event) {
            if (this.api)
                this.api.asc_setSelectionDialogMode(c_oAscSelectionDialogType.None);

            Common.NotificationCenter.trigger('cells:range', c_oAscSelectionDialogType.None);
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (this.isRangeValid() !== true)
                        return;
                }
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

//        show: function () {
//            Common.UI.Window.prototype.show.call(this);
//
//            var me = this;
//            _.delay(function () {
//                me.inputRange.cmpEl.find('input').focus();
//            }, 500, me);
//        },

        txtTitle    : 'Title',
        txtFormat   : 'Format as table',
        textCancel  : 'Cancel',
        txtEmpty    : 'This field is required',
        txtInvalidRange: 'ERROR! Invalid cells range',
        errorAutoFilterDataRange: 'The operation could not be done for the selected range of cells.<br>Select a uniform data range inside or outside the table and try again.'
    }, SSE.Views.TableOptionsDialog || {}))
});