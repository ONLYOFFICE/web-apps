/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  AutoCorrectDialog.js
 *
 *  Created by Julia Radzhabova on 03.07.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */
if (Common === undefined)
    var Common = {};
define([
    'common/main/lib/component/ListView',
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.AutoCorrectDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 448,
            cls: 'modal-dlg',
            buttons: null
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div id="symbol-table-pnl-special">',
                        '<table cols="1" style="width: 100%;">',
                            '<tr>',
                                '<td>',
                                    '<label style="font-weight: bold;margin-bottom: 2px;">' + this.textMathCorrect + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td>',
                                    '<div id="auto-correct-math-list" class="" style="width:100%; height: 300px;"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = this.options.props || [];

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();

            // special
            this.mathList = new Common.UI.ListView({
                el: $window.find('#auto-correct-math-list'),
                store: new Common.UI.DataViewStore(this.props),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="pointer-events:none;width: 100%;display:flex;">',
                        '<div style="min-width:110px;padding-right: 5px;"><%= replaced %></div>',
                        '<div style="flex-grow:1;font-family: Cambria Math;font-size:13px;"><%= by %></div>',
                    '</div>'
                ].join('')),
                scrollAlwaysVisible: true
            });
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        onBtnClick: function(event) {
            this.close();
        },

        onPrimary: function(event) {
            return true;
        },

        textTitle: 'AutoCorrect',
        textMathCorrect: 'Math AutoCorrect'

    }, Common.Views.AutoCorrectDialog || {}))
});
