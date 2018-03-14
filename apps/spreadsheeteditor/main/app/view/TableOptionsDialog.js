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
 *  TableOptionsDialog.js
 *
 *  Created by Alexander Yuzhin on 4/9/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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

            this.options.tpl = _.template(this.template)(this.options);
            this.checkRangeType = Asc.c_oAscSelectionDialogType.FormatTable;
            this.selectionType = Asc.c_oAscSelectionType.RangeCells;

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
                    me.checkRangeType = Asc.c_oAscSelectionDialogType.FormatTableChangeRange;
                    me.inputRange.setValue(settings.range);
                    me.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.FormatTable, settings.range);
                } else {
                    var options = me.api.asc_getAddFormatTableOptions();
                    me.inputRange.setValue(options.asc_getRange());
                    me.cbTitle.setValue(options.asc_getIsTitle());
                    me.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.FormatTable, options.asc_getRange());
                }
                if (settings.title)
                    me.setTitle(settings.title);
                if (settings.selectionType)
                    me.selectionType = settings.selectionType;

                me.api.asc_unregisterCallback('asc_onSelectionRangeChanged', _.bind(me.onApiRangeChanged, me));
                me.api.asc_registerCallback('asc_onSelectionRangeChanged', _.bind(me.onApiRangeChanged, me));
                Common.NotificationCenter.trigger('cells:range', Asc.c_oAscSelectionDialogType.FormatTable);
            }

            me.inputRange.validation = function(value) {
                var isvalid = me.api.asc_checkDataRange(me.checkRangeType, value, false);
                return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.txtInvalidRange : true;
            };
        },

        getSettings: function () {
            if (this.checkRangeType == Asc.c_oAscSelectionDialogType.FormatTable) {
                var options = this.api.asc_getAddFormatTableOptions(this.inputRange.getValue());
                options.asc_setIsTitle(this.cbTitle.checked);
                return { selectionType: this.selectionType,  range: options};
            } else
                return { selectionType: this.selectionType,  range: this.inputRange.getValue()};
        },

        onApiRangeChanged: function(info) {
            this.inputRange.setValue(info.asc_getName());
            if (this.inputRange.cmpEl.hasClass('error'))
                this.inputRange.cmpEl.removeClass('error');
            this.selectionType = info.asc_getType();
        },

        isRangeValid: function() {
            var isvalid = this.api.asc_checkDataRange(this.checkRangeType, this.inputRange.getValue(), true);
            if (isvalid == Asc.c_oAscError.ID.No)
                return true;
            else {
                if (isvalid == Asc.c_oAscError.ID.AutoFilterDataRangeError) {
                    Common.UI.warning({msg: this.errorAutoFilterDataRange});
                } else if (isvalid == Asc.c_oAscError.ID.FTChangeTableRangeError) {
                    Common.UI.warning({msg: this.errorFTChangeTableRangeError});
                } else if (isvalid == Asc.c_oAscError.ID.FTRangeIncludedOtherTables) {
                    Common.UI.warning({msg: this.errorFTRangeIncludedOtherTables});
                }
            }
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onClose: function(event) {
            if (this.api)
                this.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.None);
            Common.NotificationCenter.trigger('cells:range', Asc.c_oAscSelectionDialogType.None);
            Common.NotificationCenter.trigger('edit:complete', this);

            SSE.getController('RightMenu').SetDisabled(false);
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

        show: function () {
            Common.UI.Window.prototype.show.call(this);
            SSE.getController('RightMenu').SetDisabled(true);
        },

        txtTitle    : 'Title',
        txtFormat   : 'Create table',
        textCancel  : 'Cancel',
        txtEmpty    : 'This field is required',
        txtInvalidRange: 'ERROR! Invalid cells range',
        errorAutoFilterDataRange: 'The operation could not be done for the selected range of cells.<br>Select a uniform data range inside or outside the table and try again.',
        errorFTChangeTableRangeError: 'Operation could not be completed for the selected cell range.<br>Select a range so that the first table row was on the same row<br>and the resulting table overlapped the current one.',
        errorFTRangeIncludedOtherTables: 'Operation could not be completed for the selected cell range.<br>Select a range which does not include other tables.'
    }, SSE.Views.TableOptionsDialog || {}))
});