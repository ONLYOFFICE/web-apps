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
 * Controller wraps up interaction with desktop app
 *
 * Created by Maxim.Kadushkin on 2/16/2018.
 */

define([
    'core'
], function () {
    'use strict';

    var features = {
        version: '{{PRODUCT_VERSION}}',
        eventloading: true,
        titlebuttons: true,
        uithemes: true,
        btnhome: true,
        quickprint: true
    };

    var native = window.desktop || window.AscDesktopEditor;
    !!native && native.execCommand('webapps:features', JSON.stringify(features));

    var Desktop = function () {
        var config = {version:'{{PRODUCT_VERSION}}'};
        var webapp = window.DE || window.PE || window.SSE;
        var titlebuttons;
        var btnsave_icons = {
            'btn-save': 'save',
            'btn-save-coauth': 'coauth',
            'btn-synch': 'synch' };

        var nativevars,
            helpUrl;

        if ( !!native ) {
            native.features = native.features || {};
            nativevars = window.RendererProcessVariable;

            window.on_native_message = function (cmd, param) {
                if (/^style:change/.test(cmd)) {
                    var obj = JSON.parse(param);

                    if ( obj.element == 'toolbar' ) {
                        if ( obj.action == 'off' && obj.style == 'native-color' ) {
                            $('.toolbar').removeClass('editor-native-color');
                        }
                    } else
                    if ( obj.element == 'body' ) {
                        if ( obj.action == 'merge' ) {
                            var style = document.createElement('style');
                            style.innerHTML = obj.style;
                            document.body.appendChild(style);
                        }
                    }
                } else
                if (/window:features/.test(cmd)) {
                    var obj = JSON.parse(param);
                    if (_.isNumber(obj.skiptoparea)) {
                        if ( $('.asc-window.modal').length && $('.asc-window.modal').position().top < obj.skiptoparea )
                            $('.asc-window.modal').css('top', obj.skiptoparea);

                        Common.Utils.InternalSettings.set('window-inactive-area-top', obj.skiptoparea);
                    }

                    if ( obj.singlewindow !== undefined ) {
                        // $('#box-document-title .hedset')[obj.singlewindow ? 'hide' : 'show']();
                        native.features.singlewindow = obj.singlewindow;
                        titlebuttons.home && titlebuttons.home.btn.setVisible(obj.singlewindow);
                    }
                } else
                if (/editor:config/.test(cmd)) {
                    if ( param == 'request' ) {
                        if ( !!titlebuttons ) {
                            var opts = {
                                user: config.user,
                                title: { buttons: [] }
                            };

                            var header = webapp.getController('Viewport').getView('Common.Views.Header');
                            if ( header ) {
                                for (var i in titlebuttons) {
                                    opts.title.buttons.push(_serializeHeaderButton(i, titlebuttons[i]));
                                }
                            }

                            native.execCommand('editor:config', JSON.stringify(opts));
                        } else
                        if ( !config.callback_editorconfig ) {
                            config.callback_editorconfig = function() {
                                setTimeout(function(){window.on_native_message(cmd, param);},0);
                            }
                        }
                    }
                } else
                if (/button:click/.test(cmd)) {
                    var obj = JSON.parse(param);
                    if ( !!obj.action && !!titlebuttons[obj.action] ) {
                        titlebuttons[obj.action].btn.click();
                    }
                } else
                if (/theme:changed/.test(cmd)) {
                    Common.UI.Themes.setTheme(param);
                } else
                if (/element:show/.test(cmd)) {
                    var _mr = /title:(?:(true|show)|(false|hide))/.exec(param);
                    if ( _mr ) {
                        if (!!_mr[1]) $('#app-title').show();
                        else if (!!_mr[2]) $('#app-title').hide();
                    }
                } else
                if (/althints:show/.test(cmd)) {
                    if ( /false|hide/.test(param) )
                        Common.NotificationCenter.trigger('hints:clear');
                }
            };

            window.on_native_message('editor:config', 'request');
            if ( !!window.native_message_cmd ) {
                for ( var c in window.native_message_cmd ) {
                    window.on_native_message(c, window.native_message_cmd[c]);
                }
            }

            native.execCommand('webapps:features', JSON.stringify(features));

            // hide mask for modal window
            var style = document.createElement('style');
            style.appendChild(document.createTextNode('.modals-mask{opacity:0 !important;}'));
            document.getElementsByTagName('head')[0].appendChild(style);
        }

        var _serializeHeaderButton = function(action, config) {
            return {
                action: action,
                icon: config.icon || undefined,
                hint: config.btn.options.hint,
                disabled: config.btn.isDisabled(),
                visible: config.visible,
            };
        };

        var _onTitleButtonDisabled = function (action, e, status) {
            var _buttons = {};
            _buttons[action] = status;
            native.execCommand('title:button', JSON.stringify({disabled: _buttons}));
        };

        var _onSaveIconChanged = function (e, opts) {
            native.execCommand('title:button', JSON.stringify({'icon:changed': {'save': btnsave_icons[opts.next]}}));
        };

        var _onModalDialog = function (status) {
            if ( status == 'open' ) {
                native.execCommand('title:button', JSON.stringify({disabled: {'all':true}}));
            } else {
                var _buttons = {};
                for (var i in titlebuttons) {
                    _buttons[i] = titlebuttons[i].btn.isDisabled();
                }

                native.execCommand('title:button', JSON.stringify({'disabled': _buttons}));
            }
        };

        var _onHintsShow = function (visible, level) {
            let info = {
                visible: visible && !(level > 0),
            };

            if ( !!titlebuttons ) {
                info.hints = {};
                !!titlebuttons['print'] && (info.hints['print'] = titlebuttons['print'].btn.btnEl.attr('data-hint-title'));
                !!titlebuttons['quickprint'] && (info.hints['quickprint'] = titlebuttons['quickprint'].btn.btnEl.attr('data-hint-title'));
                !!titlebuttons['undo'] && (info.hints['undo'] = titlebuttons['undo'].btn.btnEl.attr('data-hint-title'));
                !!titlebuttons['redo'] && (info.hints['redo'] = titlebuttons['redo'].btn.btnEl.attr('data-hint-title'));
                !!titlebuttons['save'] && (info.hints['save'] = titlebuttons['save'].btn.btnEl.attr('data-hint-title'));
            }

            native.execCommand('althints:show', JSON.stringify(info));
        }

        var _onKeyDown = function (e) {
            if ( Common.UI.HintManager.isHintVisible() ) {
                native.execCommand('althints:keydown', JSON.stringify({code:e.keyCode}));
                console.log('hint keydown', e.keyCode);
            }
        }

        const _onApplySettings = function (menu) {
            if ( !!titlebuttons.quickprint ) {
                const var_name = window.SSE ? 'sse-settings-quick-print-button' :
                                    window.PE ? 'pe-settings-quick-print-button' : 'de-settings-quick-print-button';
                const is_btn_visible = Common.localStorage.getBool(var_name, false);

                if ( titlebuttons.quickprint.visible != is_btn_visible ) {
                    titlebuttons.quickprint.visible = is_btn_visible;
                    const obj = {
                        visible: {
                            quickprint: is_btn_visible,
                        }
                    };
                    native.execCommand('title:button', JSON.stringify(obj));
                }
            }
        }

        const _checkHelpAvailable = function () {
            const me = this;
            const build_url = function (arg1, arg2, arg3) {
                const re_ls = /\/$/;
                return (re_ls.test(arg1) ? arg1 : arg1 + '/') + arg2 + arg3;
            }

            fetch(build_url('resources/help/', Common.Locale.getDefaultLanguage(), '/Contents.json'))
                .then(function (response) {
                    if ( response.ok ) {
                        /* local help avail */
                        fetch(build_url('resources/help/', Common.Locale.getCurrentLanguage(), '/Contents.json'))
                            .then(function (response){
                                if ( response.ok )
                                    helpUrl = build_url('resources/help/', Common.Locale.getCurrentLanguage(), '');
                            })
                            .catch(function (e) {
                                helpUrl = build_url('resources/help/', Common.Locale.getDefaultLanguage(), '');
                            })
                    }
                }).catch(function (e) {
                    if ( me.helpUrl() ) {
                        fetch(build_url(me.helpUrl(), Common.Locale.getDefaultLanguage(), '/Contents.json'))
                            .then(function (response) {
                                // if ( response.ok )
                                    return response.json();
                            })
                            .then(function (text) {
                                /* remote help avail */
                                fetch(build_url(me.helpUrl(), Common.Locale.getCurrentLanguage(), '/Contents.json'))
                                    .then(function (response) {
                                        // if ( response.ok )
                                            return response.json();
                                    })
                                    .then(function (t) {
                                        helpUrl = build_url(me.helpUrl(), Common.Locale.getCurrentLanguage(), '');
                                    })
                                    .catch(function (e) {
                                        helpUrl = build_url(me.helpUrl(), Common.Locale.getDefaultLanguage(), '');
                                    });
                            })
                            .catch(function (e){
                            })
                    }
                });
        }

        const _onAppReady = function (opts) {
            _.extend(config, opts);
            !!native && native.execCommand('doc:onready', '');

            $('.toolbar').addClass('editor-native-color');
        }

        const _onDocumentReady = function () {
            if ( config.isEdit ) {
                function get_locked_message (t) {
                    switch (t) {
                        // case Asc.c_oAscLocalRestrictionType.Nosafe:
                        case Asc.c_oAscLocalRestrictionType.ReadOnly:
                            return Common.Locale.get("tipFileReadOnly",{name:"Common.Translation", default: "Document is read only. You can make changes and save its local copy later."});
                        default: return Common.Locale.get("tipFileLocked",{name:"Common.Translation", default: "Document is locked for editing. You can make changes and save its local copy later."});
                    }
                }

                const header = webapp.getController('Viewport').getView('Common.Views.Header');
                const api = webapp.getController('Main').api;
                const locktype = api.asc_getLocalRestrictions ? api.asc_getLocalRestrictions() : Asc.c_oAscLocalRestrictionType.None;
                if ( Asc.c_oAscLocalRestrictionType.None !== locktype ) {
                    features.readonly = true;

                    header.setDocumentReadOnly(true);
                    api.asc_setLocalRestrictions(Asc.c_oAscLocalRestrictionType.None);

                    (new Common.UI.SynchronizeTip({
                        extCls: 'no-arrow',
                        placement: 'bottom',
                        target: $('.toolbar'),
                        text: get_locked_message(locktype),
                        showLink: false,
                    })).on('closeclick', function () {
                        this.close();
                    }).show();

                    native.execCommand('webapps:features', JSON.stringify(features));

                    api.asc_registerCallback('asc_onDocumentName', function () {
                        if ( features.readonly ) {
                            if ( api.asc_getLocalRestrictions() == Asc.c_oAscLocalRestrictionType.None ) {
                                features.readonly = false;
                                header.setDocumentReadOnly(false);
                                native.execCommand('webapps:features', JSON.stringify(features));
                            }
                        }
                    });
                }

                _checkHelpAvailable.call(this);
            }
        }

        const _onHidePreloader = function (mode) {
            features.viewmode = !mode.isEdit;
            features.crypted = mode.isCrypted;
            native.execCommand('webapps:features', JSON.stringify(features));

            titlebuttons = {};
            if ( mode.isEdit ) {
                var header = webapp.getController('Viewport').getView('Common.Views.Header');

                {
                    header.btnHome = (new Common.UI.Button({
                        cls: 'btn-header',
                        iconCls: 'toolbar__icon icon--inverse btn-home',
                        visible: false,
                        hint: 'Show Main window',
                        dataHint:'0',
                        dataHintDirection: 'right',
                        dataHintOffset: '10, -18',
                        dataHintTitle: 'K'
                    })).render($('#box-document-title #slot-btn-dt-home'));
                    titlebuttons['home'] = {btn: header.btnHome};

                    header.btnHome.on('click', function (e) {
                        native.execCommand('title:button', JSON.stringify({click: "home"}));
                    });

                    $('#id-box-doc-name').on({
                        'dblclick': function (e) {
                            native.execCommand('title:dblclick', JSON.stringify({x: e.originalEvent.screenX, y: e.originalEvent.screenY}))
                        },
                        'mousedown': function (e) {
                            native.execCommand('title:mousedown', JSON.stringify({x: e.originalEvent.screenX, y: e.originalEvent.screenY}))
                        },
                        'mousemove': function (e) {
                            native.execCommand('title:mousemove', JSON.stringify({x: e.originalEvent.screenX, y: e.originalEvent.screenY}))
                        },
                        'mouseup': function (e) {
                            native.execCommand('title:mouseup', JSON.stringify({x: e.originalEvent.screenX, y: e.originalEvent.screenY}))
                        }
                    });
                }

                if (!!header.btnSave) {
                    titlebuttons['save'] = {btn: header.btnSave};

                    var iconname = /\s?([^\s]+)$/.exec(titlebuttons.save.btn.$icon.attr('class'));
                    !!iconname && iconname.length && (titlebuttons.save.icon = btnsave_icons[iconname]);
                }

                if (!!header.btnPrint)
                    titlebuttons['print'] = {btn: header.btnPrint};

                if (!!header.btnPrintQuick) {
                    titlebuttons['quickprint'] = {
                        btn: header.btnPrintQuick,
                        visible: header.btnPrintQuick.isVisible(),
                    };
                }

                if (!!header.btnUndo)
                    titlebuttons['undo'] = {btn: header.btnUndo};

                if (!!header.btnRedo)
                    titlebuttons['redo'] = {btn: header.btnRedo};

                for (var i in titlebuttons) {
                    titlebuttons[i].btn.options.signals = ['disabled'];
                    titlebuttons[i].btn.on('disabled', _onTitleButtonDisabled.bind(this, i));
                }

                if (!!titlebuttons.save) {
                    titlebuttons.save.btn.options.signals.push('icon:changed');
                    titlebuttons.save.btn.on('icon:changed', _onSaveIconChanged.bind(this));
                }
            }

            if ( !!config.callback_editorconfig ) {
                config.callback_editorconfig();
                delete config.callback_editorconfig;
            }

            if ( native.features.singlewindow !== undefined ) {
                // $('#box-document-title .hedset')[native.features.singlewindow ? 'hide' : 'show']();
                !!titlebuttons.home && titlebuttons.home.btn.setVisible(native.features.singlewindow);
            }
        }

        return {
            init: function (opts) {
                _.extend(config, opts);

                if ( config.isDesktopApp ) {
                    let is_win_xp = nativevars && nativevars.os === 'winxp';

                    Common.UI.Themes.setAvailable(!is_win_xp);
                    Common.NotificationCenter.on({
                        'app:ready': _onAppReady,
                        'document:ready': _onDocumentReady.bind(this),
                        'app:face': _onHidePreloader.bind(this),
                        'modal:show': _onModalDialog.bind(this, 'open'),
                        'modal:close': _onModalDialog.bind(this, 'close'),
                        'modal:hide': _onModalDialog.bind(this, 'hide'),
                        'uitheme:changed' : function (name) {
                            if (Common.localStorage.getBool('ui-theme-use-system', false)) {
                                native.execCommand("uitheme:changed", JSON.stringify({name:'theme-system'}));
                            } else {
                                var theme = Common.UI.Themes.get(name);
                                if ( theme )
                                    native.execCommand("uitheme:changed", JSON.stringify({name:name, type:theme.type}));
                            }
                        },
                        'hints:show': _onHintsShow.bind(this),
                    });

                    webapp.addListeners({
                        'FileMenu': {
                            'item:click': function (menu, action, isopts) {
                                if ( action == 'file:exit' ) {
                                    native.execCommand('editor:event', JSON.stringify({action: 'file:close'}));
                                    menu.hide();
                                } else
                                if ( action == 'file:open' ) {
                                    native.execCommand('editor:event', JSON.stringify({action: 'file:open'}));
                                    menu.hide();
                                }
                            },
                            'settings:apply': _onApplySettings.bind(this),
                        },
                    }, {id: 'desktop'});

                    $(document).on('keydown', _onKeyDown.bind(this));
                }
            },
            process: function (opts) {
                if ( config.isDesktopApp && !!native ) {
                    if ( opts == 'goback' ) {
                        native.execCommand('go:folder',
                            config.isOffline ? 'offline' : config.customization.goback.url);
                        return true;
                    } else
                    if ( opts == 'preloader:hide' ) {
                        native.execCommand('editor:onready', '');
                        return true;
                    } else
                    if ( opts == 'create:new' ) {
                        if (config.createUrl == 'desktop://create.new') {
                            native.execCommand("create:new", !!window.SSE ? 'cell' : !!window.PE ? 'slide' : 'word');
                            return true;
                        }
                    }
                }

                return false;
            },
            requestClose: function () {
                if ( config.isDesktopApp && !!native ) {
                    native.execCommand('editor:event', JSON.stringify({action:'file:close', url: config.customization.goback.url}));
                }
            },
            isActive: function () {
                return !!native;
            },
            isOffline: function () {
                // return webapp.getController('Main').api.asc_isOffline();
                return webapp.getController('Main').appOptions.isOffline;
            },
            isFeatureAvailable: function (feature) {
                return !!native && !!native[feature];
            },
            call: function (name) {
                if ( native[name] ) {
                    let args = [].slice.call(arguments, 1);
                    // return native[name](...args);
                    return native[name].apply(this, args);
                }
            },
            helpUrl: function () {
                if ( helpUrl )
                    return helpUrl;

                if ( !!nativevars && nativevars.helpUrl ) {
                    var webapp = window.SSE ? 'spreadsheeteditor' :
                                    window.PE ? 'presentationeditor' : 'documenteditor';
                    return nativevars.helpUrl + '/' + webapp + '/main/resources/help';
                }

                return undefined;
            },
            isHelpAvailable: function () {
                return !!helpUrl;
            },
            getDefaultPrinterName: function () {
                return nativevars ? nativevars.defaultPrinterName : '';
            },
            systemThemeType: function () {
                return nativevars.theme && !!nativevars.theme.system ? nativevars.theme.system :
                            window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            },
        };
    };

    Common.Controllers.Desktop = new Desktop();
});
