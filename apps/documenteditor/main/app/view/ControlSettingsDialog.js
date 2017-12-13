/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  ControlSettingsDialog.js.js
 *
 *  Created by Julia Radzhabova on 12.12.2017
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    DE.Views.ControlSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            height: 275
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 5px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="1" style="width: 100%;">',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<label class="input-label">', me.textName, '</label>',
                                        '<div id="control-settings-txt-name"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<label class="input-label">', me.textTag, '</label>',
                                        '<div id="control-settings-txt-tag"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="header">', me.textLock, '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="control-settings-chb-lock-delete"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="control-settings-chb-lock-edit"></div>',
                                    '</td>',
                                '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + me.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + me.cancelButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtName = new Common.UI.InputField({
                el          : $('#control-settings-txt-name'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : ''
            });

            this.txtTag = new Common.UI.InputField({
                el          : $('#control-settings-txt-tag'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : ''
            });

            this.chLockDelete = new Common.UI.CheckBox({
                el: $('#control-settings-chb-lock-delete'),
                labelText: this.txtLockDelete
            });

            this.chLockEdit = new Common.UI.CheckBox({
                el: $('#control-settings-chb-lock-edit'),
                labelText: this.txtLockEdit
            });

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
                var val = props.get_Id();
                this.txtName.setValue(val ? val : '');

                val = props.get_Tag();
                this.txtTag.setValue(val ? val : '');

                val = props.get_Lock();
                (val===undefined) && (val = AscCommonWord.sdtlock_Unlocked);
                this.chLockDelete.setValue(val==AscCommonWord.sdtlock_SdtContentLocked || val==AscCommonWord.sdtlock_SdtLocked);
                this.chLockEdit.setValue(val==AscCommonWord.sdtlock_SdtContentLocked || val==AscCommonWord.sdtlock_ContentLocked);
            }
        },

        getSettings: function () {
            var props   = new AscCommonWord.CContentControlPr();


            props.put_Id(this.txtName.getValue());
            props.put_Tag(this.txtTag.getValue());


            var lock = AscCommonWord.sdtlock_Unlocked;

            if (this.chLockDelete.getValue()=='checked' && this.chLockEdit.getValue()=='checked')
                lock = AscCommonWord.sdtlock_SdtContentLocked;
            else if (this.chLockDelete.getValue()=='checked')
                lock = AscCommonWord.sdtlock_SdtLocked;
            else if (this.chLockEdit.getValue()=='checked')
                lock = AscCommonWord.sdtlock_ContentLocked;
            props.put_Lock(lock);

            return props;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                this.handler && this.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        onPrimary: function() {
            return true;
        },

        textTitle:    'Content Control Settings',
        textName: 'Title',
        textTag: 'Tag',
        txtLockDelete: 'Content control cannot be deleted',
        txtLockEdit: 'Contents cannot be edited',
        textLock: 'Locking',
        cancelButtonText: 'Cancel',
        okButtonText: 'Ok'

    }, DE.Views.ControlSettingsDialog || {}))
});