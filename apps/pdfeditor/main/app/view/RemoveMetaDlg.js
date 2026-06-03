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
 *  RemoveMetaDlg.js
 *
 *  Created on 4/16/26
 *
 */

define([], function () { 'use strict';

    PDFE.Views.RemoveMetaDlg = Common.UI.Window.extend(_.extend({
        options: {
            width: 400,
            header: true,
            style: 'min-width: 300px;',
            cls: 'modal-dlg',
            id: 'window-remove-meta',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div style="margin-bottom: 5px">',
                        '<label class="text">' + this.textRemoveInformationDescription + '</label>',
                    '</div>',
                    '<div class="separator horizontal" style="margin-bottom: 15px"></div>',
                    '<div id="slot-chk-metadata" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-file-attachments" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-bookmarks" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-embed-search-idx" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-comments" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-fields" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-hidden-text" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-hidden-layers" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-delcrop-content" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-links-actions" class="" style="margin-bottom: 10px;"></div>',
                    '<div id="slot-chk-overlapping" class="" style="margin-bottom: 10px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.spinners = [];
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.chMetadata = new Common.UI.CheckBox({
                el: $('#slot-chk-metadata'),
                labelText: this.textMetadata,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chAttachedFiles = new Common.UI.CheckBox({
                el: $('#slot-chk-file-attachments'),
                labelText: this.textAttachedFiles,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chBookmarks = new Common.UI.CheckBox({
                el: $('#slot-chk-bookmarks'),
                labelText: this.textBookmarks,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chSearchIdx = new Common.UI.CheckBox({
                el: $('#slot-chk-embed-search-idx'),
                labelText: this.textSearchIdx,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chCommentsCorrections = new Common.UI.CheckBox({
                el: $('#slot-chk-comments'),
                labelText: this.textCommentsCorrections,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chFormFields = new Common.UI.CheckBox({
                el: $('#slot-chk-fields'),
                labelText: this.textFormFields,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chHiddenText = new Common.UI.CheckBox({
                el: $('#slot-chk-hidden-text'),
                labelText: this.textHiddenText,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chHiddenLayers = new Common.UI.CheckBox({
                el: $('#slot-chk-hidden-layers'),
                labelText: this.textHiddenLayers,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chDeletedTrimmed = new Common.UI.CheckBox({
                el: $('#slot-chk-delcrop-content'),
                labelText: this.textDeletedTrimmed,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chLinksActions = new Common.UI.CheckBox({
                el: $('#slot-chk-links-actions'),
                labelText: this.textLinksActions,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chOverlapping = new Common.UI.CheckBox({
                el: $('#slot-chk-overlapping'),
                labelText: this.textOverlappingObjects,
                value: true,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.chMetadata, this.chAttachedFiles, this.chBookmarks, this.chSearchIdx, 
                this.chCommentsCorrections, this.chFormFields, this.chHiddenText, 
                this.chHiddenLayers, this.chDeletedTrimmed, this.chLinksActions, 
                this.chOverlapping].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.chMetadata;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        getSettings: function() {
            return [this.chMetadata.isChecked(), this.chAttachedFiles.isChecked(), this.chBookmarks.isChecked(), this.chSearchIdx.isChecked(), 
                this.chCommentsCorrections.isChecked(), this.chFormFields.isChecked(), this.chHiddenText.isChecked(), 
                this.chHiddenLayers.isChecked(), this.chDeletedTrimmed.isChecked(), this.chLinksActions.isChecked(), 
                this.chOverlapping.isChecked()]
        },
    }, PDFE.Views.RemoveMetaDlg || {}))
});