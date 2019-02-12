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
 *  ListView.js
 *
 *  Created by Julia Radzhabova on 2/27/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/DataView'
], function () {
    'use strict';

    Common.UI.ListView = Common.UI.DataView.extend((function() {
        return {
            options: {
                handleSelect: true,
                enableKeyEvents: true,
                showLast: true,
                simpleAddMode: false,
                keyMoveDirection: 'vertical',
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style=""><%= value %></div>')
            },

            template: _.template([
                '<div class="listview inner"></div>'
            ].join('')),

            onResetItems : function() {
                this.innerEl = null;
                Common.UI.DataView.prototype.onResetItems.call(this);
                this.trigger('items:reset', this);
            },

            onAddItem: function(record, store, opts) {
                var view = new Common.UI.DataViewItem({
                    template: this.itemTemplate,
                    model: record
                });

                if (!this.innerEl)
                    this.innerEl = $(this.el).find('.inner');

                if (view && this.innerEl) {
                    (this.dataViewItems.length<1) && this.innerEl.find('.empty-text').remove();
                    if (this.options.simpleAddMode) {
                        this.innerEl.append(view.render().el);
                        this.dataViewItems.push(view);
                    } else {
                        var idx = _.indexOf(this.store.models, record);
                        var innerDivs = this.innerEl.find('> div');

                        if (idx > 0)
                            $(innerDivs.get(idx - 1)).after(view.render().el);
                        else {
                            (innerDivs.length > 0) ? $(innerDivs[idx]).before(view.render().el) : this.innerEl.append(view.render().el);
                        }
                        this.dataViewItems = this.dataViewItems.slice(0, idx).concat(view).concat(this.dataViewItems.slice(idx));
                    }
                    this.listenTo(view, 'change',  this.onChangeItem);
                    this.listenTo(view, 'remove',  this.onRemoveItem);
                    this.listenTo(view, 'click',   this.onClickItem);
                    this.listenTo(view, 'dblclick',this.onDblClickItem);
                    this.listenTo(view, 'select',  this.onSelectItem);

                    if (record.get('tip')) {
                        var view_el = $(view.el);
                        view_el.attr('data-toggle', 'tooltip');
                        view_el.tooltip({
                            title       : record.get('tip'),
                            placement   : 'cursor',
                            zIndex : this.tipZIndex
                        });
                    }

                    if (!this.isSuspendEvents)
                        this.trigger('item:add', this, view, record);
                }
            }
        }
    })());
});