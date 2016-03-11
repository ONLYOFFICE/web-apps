/**
 *  ListView.js
 *
 *  Created by Julia Radzhabova on 2/27/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
            },

            onAddItem: function(record, index) {
                var view = new Common.UI.DataViewItem({
                    template: this.itemTemplate,
                    model: record
                });

                if (!this.innerEl) {
                    this.innerEl = $(this.el).find('.inner');
                    this.innerEl.find('.empty-text').remove();
                }
                if (view && this.innerEl) {
                    if (this.options.simpleAddMode) {
                        this.innerEl.append(view.render().el)
                    } else {
                        var idx = _.indexOf(this.store.models, record);
                        var innerDivs = this.innerEl.find('> div');

                        if (idx > 0)
                            $(innerDivs.get(idx - 1)).after(view.render().el);
                        else {
                            (innerDivs.length > 0) ? $(innerDivs[idx]).before(view.render().el) : this.innerEl.append(view.render().el);
                        }

                    }
                    this.dataViewItems.push(view);
                    this.listenTo(view, 'change',  this.onChangeItem);
                    this.listenTo(view, 'remove',  this.onRemoveItem);
                    this.listenTo(view, 'click',   this.onClickItem);
                    this.listenTo(view, 'dblclick',this.onDblClickItem);
                    this.listenTo(view, 'select',  this.onSelectItem);

                    if (!this.isSuspendEvents)
                        this.trigger('item:add', this, view, record);
                }
            }
        }
    })());
});