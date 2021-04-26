import React, { useEffect, useState } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../utils/device';

const PluginsController = props => {
    let configPlugins = {autostart:[]},
        serverPlugins = {autostart:[]};

    useEffect(() => {
        const onDocumentReady = () => {
            Common.Notifications.trigger('engineCreated', api => {
                api.asc_registerCallback("asc_onPluginShow", showPluginModal);
                api.asc_registerCallback("asc_onPluginClose", pluginClose);
                api.asc_registerCallback("asc_onPluginResize", pluginResize);
                api.asc_registerCallback('asc_onPluginsInit', registerPlugins);
            });
    
            Common.Gateway.on('init', loadConfig);
            console.log('success');
        };

        onDocumentReady();

        if(!props.customization || props.plugins !== false) {
            loadPlugins();
        }

        return () => {
            const api = Common.EditorApi.get();

            api.asc_unregisterCallback("asc_onPluginShow", showPluginModal);
            api.asc_unregisterCallback("asc_onPluginClose", pluginClose);
            api.asc_unregisterCallback("asc_onPluginResize", pluginResize);
            api.asc_unregisterCallback('asc_onPluginsInit', registerPlugins);

            Common.Gateway.off('init', loadConfig);
        };
    });


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
                size = variation.get_Size(); //size[0] - width, size[1] - height

            if (arrBtns.length) {
                arrBtns.forEach((b, index) => {
                    if ((props.isEdit || b.isViewer)) {
                        newBtns[index] = {
                            text: b.text,
                            attributes: {result: index}
                        };
                    }
                });
            }

            // uiApp.closeModal();
            // f7.popover.close('.document-menu.modal-in', false);

            f7.dialog.create({
                title: '',
                text: '',
                content:  '<div id="plugin-frame" class="">'+
                '</div>',
                buttons : isCustomWindow ? undefined : newBtns
            }).open();

            $$('#plugin-frame').html('<div class="preloader"></div>');

            let iframe = document.createElement("iframe");

            iframe.id           = frameId;
            iframe.name         = 'pluginFrameEditor';
            iframe.width        = '100%';
            iframe.height       = '100%';
            // iframe.align        = "top";
            // iframe.frameBorder  = 0;
            // iframe.scrolling    = "no";
            iframe.src = url;

            // setTimeout(function () {
            $$('#plugin-frame').html(iframe);
            // }, 100);

            $$(modal).find('.modal-button').on('click', onDlgBtnClick);

            $$(modal).css({
                margin: '0',
                width: '90%',
                left: '5%',
                height: 'auto',
                top: '20px'
            });

            $$(modal).find('.modal-inner').css({padding: '0'});

            if (Common.SharedSettings.get('phone')) {
                let height = Math.min(size[1], 240);
                $$(modal).find('#plugin-frame').css({height: height + 'px'});
            } else {
                let height = Math.min(size[1], 500);
                $$(modal).find('#plugin-frame').css({height: height + 'px'});
            }

            if (isAndroid) {
                $$('.view.collaboration-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                $$('.view.collaboration-root-view .navbar').prependTo('.view.collaboration-root-view > .pages > .page');
            }
        }
    };

    const onDlgBtnClick = e => {
        const api = Common.EditorApi.get();
        let index = $$(e.currentTarget).index();
        api.asc_pluginButtonClick(index);
    };

    const pluginClose = plugin => {
        if (iframe) {
            iframe = null;
        }
    };

    const pluginResize = size => {
        if (Common.SharedSettings.get('phone')) {
            let height = Math.min(size[1], 240);
            $$(modal).find('#plugin-frame').css({height: height + 'px'});
        } else {
            let height = Math.min(size[1], 500);
            $$(modal).find('#plugin-frame').css({height: height + 'px'});
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
        configPlugins.config = data.config.plugins;
    };

    const registerPlugins = plugins => {
        const api = Common.EditorApi.get();
        let arr = [];

        plugins.forEach(item => {
            let plugin = new Asc.CPlugin();

            plugin.set_Name(item['name']);
            plugin.set_Guid(item['guid']);
            plugin.set_BaseUrl(item['baseUrl']);

            let variations = item['variations'],
                variationsArr = [];

            variations.forEach(itemVar => {
                let variation = new Asc.CPluginVariation();

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

        api.asc_pluginsRegister('', arr);
    };

    const mergePlugins = () => {
        if (serverPlugins.plugins !== undefined && configPlugins.plugins !== undefined) {
            let arr = [],
                plugins = configPlugins;

            if (plugins.plugins && plugins.plugins.length > 0) {
                arr = plugins.plugins;
            }

            plugins = serverPlugins;

            if (plugins.plugins && plugins.plugins.length > 0) {
                arr = arr.concat(plugins.plugins);
            }

            registerPlugins(arr);
        }
    };

    const loadPlugins = () => {
        if (configPlugins.config) {
            getPlugins(configPlugins.config.pluginsData)
                .then(function(loaded)
                {
                    configPlugins.plugins = loaded;
                    mergePlugins();
                });
        } else {
            configPlugins.plugins = false;
        }

        let server_plugins_url = '../../../../plugins.json';

        Common.Utils.loadConfig(server_plugins_url, function (obj) {
            if (obj != 'error') {
                serverPlugins.config = obj;
                getPlugins(serverPlugins.config.pluginsData)
                    .then(function(loaded)
                    {
                        serverPlugins.plugins = loaded;
                        mergePlugins();
                    });
            } else
                serverPlugins.plugins = false;
        });
    };

    return <></>
};

export default PluginsController;



