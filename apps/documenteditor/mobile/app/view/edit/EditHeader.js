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
 *  EditHeader.js
 *  Document Editor
 *
 *  Created by Julia Radzhabova on 2/15/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/mobile/app/template/EditHeader.template',
    'jquery',
    'underscore',
    'backbone'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.EditHeader = Backbone.View.extend(_.extend((function() {
        // private

        return {
            template: _.template(editTemplate),

            events: {
            },

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                var me = this;

                DE.getController('EditHeader').initSettings();
                Common.Utils.addScrollIfNeed('#edit-header .pages', '#edit-header .page');
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
                        .find('#edit-header-root')
                        .html();
                }

                return '';
            },

            showPage: function (templateId, customFireEvent) {
                var rootView = DE.getController('EditContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    if (customFireEvent !== true) {
                        this.fireEvent('page:show', [this, templateId]);
                    }
                }
            },

            textDiffFirst: 'Different first page',
            textDiffOdd: 'Different odd and even pages',
            textSameAs: 'Link to Previous',
            textPageNumbering: 'Page Numbering',
            textPrev: 'Continue from previous section',
            textFrom: 'Start at'
        }
    })(), DE.Views.EditHeader || {}))
});