/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 * Date: 17.05.16
 * Time: 15:38
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

    Common.Views.Plugins = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-plugins',

        storePlugins: undefined,
        template: _.template([
            '<div id="plugins-box" class="layout-ct vbox">',
                '<label style="font-weight: bold;"><%= scope.strPlugins %></label>',
                '<div id="plugins-list" class="">',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            this.pluginsPath = '../../../../sdkjs-plugins/';
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el = el || this.el;
            $(el).html(this.template({scope: this})).width( (parseInt(Common.localStorage.getItem('de-mainmenu-width')) || MENU_SCALE_PART) - SCALE_MIN);

            this.viewPluginsList = new Common.UI.DataView({
                el: $('#plugins-list'),
                store: this.storePlugins,
                enableKeyEvents: false,
                itemTemplate: _.template('<div id="<%= id %>" class="item-plugins" style="background-image: url(' + this.pluginsPath + '<%= icons[(window.devicePixelRatio > 1) ? 1 : 0] %>); background-position: 0 0;"></div>')
//                itemTemplate: _.template('<div id="<%= id %>" class="item-plugins" style="background-image: url(' + this.pluginsPath + 'chess/icon.png' + '); background-position: 0 0;"></div>')
            });

            this.trigger('render:after', this);
            return this;
        },

        strPlugins: 'Plugins'

    }, Common.Views.Plugins || {}))
});