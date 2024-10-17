import React, { useEffect, useRef } from 'react';
import { inject, observer } from 'mobx-react';
import { f7 } from 'framework7-react';
import { Device } from '../../utils/device';

const PluginsController = inject('storeAppOptions')(observer(props => {
    const { storeAppOptions } = props;
    const refConfigPlugins = useRef({ autostart:[] });
    const refServerPlugins = useRef({ autostart:[] });
    let modal, iframe;

    useEffect(() => {
        if (storeAppOptions.customization && !!storeAppOptions.customization.plugins) {
            const api = Common.EditorApi.get();

            api.asc_registerCallback("asc_onPluginShow", showPluginModal);
            api.asc_registerCallback("asc_onPluginClose", pluginClose);
            api.asc_registerCallback("asc_onPluginResize", pluginResize);
            api.asc_registerCallback('asc_onPluginsInit', onPluginsInit);

            loadPlugins();
        }

        Common.Gateway.on('init', loadConfig);

        return () => {
            const api = Common.EditorApi.get();

            if (api) {
                api.asc_unregisterCallback("asc_onPluginShow", showPluginModal);
                api.asc_unregisterCallback("asc_onPluginClose", pluginClose);
                api.asc_unregisterCallback("asc_onPluginResize", pluginResize);
                api.asc_unregisterCallback('asc_onPluginsInit', onPluginsInit);
            }
        };
    }, [storeAppOptions.customization]);

    const onDlgBtnClick = e => {
        const api = Common.EditorApi.get();
        let index = $$(e.currentTarget).index();
        api.asc_pluginButtonClick(index);
    };

    const showPluginModal = (plugin, variationIndex, frameId, urlAddition) => {
        let isAndroid = Device.android;
        let variation = plugin.get_Variations()[variationIndex];

        if (variation.get_Visual()) {
            let url = variation.get_Url();
            url = ((plugin.get_BaseUrl().length == 0) ? url : plugin.get_BaseUrl()) + url;

            if (urlAddition)
                url += urlAddition;

            let isCustomWindow = variation.get_CustomWindow(),
                arrBtns = variation.get_Buttons(),
                newBtns = [],
                size = variation.get_Size();

            if (arrBtns.length) {
                arrBtns.forEach((b, index) => {
                    if ((storeAppOptions.isEdit || b.isViewer !== false)) {
                        newBtns[index] = {
                            text: b.text,
                            attributes: {result: index},
                            close: false
                        };
                    }
                });
            }

            f7.popover.close('.document-menu.modal-in', false);

            modal = f7.dialog.create({
                title: '',
                text: '',
                content:  '<div id="plugin-frame" class="">'+'</div>',
                buttons : isCustomWindow ? undefined : newBtns
            }).open();

            iframe = document.createElement("iframe");

            iframe.id           = frameId;
            iframe.name         = 'pluginFrameEditor';
            iframe.width        = '100%';
            iframe.height       = '100%';
            iframe.align        = "top";
            iframe.frameBorder  = 0;
            iframe.scrolling    = "no";
            iframe.src = url;

            $$('#plugin-frame').append(iframe);
            
            modal.$el.find('.dialog-button').on('click', onDlgBtnClick);

            modal.$el.css({
                margin: '0',
                width: '90%',
                left: '5%',
                height: 'auto'
            });

            modal.$el.find('.dialog-inner').css({padding: '0'});

            if (Device.phone) {
                let height = Math.min(size[1], 240);
                modal.$el.find('#plugin-frame').css({height: height + 'px'});
            } else {
                let height = Math.min(size[1], 500);
                modal.$el.find('#plugin-frame').css({height: height + 'px'});
            }

            if (isAndroid) {
                $$('.view.collaboration-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                $$('.view.collaboration-root-view .navbar').prependTo('.view.collaboration-root-view > .pages > .page');
            }
        }
    };

    const pluginClose = plugin => {
        if (plugin && modal) {
            modal.close();
        }
    };

    const pluginResize = size => {
        if (Device.phone) {
            let height = Math.min(size[1], 240);
            modal.$el.find('#plugin-frame').css({height: height + 'px'});
        } else {
            let height = Math.min(size[1], 500);
            modal.$el.find('#plugin-frame').css({height: height + 'px'});
        }
    };

    const getPlugins = (pluginsData, fetchFunction) => {
        if (!pluginsData || pluginsData.length < 1)
            return Promise.resolve([]);

        fetchFunction = fetchFunction || function (url) {
            return fetch(url)
                .then(function(response) {
                    if (response.ok) return response.json();
                    else return Promise.reject(url);
                }).then(function(json) {
                    json.baseUrl = url.substring(0, url.lastIndexOf("config.json"));
                    return json;
                });
        };

        let loaded = [];

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
    };

    const loadConfig = data => {
        refConfigPlugins.current.config = data.config.plugins;
    };

    const onPluginsInit = pluginsdata => {
        !(pluginsdata instanceof Array) && (pluginsdata = pluginsdata["pluginsData"]);
        parsePlugins(pluginsdata)
    };

    const parsePlugins = pluginsdata => {
        let isEdit = storeAppOptions.isEdit;
        
        if (pluginsdata instanceof Array) { 
            let lang = storeAppOptions.lang ? storeAppOptions.lang.split(/[\-_]/)[0] : 'en';
            pluginsdata.forEach((item) => {
                item.variations.forEach( (itemVar) => { 
                    let description = itemVar.description;
                    if (typeof itemVar.descriptionLocale == 'object')
                    description = itemVar.descriptionLocale[lang] || itemVar.descriptionLocale['en'] || description || '';

                    if(itemVar.buttons !== undefined) {
                        itemVar.buttons.forEach( (button) => {
                            if (typeof button.textLocale == 'object')
                                    button.text = button.textLocale[lang] || button.textLocale['en'] || button.text || '';
                            button.visible = (isEdit || button.isViewer !== false);
                        })
                    }
                })
            });
        } 
        registerPlugins(pluginsdata);
    };

    const registerPlugins = plugins => {
        let arr = [];

        plugins.forEach(item => {
            let plugin = new Asc.CPlugin();
            plugin.deserialize(item);
            arr.push(plugin);
        });

        const api = Common.EditorApi.get();
        api.asc_pluginsRegister('', arr);
    };

    const mergePlugins = () => {
        if (refServerPlugins.current.plugins !== undefined && refConfigPlugins.current.plugins !== undefined) {
            let arr = [],
                plugins = refConfigPlugins.current;

            if (plugins.plugins && plugins.plugins.length > 0) {
                arr = plugins.plugins;
            }

            plugins = refServerPlugins.current;

            if (plugins.plugins && plugins.plugins.length > 0) {
                arr = arr.concat(plugins.plugins);
            }

            parsePlugins(arr);
        }
    };

    const loadPlugins = () => {
        if (refConfigPlugins.current.config) {
            getPlugins(refConfigPlugins.current.config.pluginsData)
                .then(function(loaded)
                {
                    refConfigPlugins.current.plugins = loaded;
                    mergePlugins();
                });
            if (configPlugins.config.options) {
                const api = Common.EditorApi.get();
                api && api.setPluginsOptions(configPlugins.config.options);
            }
        } else {
            refConfigPlugins.current.plugins = false;
        }

        let server_plugins_url = '../../../../plugins.json';

        Common.Utils.loadConfig(server_plugins_url, function (obj) {
            if (obj != 'error') {
                refServerPlugins.current.config = obj;
                getPlugins(refServerPlugins.current.config.pluginsData)
                    .then(function(loaded)
                    {
                        refServerPlugins.current.plugins = loaded;
                        mergePlugins();
                    });
            } else
                refServerPlugins.current.plugins = false;
        });
    };

    return <></>
}));

export default PluginsController;



