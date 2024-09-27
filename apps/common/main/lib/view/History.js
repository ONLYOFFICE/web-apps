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
 * Date: 06.03.15
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function (template) {
    'use strict';

    Common.Views.History = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-history',

        storeHistory: undefined,
        template: _.template([
            '<div id="history-box" class="layout-ct vbox">',
                '<div id="history-header" class="">',
                    '<label><%=scope.textVersionHistory%></label>',
                    '<div id="history-btn-back" class="float-right margin-left-4"></div>',
                    '<div id="history-btn-menu" class="float-right"></div>',
                '</div>',
                '<div id="history-list" class="">',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);

            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';
        },

        render: function(el) {
            el = el || this.el;
            $(el).html(this.template({scope: this})).width( (parseInt(Common.localStorage.getItem(this.appPrefix + 'mainmenu-width')) || MENU_SCALE_PART) - SCALE_MIN);

            this.viewHistoryList = new Common.UI.TreeView({
                el: $('#history-list'),
                store: this.storeHistory,
                enableKeyEvents: false,
                style: 'border: none',
                itemTemplate: _.template([
                    '<div ', 
                        'id="<%= id %>"',
                        'class="tree-item ' + '<% if (!isVisible) { %>' + 'hidden' + '<% } %>' + '" ',
                        'style="<% if (hasParent) { %>' + (Common.UI.isRTL() ? 'padding-right: 40px;' : 'padding-left: 40px;') + '<% } %>"',
                    '>',
                        
                        '<% if (!hasParent) { %>',
                            '<div class="caret-wrap">',
                                '<% if (hasSubItems) { %>',
                                    '<div class="tree-caret img-commonctrl ' + '<% if (!isExpanded) { %>' + 'up' + '<% } %>' + '"></div>',
                                '<% } %>',
                            '</div>',
                        '<% } %>',
                        '<div class="content-wrap">',
                            '<div class="item-internal">',
                                '<div ', 
                                    'class="color"', 
                                    '<% if (avatar) { %>',
                                        'style="background-image: url(<%=avatar%>); <% if (usercolor!==null) { %> border-color:<%=usercolor%>; border-style:solid;<% }%>"', 
                                    '<% } else { %>',
                                        'style="background-color: <% if (usercolor!==null) { %> <%=usercolor%> <% } else { %> #cfcfcf <% }%>;"',
                                    '<% } %>',
                                '>',
                                    '<% if (!avatar) { %><%-initials%><% } %>', 
                                '</div>',
                                '<div class="item-content">',
                                    '<div class="item-title">',
                                        '<div class="user-date"><%= created %></div>',
                                        '<% if (markedAsVersion) { %>',
                                            '<div class="user-version">' + this.textVer + '<%=version%></div>',
                                        '<% } %>',
                                    '</div>',
                                    '<div class="user-name">',
                                        '<%= Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(username)) %>',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<% if (canRestore && selected) { %>',
                                '<label class="revision-restore" role="presentation" tabindex="-1">' + this.textRestore + '</label>',
                            '<% } %>',
                        '</div>',
                    '</div>'
                ].join(''))
            });

            var me = this;
            this.viewHistoryList.on('item:expand', function (record, newVal, oldVal) {
                me.btnExpand.setCaption(me.storeHistory.hasCollapsed() ? me.textShowAll : me.textHideAll);
            });
   
            this.btnBackToDocument = new Common.UI.Button({
                parentEl: $('#history-btn-back', this.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-close',
                hint: this.textCloseHistory
            });

            var buttonMenuItems = [
                this.btnExpand = new Common.UI.MenuItem({
                    caption: this.textHideAll,
                    checkable: false
                })
            ];
            if(!!window.DE) {
                buttonMenuItems.push(
                    this.chHighlightDeleted = new Common.UI.MenuItem({
                        caption: this.textHighlightDeleted,
                        value: 'highlight',
                        checkable: true,
                    })
                );
            }
            this.buttonMenu = new Common.UI.Button({
                parentEl: $('#history-btn-menu', this.$el),
                cls: 'btn-toolbar no-caret',
                iconCls: 'toolbar__icon btn-more',
                hint: this.textMore,
                menu: new Common.UI.Menu({
                    style: 'min-width: auto;',
                    items: buttonMenuItems
                })
            });

            this.trigger('render:after', this);
            return this;
        },

        textRestore: 'Restore',
        textVersionHistory: 'Version History',
        textHighlightDeleted: 'Highlight deleted',
        textHideAll: 'Hide detailed changes',
        textShowAll: 'Show detailed changes',
        textVer: 'ver.',
        textMore: 'More',
        textCloseHistory: 'Close history',

    }, Common.Views.History || {}))
});