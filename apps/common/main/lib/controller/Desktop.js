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
        uithemes: true
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

        var nativevars;

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
                    } else
                    if ( obj.lockthemes != undefined ) {
                        // TODO: remove after 7.0.2. depricated. used is_win_xp variable instead
                        // Common.UI.Themes.setAvailable(!obj.lockthemes);
                    }
                    if ( obj.singlewindow !== undefined ) {
                        $('#box-document-title .hedset')[obj.singlewindow ? 'hide' : 'show']();
                        native.features.singlewindow = obj.singlewindow;
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
                disabled: config.btn.isDisabled()
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

        return {
            init: function (opts) {
                _.extend(config, opts);

                if ( config.isDesktopApp ) {
                    let is_win_xp = nativevars && nativevars.os === 'winxp';

                    Common.UI.Themes.setAvailable(!is_win_xp);
                    Common.NotificationCenter.on('app:ready', function (opts) {
                        _.extend(config, opts);
                        !!native && native.execCommand('doc:onready', '');

                        $('.toolbar').addClass('editor-native-color');
                    });

                    Common.NotificationCenter.on('document:ready', function () {
                        if ( config.isEdit ) {
                            var maincontroller = webapp.getController('Main');
                            if (maincontroller.api.asc_isReadOnly && maincontroller.api.asc_isReadOnly()) {
                                maincontroller.warningDocumentIsLocked();
                            }
                        }
                    });

                    Common.NotificationCenter.on('app:face', function (mode) {
                        features.viewmode = !mode.isEdit;
                        features.crypted = mode.isCrypted;
                        native.execCommand('webapps:features', JSON.stringify(features));

                        titlebuttons = {};
                        if ( mode.isEdit ) {
                            var header = webapp.getController('Viewport').getView('Common.Views.Header');
                            if (!!header.btnSave) {
                                titlebuttons['save'] = {btn: header.btnSave};

                                var iconname = /\s?([^\s]+)$/.exec(titlebuttons.save.btn.$icon.attr('class'));
                                !!iconname && iconname.length && (titlebuttons.save.icon = btnsave_icons[iconname]);
                            }

                            if (!!header.btnPrint)
                                titlebuttons['print'] = {btn: header.btnPrint};

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
                            $('#box-document-title .hedset')[native.features.singlewindow ? 'hide' : 'show']();
                        }
                    });

                    Common.NotificationCenter.on({
                        'modal:show': _onModalDialog.bind(this, 'open'),
                        'modal:close': _onModalDialog.bind(this, 'close'),
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
                if ( !!nativevars && nativevars.helpUrl ) {
                    var webapp = window.SSE ? 'spreadsheeteditor' :
                                    window.PE ? 'presentationeditor' : 'documenteditor';
                    return nativevars.helpUrl + '/' + webapp + '/main/resources/help';
                }

                return undefined;
            }
        };
    };

    Common.Controllers.Desktop = new Desktop();
});
