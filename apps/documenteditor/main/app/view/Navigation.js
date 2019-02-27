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
 * User: Julia.Radzhabova
 * Date: 14.12.17
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/TreeView'
], function (template) {
    'use strict';

    DE.Views.Navigation = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-navigation',

        storeNavigation: undefined,
        template: _.template([
            '<div id="navigation-box" class="layout-ct vbox">',
                // '<div id="navigation-header"><%= scope.strNavigate %></div>',
                '<div id="navigation-list" class="">',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el = el || this.el;
            $(el).html(this.template({scope: this}));
            this.$el = $(el);

            this.viewNavigationList = new Common.UI.TreeView({
                el: $('#navigation-list'),
                store: this.storeNavigation,
                enableKeyEvents: false,
                emptyText: this.txtEmpty,
                emptyItemText: this.txtEmptyItem
            });
            this.viewNavigationList.cmpEl.off('click');
            this.navigationMenu = new Common.UI.Menu({
                items: [{
                        caption     : this.txtPromote,
                        value: 'promote'
                    },
                    {
                        caption     : this.txtDemote,
                        value: 'demote'
                    },
                    {
                        caption     : '--'
                    },
                    {
                        caption     : this.txtHeadingBefore,
                        value: 'before'
                    },
                    {
                        caption     : this.txtHeadingAfter,
                        value: 'after'
                    },
                    {
                        caption     : this.txtNewHeading,
                        value: 'new'
                    },
                    {
                        caption     : '--'
                    },
                    {
                        caption     : this.txtSelect,
                        value: 'select'
                    },
                    {
                        caption     : '--'
                    },
                    {
                        caption     : this.txtExpand,
                        value: 'expand'
                    },
                    {
                        caption     : this.txtCollapse,
                        value: 'collapse'
                    },
                    {
                        caption     : this.txtExpandToLevel,
                        menu: new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            style: 'min-width: 60px;',
                            items: [{ caption : '1', value: 1 }, { caption : '2', value: 2 }, { caption : '3', value: 3 },
                                { caption : '4', value: 4 }, { caption : '5', value: 5 }, { caption : '6', value: 6 },
                                { caption : '7', value: 7 }, { caption : '8', value: 8 },  { caption : '9', value: 9 }
                            ]
                        })
                    }
                ]
            });

            this.trigger('render:after', this);
            return this;
        },

        show: function () {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.fireEvent('show', this );
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
        },

        ChangeSettings: function(props) {
        },

        txtPromote: 'Promote',
        txtDemote: 'Demote',
        txtHeadingBefore: 'New heading before',
        txtHeadingAfter: 'New heading after',
        txtNewHeading: 'New subheading',
        txtSelect: 'Select content',
        txtExpand: 'Expand all',
        txtCollapse: 'Collapse all',
        txtExpandToLevel: 'Expand to level...',
        txtEmpty: 'This document doesn\'t contain headings',
        txtEmptyItem: 'Empty Heading'

    }, DE.Views.Navigation || {}));
});