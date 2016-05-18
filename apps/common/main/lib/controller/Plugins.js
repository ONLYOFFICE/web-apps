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

define([
    'core',
    'common/main/lib/collection/Plugins',
    'common/main/lib/view/Plugins'
], function () {
    'use strict';

    Common.Controllers.Plugins = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [
            'Common.Collections.Plugins'
        ],
        views: [
            'Common.Views.Plugins'
        ],

        initialize: function() {
        },

        events: {
        },

        onLaunch: function() {
            this.panelPlugins= this.createView('Common.Views.Plugins', {
                storePlugins: this.getApplication().getCollection('Common.Collections.Plugins')
            });
            this.panelPlugins.on('render:after', _.bind(this.onAfterRender, this));
        },

        setApi: function(api) {
            this.api = api;

            var me = this;
            var storePlugins = this.getApplication().getCollection('Common.Collections.Plugins'),
                arr = [];
            storePlugins.each(function(item){
                var plugin                 = new Asc.CPlugin();
                plugin.set_Name(item.get('name'));
                plugin.set_Guid(item.get('guid'));
                plugin.set_Url(item.get('url'));
                plugin.set_Icons(item.get('icons'));
                plugin.set_Visual(item.get('isVisual'));
                plugin.set_InitDataType(item.get('initDataType'));
                plugin.set_UpdateOleOnResize(item.get('isUpdateOleOnResize'));
                plugin.set_Buttons(item.get('buttons'));
                item.set('pluginObj', plugin);
                arr.push(plugin);
            });
            this.api.asc_pluginsRegister(this.panelPlugins.pluginsPath, arr);

            this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.onPluginShow, this));
            this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.onPluginClose, this));

            return this;
        },

        setMode: function(mode) {
        },

        onAfterRender: function(historyView) {
            historyView.viewPluginsList.on('item:click', _.bind(this.onSelectPlugin, this));
        },

        onSelectPlugin: function(picker, item, record){
            this.api.asc_pluginRun(record.get('guid'), '');
        },

        onPluginShow: function(plugin) {
            if (!plugin.get_Visual()) return;
            
            var me = this,
                arrBtns = plugin.get_Buttons(),
                newBtns = {};

            if (_.isArray(arrBtns)) {
                _.each(arrBtns, function(b, index){
                    newBtns[index] = {text: b.text, cls: 'custom' + ((b.primary) ? ' primary' : '')};
                });
            }

            me.pluginDlg = new Common.Views.PluginDlg({
                title: plugin.get_Name(),
                url: me.panelPlugins.pluginsPath + plugin.get_Url(),
                buttons: newBtns,
                toolcallback: _.bind(this.onToolClose, this)
            });
            me.pluginDlg.on('render:after', function(obj){
                obj.getChild('.footer .dlg-btn').on('click', _.bind(me.onDlgBtnClick, me));
            }).on('close', function(obj){
                me.pluginDlg = undefined;
            });
            me.pluginDlg.show();
        },

        onPluginClose: function(plugin) {
            if (this.pluginDlg)
                this.pluginDlg.close();
        },

        onDlgBtnClick: function(event) {
            var state = event.currentTarget.attributes['result'].value;
            window.g_asc_plugins.buttonClick(parseInt(state));
        },

        onToolClose: function() {
            window.g_asc_plugins.buttonClick(-1);
        }

    }, Common.Controllers.Plugins || {}));
});
