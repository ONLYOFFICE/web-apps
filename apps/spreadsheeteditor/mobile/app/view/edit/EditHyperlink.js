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
 *  EditHyperlink.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/20/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/EditHyperlink.template',
    'jquery',
    'underscore',
    'backbone'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.EditHyperlink = Backbone.View.extend(_.extend((function() {
        // private
        var _editCellController;

        return {
            // el: '.view-main',

            template: _.template(editTemplate),

            events: {
            },

            initialize: function () {
                _editCellController = SSE.getController('EditHyperlink');

                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                this.on('page:show', _.bind(this.updateItemHandlers, this));
            },

            initEvents: function () {
                var me = this;

                me.updateItemHandlers();

                Common.Utils.addScrollIfNeed('#edit-link .pages', '#edit-link .page');
                me.initControls();
            },

            // Render layout
            render: function () {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    scope   : this
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout
                        .find('#edit-link-root')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            showPage: function (templateId, suspendEvent) {
                var rootView = SSE.getController('EditContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    if (suspendEvent !== true) {
                        this.fireEvent('page:show', [this, templateId]);
                    }
                }
            },

            onItemClick: function (e) {
                var $target = $(e.currentTarget),
                    page = $target.data('page');

                if (page && page.length > 0 ) {
                    this.showPage(page);
                }
            },

            updateItemHandlers: function () {
                var selectorsDynamicPage = [
                    '#edit-link'
                ].map(function (selector) {
                    return selector + ' a.item-link[data-page]';
                }).join(', ');

                Common.Utils.addScrollIfNeed('.page[data-page=edit-link-type]', '.page[data-page=edit-border-style] .page-content');
                Common.Utils.addScrollIfNeed('.page[data-page=edit-link-sheet]', '.page[data-page=edit-cell-format] .page-content');

                $(selectorsDynamicPage).single('click', _.bind(this.onItemClick, this));
            },

            textBack: 'Back',
            textExternalLink: 'External Link',
            textInternalLink: 'Internal Data Range',
            textLinkType: 'Link Type',
            textSheet: 'Sheet',
            textRange: 'Range',
            textLink: 'Link',
            textDisplay: 'Display',
            textScreenTip: 'Screen Tip',
            textEditLink: 'Edit Link',
            textRemoveLink: 'Remove Link'
        }
    })(), SSE.Views.EditHyperlink || {}))
});
