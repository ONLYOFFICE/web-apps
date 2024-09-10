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
 * Date: 22.02.2022
 */

define([
    'core',
    'common/main/lib/collection/Plugins'
], function () {
    'use strict';

    DE.Controllers.Plugins = Backbone.Controller.extend(_.extend({
        models: [],
        appOptions: {},
        configPlugins: {autostart:[]},// {config: 'from editor config', plugins: 'loaded plugins', autostart: 'autostart guids'}
        serverPlugins: {autostart:[]},// {config: 'from editor config', plugins: 'loaded plugins', autostart: 'autostart guids'}
        collections: [
            'Common.Collections.Plugins'
        ],
        initialize: function() {
        },

        events: function() {
        },

        onLaunch: function() {
            this._moveOffset = {x:0, y:0};
            this.autostart = [];

            Common.Gateway.on('init', this.loadConfig.bind(this));
        },

        loadConfig: function(data) {
            var me = this;
            me.configPlugins.config = data.config.plugins;
            me.editor = 'word';
        },

        loadPlugins: function() {
            if (this.configPlugins.config) {
                this.getPlugins(this.configPlugins.config.pluginsData)
                    .then(function(loaded)
                    {
                        me.configPlugins.plugins = loaded;
                        me.mergePlugins();
                    })
                    .catch(function(err)
                    {
                        me.configPlugins.plugins = false;
                    });
                if (this.configPlugins.config.options)
                    this.api.setPluginsOptions(this.configPlugins.config.options);
            } else
                this.configPlugins.plugins = false;

            var server_plugins_url = '../../../../plugins.json',
                me = this;
            Common.Utils.loadConfig(server_plugins_url, function (obj) {
                if ( obj != 'error' ) {
                    me.serverPlugins.config = obj;
                    me.getPlugins(me.serverPlugins.config.pluginsData)
                        .then(function(loaded)
                        {
                            me.serverPlugins.plugins = loaded;
                            me.mergePlugins();
                        })
                        .catch(function(err)
                        {
                            me.serverPlugins.plugins = false;
                        });
                } else
                    me.serverPlugins.plugins = false;
            });
        },

        setApi: function(api) {
            this.api = api;

            if (!this.appOptions.customization || (this.appOptions.customization.plugins!==false)) {
                this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.onPluginShow, this));
                this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.onPluginClose, this));
                this.api.asc_registerCallback("asc_onPluginResize", _.bind(this.onPluginResize, this));
                this.api.asc_registerCallback("asc_onPluginMouseUp", _.bind(this.onPluginMouseUp, this));
                this.api.asc_registerCallback("asc_onPluginMouseMove", _.bind(this.onPluginMouseMove, this));
                this.api.asc_registerCallback('asc_onPluginsReset', _.bind(this.resetPluginsList, this));
                this.api.asc_registerCallback('asc_onPluginsInit', _.bind(this.onPluginsInit, this));

                this.loadPlugins();
            }
            return this;
        },

        setMode: function(mode, api) {
            this.appOptions = mode;
            this.api = api;
            return this;
        },

        refreshPluginsList: function() {
            var me = this;
            var storePlugins = this.getApplication().getCollection('Common.Collections.Plugins'),
                arr = [];
            storePlugins.each(function(item){
                var plugin = new Asc.CPlugin();
                plugin.deserialize(item.get('original'));
                item.set('pluginObj', plugin);
                arr.push(plugin);
            });
            this.api.asc_pluginsRegister('', arr);
            Common.Gateway.pluginsReady();
        },

        onPluginShow: function(plugin, variationIndex, frameId, urlAddition) {
            var variation = plugin.get_Variations()[variationIndex];
            if (variation.get_Visual()) {
                var lang = this.appOptions && this.appOptions.lang ? this.appOptions.lang.split(/[\-_]/)[0] : 'en';
                var url = variation.get_Url();
                url = ((plugin.get_BaseUrl().length == 0) ? url : plugin.get_BaseUrl()) + url;
                if (urlAddition)
                    url += urlAddition;
                var me = this,
                    isCustomWindow = variation.get_CustomWindow(),
                    arrBtns = variation.get_Buttons(),
                    newBtns = [],
                    size = variation.get_Size(),
                    isModal = variation.get_Modal();
                if (!size || size.length<2) size = [800, 600];

                if (_.isArray(arrBtns)) {
                    _.each(arrBtns, function(b, index){
                        if (b.visible)
                            newBtns[index] = {caption: b.text, value: index, primary: b.primary};
                    });
                }

                var help = variation.get_Help();
                me.pluginDlg = new Common.Views.PluginDlg({
                    cls: isCustomWindow ? 'plain' : '',
                    header: !isCustomWindow,
                    title: plugin.get_Name(lang),
                    width: size[0], // inner width
                    height: size[1], // inner height
                    url: url,
                    frameId : frameId,
                    buttons: isCustomWindow ? undefined : newBtns,
                    toolcallback: function(event) {
                        me.api.asc_pluginButtonClick(-1, plugin.get_Guid());
                    },
                    help: !!help,
                    loader: plugin.get_Loader(),
                    modal: isModal!==undefined ? isModal : true
                });
                me.pluginDlg.on({
                    'render:after': function(obj){
                        obj.getChild('.footer .dlg-btn').on('click', function(event) {
                            me.api.asc_pluginButtonClick(parseInt(event.currentTarget.attributes['result'].value), plugin.get_Guid());
                        });
                        me.pluginContainer = me.pluginDlg.$window.find('#id-plugin-container');
                    },
                    'close': function(obj){
                        me.pluginDlg = undefined;
                    },
                    'drag': function(args){
                        me.api.asc_pluginEnableMouseEvents(args[1]=='start');
                    },
                    'resize': function(args){
                        me.api.asc_pluginEnableMouseEvents(args[1]=='start');
                    },
                    'help': function(){
                        help && window.open(help, '_blank');
                    }
                });

                me.pluginDlg.show();
            }
        },

        onPluginClose: function(plugin) {
            if (this.pluginDlg)
                this.pluginDlg.close();
            this.runAutoStartPlugins();
        },

        onPluginResize: function(size, minSize, maxSize, callback ) {
            if (this.pluginDlg) {
                var resizable = (minSize && minSize.length>1 && maxSize && maxSize.length>1 && (maxSize[0] > minSize[0] || maxSize[1] > minSize[1] || maxSize[0]==0 || maxSize[1] == 0));
                this.pluginDlg.setResizable(resizable, minSize, maxSize);
                this.pluginDlg.setInnerSize(size[0], size[1]);
                if (callback)
                    callback.call();
            }
        },

        onPluginMouseUp: function(x, y) {
            if (this.pluginDlg) {
                if (this.pluginDlg.binding.dragStop) this.pluginDlg.binding.dragStop();
                if (this.pluginDlg.binding.resizeStop) this.pluginDlg.binding.resizeStop();
            }
        },

        onPluginMouseMove: function(x, y) {
            if (this.pluginDlg) {
                var offset = this.pluginContainer.offset();
                if (this.pluginDlg.binding.drag) this.pluginDlg.binding.drag({ pageX: x*Common.Utils.zoom()+offset.left, pageY: y*Common.Utils.zoom()+offset.top });
                if (this.pluginDlg.binding.resize) this.pluginDlg.binding.resize({ pageX: x*Common.Utils.zoom()+offset.left, pageY: y*Common.Utils.zoom()+offset.top });
            }
        },

        onPluginsInit: function(pluginsdata) {
            !(pluginsdata instanceof Array) && (pluginsdata = pluginsdata["pluginsData"]);
            this.parsePlugins(pluginsdata, true);
        },

        runAutoStartPlugins: function() {
            if (this.autostart && this.autostart.length > 0) {
                this.api.asc_pluginRun(this.autostart.shift(), 0, '');
            }
        },

        resetPluginsList: function() {
            this.getApplication().getCollection('Common.Collections.Plugins').reset();
        },

        parsePlugins: function(pluginsdata, forceUpdate) {
            var me = this;
            var pluginStore = this.getApplication().getCollection('Common.Collections.Plugins'),
                isEdit = false,
                editor = me.editor,
                apiVersion = me.api ? me.api.GetVersion() : undefined;
            if ( pluginsdata instanceof Array ) {
                var arr = [],
                    lang = me.appOptions.lang.split(/[\-_]/)[0];
                pluginsdata.forEach(function(item){
                    var updatedItem;
                    if (forceUpdate) {
                        updatedItem = arr.find(function (i){
                            return i.get('baseUrl') == item.baseUrl || i.get('guid') == item.guid}
                        );
                        !updatedItem && (updatedItem = pluginStore.findWhere({baseUrl: item.baseUrl}));
                        !updatedItem && (updatedItem = pluginStore.findWhere({guid: item.guid}));
                    } else {
                        if ( arr.some(function(i) {
                                return (i.get('baseUrl') == item.baseUrl || i.get('guid') == item.guid);
                            }
                        ) || pluginStore.findWhere({baseUrl: item.baseUrl}) || pluginStore.findWhere({guid: item.guid}))
                        {
                            return;
                        }
                    }

                    var variationsArr = [],
                        pluginVisible = false;
                    item.variations.forEach(function(itemVar){
                        var isSystem = (true === itemVar.isSystem) || (Asc.PluginType.System === Asc.PluginType.getType(itemVar.type));
                        var visible = (isEdit || itemVar.isViewer && (itemVar.isDisplayedInViewer!==false)) && _.contains(itemVar.EditorsSupport, editor) && !isSystem;
                        if ( visible ) pluginVisible = true;

                        if (!item.isUICustomizer ) {
                            var model = new Common.Models.PluginVariation(itemVar);
                            var description = itemVar.description;
                            if (typeof itemVar.descriptionLocale == 'object')
                                description = itemVar.descriptionLocale[lang] || itemVar.descriptionLocale['en'] || description || '';

                            _.each(itemVar.buttons, function(b, index){
                                if (typeof b.textLocale == 'object')
                                    b.text = b.textLocale[lang] || b.textLocale['en'] || b.text || '';
                                b.visible = (isEdit || b.isViewer !== false);
                            });

                            model.set({
                                description: description,
                                index: variationsArr.length,
                                url: itemVar.url,
                                icons: itemVar.icons2 || itemVar.icons,
                                buttons: itemVar.buttons,
                                visible: visible,
                                help: itemVar.help
                            });

                            variationsArr.push(model);
                        }
                    });

                    if (variationsArr.length > 0 && !item.isUICustomizer) {
                        var name = item.name;
                        if (typeof item.nameLocale == 'object')
                            name = item.nameLocale[lang] || item.nameLocale['en'] || name || '';

                        if (pluginVisible)
                            pluginVisible = me.checkPluginVersion(apiVersion, item.minVersion);

                        var props = {
                            name : name,
                            guid: item.guid,
                            baseUrl : item.baseUrl,
                            variations: variationsArr,
                            currentVariation: 0,
                            visible: pluginVisible,
                            groupName: (item.group) ? item.group.name : '',
                            groupRank: (item.group) ? item.group.rank : 0,
                            minVersion: item.minVersion,
                            original: item
                        };
                        updatedItem ? updatedItem.set(props) : arr.push(new Common.Models.Plugin(props));
                    }
                });

                if (pluginStore)
                {
                    arr = pluginStore.models.concat(arr);
                    arr.sort(function(a, b){
                        var rank_a = a.get('groupRank'),
                            rank_b = b.get('groupRank');
                        if (rank_a < rank_b)
                            return (rank_a==0) ? 1 : -1;
                        if (rank_a > rank_b)
                            return (rank_b==0) ? -1 : 1;
                        return 0;
                    });
                    pluginStore.reset(arr);
                    this.appOptions.canPlugins = !pluginStore.isEmpty();
                }
            }
            else {
                this.appOptions.canPlugins = false;
            }

            if (this.appOptions.canPlugins) {
                this.refreshPluginsList();
                this.runAutoStartPlugins();
            }
        },

        checkPluginVersion: function(apiVersion, pluginVersion) {
            if (apiVersion && apiVersion!=='develop' && pluginVersion && typeof pluginVersion == 'string') {
                var res = pluginVersion.match(/^([0-9]+)(?:.([0-9]+))?(?:.([0-9]+))?$/),
                    apires = apiVersion.match(/^([0-9]+)(?:.([0-9]+))?(?:.([0-9]+))?$/);
                if (res && res.length>1 && apires && apires.length>1) {
                    for (var i=0; i<3; i++) {
                        var pluginVer = res[i+1] ? parseInt(res[i+1]) : 0,
                            apiVer = apires[i+1] ? parseInt(apires[i+1]) : 0;
                        if (pluginVer>apiVer)
                            return false;
                        if (pluginVer<apiVer)
                            return true;
                    }
                }

            }
            return true;
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

        mergePlugins: function() {
            if (this.serverPlugins.plugins !== undefined && this.configPlugins.plugins !== undefined) { // undefined - plugins are loading
                var autostart = [],
                    arr = [],
                    plugins = this.configPlugins,
                    warn = false;
                if (plugins.plugins && plugins.plugins.length>0)
                    arr = plugins.plugins;
                if (plugins && plugins.config) {
                    var val = plugins.config.autostart || plugins.config.autoStartGuid;
                    if (typeof (val) == 'string')
                        val = [val];
                    warn = !!plugins.config.autoStartGuid;
                    autostart = val || [];
                }

                plugins = this.serverPlugins;
                if (plugins.plugins && plugins.plugins.length>0)
                    arr = arr.concat(plugins.plugins);
                if (plugins && plugins.config) {
                    val = plugins.config.autostart || plugins.config.autoStartGuid;
                    if (typeof (val) == 'string')
                        val = [val];
                    (warn || plugins.config.autoStartGuid) && console.warn("Obsolete: The autoStartGuid parameter is deprecated. Please check the documentation for new plugin connection configuration.");
                    autostart = autostart.concat(val || []);
                }

                this.autostart = autostart;
                this.parsePlugins(arr);
            }
        }

    }, DE.Controllers.Plugins || {}));
});
