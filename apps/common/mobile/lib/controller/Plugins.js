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
 *  Plugins.js
 *
 *  Created by Julia Svinareva on 8/7/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core',
    'jquery',
    'underscore',
    'backbone'
], function (core, $, _, Backbone) {
    'use strict';

    Common.Controllers.Plugins = Backbone.Controller.extend(_.extend((function() {
        // Private
        var modal;

        return {
            configPlugins: {autostart:[]},// {config: 'from editor config', plugins: 'loaded plugins', UIplugins: 'loaded customization plugins', autostart: 'autostart guids'}
            serverPlugins: {autostart:[]},
            models: [],
            collections: [],
            views: [
            ],

            initialize: function() {
                var me = this;
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.showPluginModal, this));
                this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.pluginClose, this));
                this.api.asc_registerCallback("asc_onPluginResize", _.bind(this.pluginResize, this));
                this.api.asc_registerCallback('asc_onPluginsInit', _.bind(this.onPluginsInit, this));
            },

            onLaunch: function () {
                Common.Gateway.on('init', this.loadConfig.bind(this));
            },

            setMode: function(mode) {
                this.appConfig = mode;
                if (!this.appConfig.customization || (this.appConfig.customization.plugins!==false))
                    this.loadPlugins();
            },


            showPluginModal: function(plugin, variationIndex, frameId, urlAddition) {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true;

                var variation = plugin.get_Variations()[variationIndex];
                if (variation.get_Visual()) {
                    var url = variation.get_Url();
                    url = ((plugin.get_BaseUrl().length == 0) ? url : plugin.get_BaseUrl()) + url;
                    if (urlAddition)
                        url += urlAddition;
                    var isCustomWindow = variation.get_CustomWindow(),
                        arrBtns = variation.get_Buttons(),
                        newBtns = [],
                        size = variation.get_Size(); //size[0] - width, size[1] - height
                    if (_.isArray(arrBtns)) {
                        _.each(arrBtns, function(b, index){
                            if ((me.appConfig.isEdit || b.isViewer !== false))
                                newBtns[index] = {
                                    text: b.text,
                                    attributes: {result: index}
                                };
                        });
                    }
                    uiApp.closeModal();

                    modal = uiApp.modal({
                        title: '',
                        text: '',
                        afterText:
                            '<div id="plugin-frame" class="">'+
                            '</div>',
                        buttons: isCustomWindow ? undefined : newBtns
                    });
                    $('#plugin-frame').html('<div class="preloader"></div>');
                    me.iframe = document.createElement("iframe");
                    me.iframe.id           = frameId;
                    me.iframe.name         = 'pluginFrameEditor';
                    me.iframe.width        = '100%';
                    me.iframe.height       = '100%';
                    me.iframe.align        = "top";
                    me.iframe.frameBorder  = 0;
                    me.iframe.scrolling    = "no";
                    me.iframe.src = url;
                    setTimeout(function () {
                        $('#plugin-frame').html(me.iframe);
                    }, 100);
                    $$(modal).find('.modal-button').on('click', _.bind(me.onDlgBtnClick, me));
                    $$(modal).css({
                        margin: '0',
                        width: '90%',
                        left: '5%',
                        height: 'auto',
                        top: '20px'
                    });
                    $$(modal).find('.modal-inner').css({padding: '0'});
                    if (Common.SharedSettings.get('phone')) {
                        var height = Math.min(size[1], 240);
                        $$(modal).find('#plugin-frame').css({height: height + 'px'});
                    } else {
                        var height = Math.min(size[1], 500);
                        $$(modal).find('#plugin-frame').css({height: height + 'px'});
                    }

                    if (Framework7.prototype.device.android === true) {
                        $$('.view.collaboration-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                        $$('.view.collaboration-root-view .navbar').prependTo('.view.collaboration-root-view > .pages > .page');
                    }
                }
            },

            onDlgBtnClick: function (e) {
                var index = $(e.currentTarget).index();
                this.api.asc_pluginButtonClick(index);
            },

            pluginClose: function (plugin) {
                if (this.iframe) {
                    this.iframe = null;
                }
            },

            pluginResize: function(size) {
                if (Common.SharedSettings.get('phone')) {
                    var height = Math.min(size[1], 240);
                    $$(modal).find('#plugin-frame').css({height: height + 'px'});
                } else {
                    var height = Math.min(size[1], 500);
                    $$(modal).find('#plugin-frame').css({height: height + 'px'});
                }
            },

            loadConfig: function(data) {
                this.configPlugins.config = data.config.plugins;
            },

            loadPlugins: function() {
                var me = this;
                if (me.configPlugins.config) {
                    me.getPlugins(me.configPlugins.config.pluginsData)
                        .then(function(loaded)
                        {
                            me.configPlugins.plugins = loaded;
                            me.mergePlugins();
                        });
                } else {
                    me.configPlugins.plugins = false;
                }
                var server_plugins_url = '../../../../plugins.json';
                Common.Utils.loadConfig(server_plugins_url, function (obj) {
                    if ( obj != 'error' ) {
                        me.serverPlugins.config = obj;
                        me.getPlugins(me.serverPlugins.config.pluginsData)
                            .then(function(loaded)
                            {
                                me.serverPlugins.plugins = loaded;
                                me.mergePlugins();
                            });
                    } else
                        me.serverPlugins.plugins = false;
                });
            },

            mergePlugins: function() {
                var me = this;
                if (me.serverPlugins.plugins !== undefined && me.configPlugins.plugins !== undefined) {
                    var arr = [],
                        plugins = this.configPlugins;
                    if (plugins.plugins && plugins.plugins.length>0) {
                        arr = plugins.plugins;
                    }
                    plugins = this.serverPlugins;
                    if (plugins.plugins && plugins.plugins.length>0) {
                        arr = arr.concat(plugins.plugins);
                    }
                    this.registerPlugins(arr);
                }
            },

            onPluginsInit: function(pluginsdata) {
                !(pluginsdata instanceof Array) && (pluginsdata = pluginsdata["pluginsData"]);
                this.registerPlugins(pluginsdata)
            },

            registerPlugins: function(plugins) {
                var me = this;
                var arr = [];
                plugins.forEach(function(item){
                    var plugin = new Asc.CPlugin();
                    plugin.set_Name(item['name']);
                    plugin.set_Guid(item['guid']);
                    plugin.set_BaseUrl(item['baseUrl']);
                    plugin.set_MinVersion(item['minVersion']);

                    var variations = item['variations'],
                        variationsArr = [];
                    variations.forEach(function(itemVar){
                        var variation = new Asc.CPluginVariation();
                        variation.set_Description(itemVar['description']);
                        variation.set_Url(itemVar['url']);
                        variation.set_Icons(itemVar['icons']);
                        variation.set_Visual(itemVar['isVisual']);
                        variation.set_CustomWindow(itemVar['isCustomWindow']);
                        variation.set_System(itemVar['isSystem']);
                        variation.set_Viewer(itemVar['isViewer']);
                        variation.set_EditorsSupport(itemVar['EditorsSupport']);
                        variation.set_Modal(itemVar['isModal']);
                        variation.set_InsideMode(itemVar['isInsideMode']);
                        variation.set_InitDataType(itemVar['initDataType']);
                        variation.set_InitData(itemVar['initData']);
                        variation.set_UpdateOleOnResize(itemVar['isUpdateOleOnResize']);
                        variation.set_Buttons(itemVar['buttons']);
                        variation.set_Size(itemVar['size']);
                        variation.set_InitOnSelectionChanged(itemVar['initOnSelectionChanged']);
                        variation.set_Events(itemVar['events']);

                        variationsArr.push(variation);
                    });

                    plugin["set_Variations"](variationsArr);
                    arr.push(plugin);
                });
                me.api.asc_pluginsRegister('', arr);
                Common.Gateway.pluginsReady();
            },

            getPlugins: function(pluginsData, fetchFunction) {
                if (!pluginsData || pluginsData.length<1)
                    return Promise.resolve([]);

                fetchFunction = fetchFunction || function (url) {
                    return fetch(url)
                        .then(function(response) {
                            if ( response.ok ) return response.json();
                            else return Promise.reject(url);
                        }).then(function(json) {
                            json.baseUrl = url.substring(0, url.lastIndexOf("config.json"));
                            return json;
                        });
                };

                var loaded = [];
                return pluginsData.map(fetchFunction).reduce(function (previousPromise, currentPromise) {
                    return previousPromise
                        .then(function()
                        {
                            return currentPromise;
                        })
                        .then(function(item)
                        {
                            loaded.push(item);
                            return Promise.resolve(item);
                        })
                        .catch(function(item)
                        {
                            return Promise.resolve(item);
                        });

                }, Promise.resolve())
                    .then(function ()
                    {
                        return Promise.resolve(loaded);
                    });
            },

            textCancel: 'Cancel',
            textLoading: 'Loading'
        }
    })(), Common.Controllers.Plugins || {}))
});