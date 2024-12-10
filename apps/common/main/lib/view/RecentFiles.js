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
 *    RecentFiles.js
 *
 *    View
 *
 *    Created on 20.04.2023
 *
 */
if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict'
    Common.Views.RecentFiles = Common.UI.BaseView.extend(_.extend({
        menu: undefined,

        template: _.template([
            '<div class="header"><%= scope.txtOpenRecent %></div>',
            '<div id="id-recent-view"></div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.recent = options.recent;
            this.el = options.el;

            Common.NotificationCenter.on('update:recents', function (arr) {
                if ( this.viewRecentPicker ) {
                    const store = this.viewRecentPicker.store;
                    if ( store ) {
                        store.reset(this.recent.concat(arr))
                    }
                }
            }.bind(this));
        },

        render: function() {
            this.$el.html(this.template({scope: this}));

            this.viewRecentPicker = new Common.UI.DataView({
                el: $('#id-recent-view'),
                store: new Common.UI.DataViewStore(this.recent),
                itemTemplate: _.template([
                    '<div class="recent-wrap">',
                        '<div class="recent-icon">',
                            '<div>',
                                '<div class= <% if (typeof format !== "undefined") {%> "img-format-<%=format %>"<% } else {%> "svg-file-recent"<%} %>></div>',
                            '</div>',
                        '</div>',
                        '<div class="file-name"><% if (typeof title !== "undefined") {%><%= Common.Utils.String.htmlEncode(title || "") %><% } %></div>',
                        '<div class="file-info"><% if (typeof folder !== "undefined") {%><%= Common.Utils.String.htmlEncode(folder || "") %><% } %></div>',
                    '</div>'
                ].join(''))
            });

            this.viewRecentPicker.on('item:click', _.bind(this.onRecentFileClick, this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
        },

        onRecentFileClick: function(view, itemview, record){
            if ( this.menu ) {
                !Common.Controllers.Desktop.openRecent(record) &&
                    this.menu.fireEvent('recent:open', [this.menu, record.get('url')]);
            }
        },

        txtOpenRecent: 'Open Recent'
    }, Common.Views.RecentFiles || {}));
});