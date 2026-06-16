/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 *  DocProtection.js
 *
 *  Created on 21.09.2022
 *
 */
define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window',
    'common/main/lib/view/OpenDialog'
], function (template) {
    'use strict';

    DE.Views.DocProtection = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<div class="group">' +
            '<span id="slot-btn-protect-doc" class="btn-slot text x-huge"></span>' +
            '</div>';

        function setEvents() {
            var me = this;

            this.btnProtectDoc && this.btnProtectDoc.on('click', function (btn, e) {
                me.fireEvent('protect:document', [btn.pressed]);
            });
            me._isSetEvents = true;
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;

                var _set = Common.enumLock;
                this.lockedControls = [];
                this._state = {disabled: false, currentProtectHint: this.hintProtectDoc };

                if(!this.appConfig.isPDFForm) {
                    this.btnProtectDoc = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-restrict-editing',
                        enableToggle: true,
                        caption: this.txtProtectDoc,
                        lock        : [_set.lostConnect, _set.coAuth, _set.previewReviewMode, _set.viewFormMode, _set.protectLock, _set.viewMode],
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnProtectDoc);
                }

                Common.UI.LayoutManager.addControls(this.lockedControls);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnProtectDoc && me.btnProtectDoc.updateHint(me._state.currentProtectHint, true);
                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                this.btnProtectDoc && this.btnProtectDoc.render(this.$el.find('#slot-btn-protect-doc'));
                return this.$el;
            },

            getButtons: function(type) {
                if (type===undefined)
                    return this.lockedControls;
                return [];
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            updateProtectionTips: function(type) {
                var str = this.txtProtectDoc;
                if (type === Asc.c_oAscEDocProtect.ReadOnly) {
                    str = this.txtDocProtectedView;
                } else if (type === Asc.c_oAscEDocProtect.Comments) {
                    str = this.txtDocProtectedComment;
                } else if (type === Asc.c_oAscEDocProtect.Forms) {
                    str = this.txtDocProtectedForms;
                } else if (type === Asc.c_oAscEDocProtect.TrackedChanges){ // none or tracked changes
                    str = this.txtDocProtectedTrack;
                }
                this.btnProtectDoc && this.btnProtectDoc.updateHint(str, true);
                this._state.currentProtectHint = str;
            },
            txtProtectDoc: 'Protect Document',
            txtDocProtectedView: 'Document is protected.<br>You may only view this document.',
            txtDocProtectedTrack: 'Document is protected.<br>You may edit this document, but all changes will be tracked.',
            txtDocProtectedComment: 'Document is protected.<br>You may only insert comments to this document.',
            txtDocProtectedForms: 'Document is protected.<br>You may only fill in forms in this document.',
            hintProtectDoc: 'Protect document',
            txtDocUnlockDescription: 'Enter a password to unprotect document',
            txtUnlockTitle: 'Unprotect Document'
        }
    }()), DE.Views.DocProtection || {}));
});