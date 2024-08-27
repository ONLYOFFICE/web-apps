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
 * Controller wraps up interaction with desktop app
 *
 * Created on 2/16/2018.
 */

define([
    'core'
], function () {
    'use strict';

    var webapp = window.DE || window.PE || window.SSE || window.PDFE;
    var features = Object.assign({
                        version: '{{PRODUCT_VERSION}}',
                        eventloading: true,
                        titlebuttons: true,
                        uithemes: true,
                        btnhome: true,
                        quickprint: true,
                        framesize: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                    }, webapp.features);

    var native = window.desktop || window.AscDesktopEditor;
    !!native && native.execCommand('webapps:features', JSON.stringify(features));

    var Desktop = function () {
        var config = {version:'{{PRODUCT_VERSION}}'};
        var titlebuttons;
        var btnsave_icons = {
            'btn-save': 'save',
            'btn-save-coauth': 'coauth',
            'btn-synch': 'synch' };
        let recents = [];

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

                        if ( config.isFillFormApp ) {
                            $("#title-doc-name")[obj.singlewindow ? 'hide' : 'show']();
                        } else {
                            titlebuttons && titlebuttons.home && titlebuttons.home.btn.setVisible(obj.singlewindow);
                        }
                    }
                } else
                if (/editor:config/.test(cmd)) {
                    if ( param == 'request' ) {
                        var opts = {
                            user: config.user,
                            title: { buttons: [] }
                        };

                        if ( !!titlebuttons ) {
                            if ( !$.isEmptyObject(titlebuttons) ) {
                                var header = webapp.getController('Viewport').getView('Common.Views.Header');
                                if (header) {
                                    if ( native.getViewportSettings ) {
                                        const viewport = native.getViewportSettings();
                                        if ( viewport.widgetType == 'window' && titlebuttons.home )
                                            titlebuttons.home.btn.setVisible(true);
                                    }

                                    for (var i in titlebuttons) {
                                        opts.title.buttons.push(_serializeHeaderButton(i, titlebuttons[i]));
                                    }
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
                    Common.UI.Themes.setTheme(param, "native");
                } else
                if (/^uitheme:added/.test(cmd)) {
                    if ( !nativevars.localthemes )
                        nativevars.localthemes = [];

                    let json_objs;
                    try {
                        json_objs = JSON.parse(param);
                    } catch (e) {
                        console.warn('local theme is broken');
                    }

                    if ( json_objs ) {
                        if (json_objs instanceof Array) {
                            nativevars.localthemes = [].concat(nativevars.localthemes, json_objs);
                            Common.UI.Themes.addTheme({themes: json_objs});
                        } else {
                            nativevars.localthemes.push(json_objs);
                            Common.UI.Themes.addTheme(json_objs);
                        }
                    }
                } else
                if (/renderervars:changed/.test(cmd)) {
                    const opts = JSON.parse(param);

                    if ( opts.theme && opts.theme.system ) {
                        window.RendererProcessVariable.theme.system = opts.theme.system;

                        if ( Common.UI.Themes.currentThemeId() == 'theme-system' )
                            Common.UI.Themes.refreshTheme(true, 'native');
                    }
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
                        Common.NotificationCenter && Common.NotificationCenter.trigger('hints:clear');
                } else
                if (/file:print/.test(cmd)) {
                    webapp.getController('Main').onPrint();
                } else
                if (/file:saveas/.test(cmd)) {
                    webapp.getController('Main').api.asc_DownloadAs();
                } else
                if (/file:save/.test(cmd)) {
                    webapp.getController('Main').api.asc_Save();
                }
            };

            window.on_native_message('editor:config', 'request');
            if ( !!window.native_message_cmd ) {
                for ( var c in window.native_message_cmd ) {
                    if (c == 'uitheme:changed') continue;
                    window.on_native_message(c, window.native_message_cmd[c]);
                }
            }

            native.execCommand('webapps:features', JSON.stringify(features));

            window.onupdaterecents = function (params) {
                recents = _parseRecents(params);
                Common.NotificationCenter.trigger('update:recents', recents);
            }

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
                visible: config.btn.isVisible(),
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
                !!titlebuttons['print'] && (info.hints['print'] = titlebuttons['print'].btn.btnEl.attr('data-hint-title-lang'));
                !!titlebuttons['quickprint'] && (info.hints['quickprint'] = titlebuttons['quickprint'].btn.btnEl.attr('data-hint-title-lang'));
                !!titlebuttons['undo'] && (info.hints['undo'] = titlebuttons['undo'].btn.btnEl.attr('data-hint-title-lang'));
                !!titlebuttons['redo'] && (info.hints['redo'] = titlebuttons['redo'].btn.btnEl.attr('data-hint-title-lang'));
                !!titlebuttons['save'] && (info.hints['save'] = titlebuttons['save'].btn.btnEl.attr('data-hint-title-lang'));
            }

            native.execCommand('althints:show', JSON.stringify(info));
        }

        var _onKeyDown = function (e) {
            if ( Common.UI.HintManager && Common.UI.HintManager.isHintVisible() ) {
                native.execCommand('althints:keydown', JSON.stringify({code:e.keyCode}));
                console.log('hint keydown', e.keyCode);
            } else
            if ( e.keyCode == 78 /* N */ ) {
                if (config.canCreateNew && !e.shiftKey &&
                        ((Common.Utils.isWindows && e.ctrlKey && !e.metaKey) ||
                            (Common.Utils.isMac && e.metaKey && e.ctrlKey)))
                {
                    this.process('create:new');
                }
            }
        }

        const _onApplySettings = function (menu) {
            if ( !!titlebuttons.quickprint ) {
                const var_name = window.SSE ? 'sse-settings-quick-print-button' :
                                    window.PE ? 'pe-settings-quick-print-button' :
                                    window.PDFE ? 'pdfe-settings-quick-print-button' : 'de-settings-quick-print-button';
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
            !!native && native.LocalFileRecents();

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
            }

            _checkHelpAvailable.call(this);
        }

        const _onHidePreloader = function (mode) {
            features.viewmode = !window.PDFE ? !mode.isEdit : !!mode.isXpsViewer;
            features.viewmode && (features.btnhome = false);
            features.crypted = mode.isCrypted;
            native.execCommand('webapps:features', JSON.stringify(features));

            titlebuttons = {};
            if ( !features.viewmode ) {
                var header = webapp.getController('Viewport').getView('Common.Views.Header');

                {
                    let viewport;
                    if ( native.getViewportSettings ) {
                        viewport = native.getViewportSettings();
                    }

                    header.btnHome = (new Common.UI.Button({
                        cls: 'btn-header',
                        iconCls: 'toolbar__icon icon--inverse btn-home',
                        visible: viewport && viewport.widgetType == 'window',
                        hint: Common.Locale.get('hintBtnHome', {name:"Common.Controllers.Desktop", default: 'Show Main window'}),
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

                if (!!header.btnQuickAccess)
                    titlebuttons['quickaccess'] = {btn: header.btnQuickAccess};

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
                if ( config.isFillFormApp )
                    $("#title-doc-name")[native.features.singlewindow ? 'hide' : 'show']();

                // $('#box-document-title .hedset')[native.features.singlewindow ? 'hide' : 'show']();
                !!titlebuttons.home && titlebuttons.home.btn.setVisible(native.features.singlewindow);
            }
        }

        const _parseRecents = function (rawarray) {
            let _files_arr = [];

            const _is_win = /Win/.test(navigator.platform);
            const _re_name = !_is_win ? /([^/]+\.[a-zA-Z0-9]{1,})$/ : /([^\\/]+\.[a-zA-Z0-9]{1,})$/;
            for ( let i in rawarray ) {
                const _f_ = rawarray[i];
                if ( utils.matchFileFormat( _f_.type ) ) {
                    if (_re_name.test(_f_.path)) {
                        const name = _re_name.exec(_f_.path)[1],
                            dir = _f_.path.slice(0, _f_.path.length - name.length - 1);

                        _files_arr.push({
                            fileid: _f_.id,
                            type: _f_.type,
                            format: utils.parseFileFormat(_f_.type),
                            title: name,
                            url: _f_.path,
                            folder: dir,
                        });
                    }
                }
            }

            return _files_arr;
        }

        const _onOpenRecent = function (menu, url, record) {
            console.log('open recent');
        }

        const _onChangeQuickAccess = function (props) {
            native.execCommand("quickaccess:changed", JSON.stringify(props));
        }

        const _extend_menu_file = function (args) {
            console.log('extend menu file')

            // if ( native.features.opentemplate )
            {
                const filemenu = webapp.getController('LeftMenu').leftMenu.getMenu('file');
                if ( filemenu.miNew.visible ) {
                    const miNewFromTemplate = new Common.UI.MenuItem({
                        el: $('<li id="fm-btn-create-fromtpl" class="fm-btn"></li>'),
                        action: 'create:fromtemplate',
                        caption: _tr('itemCreateFromTemplate', 'Create from template'),
                        canFocused: false,
                        dataHint: 1,
                        dataHintDirection: 'left-top',
                        dataHintOffset: [2, 14],
                    });

                    miNewFromTemplate.$el.insertAfter(filemenu.miNew.$el);
                    filemenu.items.push(miNewFromTemplate);
                }
            }
        }

        const _tr = function (id, defvalue) {
            return Common.Locale.get(id, {name:"Common.Controllers.Desktop", default: defvalue});
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
                        'uitheme:changed' : function (name, caller) {
                            if ( caller != 'native' ) {
                                if (window.uitheme.is_theme_system()) {
                                    native.execCommand("uitheme:changed", JSON.stringify({name: 'theme-system'}));
                                } else {
                                    var theme = Common.UI.Themes.get(name);
                                    if (theme)
                                        native.execCommand("uitheme:changed", JSON.stringify({
                                            name: name,
                                            type: theme.type
                                        }));
                                }
                            }
                        },
                        'hints:show': _onHintsShow.bind(this),
                        'quickaccess:changed': _onChangeQuickAccess.bind(this),
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
                                } else
                                if ( action == 'create:fromtemplate' ) {
                                    native.execCommand('create:new', 'template:' + (!!window.SSE ? 'cell' : !!window.PE ? 'slide' : !!window.PDFE ? 'form' :
                                                            window.PDFE || config.isPDFForm ? 'form' : 'word'));
                                    menu.hide();
                                }
                            },
                            'settings:apply': _onApplySettings.bind(this),
                            'recent:open': _onOpenRecent.bind(this),
                            'render:after': _extend_menu_file,
                        },
                    }, {id: 'desktop'});

                    $(document).on('keydown', _onKeyDown.bind(this));

                    if ( features.uitype == 'fillform' ) {
                        config.isFillFormApp = true;
                        $('#header-logo, .brand-logo').hide();
                    }
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
                            native.execCommand("create:new", !!window.SSE ? 'cell' : !!window.PE ? 'slide' :
                                                    window.PDFE || config.isPDFForm ? 'form' : 'word');
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
                if ( config.isFillFormApp )
                    return webapp.getController('ApplicationController').appOptions.isOffline;
                return webapp.getController('Main').appOptions.isOffline;
            },
            isFeatureAvailable: function (feature) {
                return !!native && !!native[feature];
            },
            isWinXp: function () {
                return nativevars && nativevars.os === 'winxp';
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
                                    window.PE ? 'presentationeditor' :
                                        window.PDFE ? 'pdfeditor' : 'documenteditor';
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
            systemThemeSupported: function () {
                return nativevars.theme && nativevars.theme.system !== 'disabled';
            },

            localThemes: function () {
                return nativevars ? nativevars.localthemes : undefined;
            },
            recentFiles: function () {
                return recents;
            },
            openRecent: function (model) {
                if ( this.isActive() ) {
                    const params = {
                        name: Common.Utils.String.htmlDecode(model.get('title')),
                        path: Common.Utils.String.htmlDecode(model.get('url')),
                    };
                    if ( model.get('fileid') != undefined && model.get('fileid') != null ) {
                        params.id = model.get('fileid');
                        params.type = model.type;
                    } else {
                        params.id = -1;
                    }

                    native.execCommand("open:recent", JSON.stringify(params));
                    return true;
                }

                return false;
            },
            uiRtlSupported: function () {
                return nativevars && nativevars.rtl != undefined;
            },
        };
    };

    !Common.Controllers && (Common.Controllers = {});
    Common.Controllers.Desktop = new Desktop();

    const FILE_DOCUMENT = 0x0040,
        FILE_PRESENTATION = 0x0080,
        FILE_SPREADSHEET = 0x0100,
        FILE_CROSSPLATFORM = 0x0200;

    const utils = {};
    utils.defines = {}
    utils.defines.FileFormat = {
        FILE_UNKNOWN:       0x0000,

        FILE_DOCUMENT:      FILE_DOCUMENT,
        FILE_DOCUMENT_DOCX: FILE_DOCUMENT + 0x0001,
        FILE_DOCUMENT_DOC:  FILE_DOCUMENT + 0x0002,
        FILE_DOCUMENT_ODT:  FILE_DOCUMENT + 0x0003,
        FILE_DOCUMENT_RTF:  FILE_DOCUMENT + 0x0004,
        FILE_DOCUMENT_TXT:  FILE_DOCUMENT + 0x0005,
        FILE_DOCUMENT_HTML: FILE_DOCUMENT + 0x0006,
        FILE_DOCUMENT_MHT:  FILE_DOCUMENT + 0x0007,
        FILE_DOCUMENT_EPUB: FILE_DOCUMENT + 0x0008,
        FILE_DOCUMENT_FB2:  FILE_DOCUMENT + 0x0009,
        FILE_DOCUMENT_MOBI: FILE_DOCUMENT + 0x000a,
        FILE_DOCUMENT_DOCM: FILE_DOCUMENT + 0x000b,
        FILE_DOCUMENT_DOTX: FILE_DOCUMENT + 0x000c,
        FILE_DOCUMENT_DOTM: FILE_DOCUMENT + 0x000d,
        FILE_DOCUMENT_ODT_FLAT: FILE_DOCUMENT + 0x000e,
        FILE_DOCUMENT_OTT:  FILE_DOCUMENT + 0x000f,
        FILE_DOCUMENT_DOC_FLAT: FILE_DOCUMENT + 0x0010,
        FILE_DOCUMENT_OFORM: FILE_DOCUMENT + 0x0015,
        FILE_DOCUMENT_DOCXF: FILE_DOCUMENT + 0x0016,
        FILE_DOCUMENT_OFORM_PDF: FILE_DOCUMENT + 0x0017,
        FILE_DOCUMENT_XML: FILE_DOCUMENT + 0x0030,

        FILE_PRESENTATION:      FILE_PRESENTATION,
        FILE_PRESENTATION_PPTX: FILE_PRESENTATION + 0x0001,
        FILE_PRESENTATION_PPT:  FILE_PRESENTATION + 0x0002,
        FILE_PRESENTATION_ODP:  FILE_PRESENTATION + 0x0003,
        FILE_PRESENTATION_PPSX: FILE_PRESENTATION + 0x0004,
        FILE_PRESENTATION_PPTM: FILE_PRESENTATION + 0x0005,
        FILE_PRESENTATION_PPSM: FILE_PRESENTATION + 0x0006,
        FILE_PRESENTATION_POTX: FILE_PRESENTATION + 0x0007,
        FILE_PRESENTATION_POTM: FILE_PRESENTATION + 0x0008,
        FILE_PRESENTATION_ODP_FLAT: FILE_PRESENTATION + 0x0009,
        FILE_PRESENTATION_OTP:  FILE_PRESENTATION + 0x000a,

        FILE_SPREADSHEET:       FILE_SPREADSHEET,
        FILE_SPREADSHEET_XLSX:  FILE_SPREADSHEET + 0x0001,
        FILE_SPREADSHEET_XLS:   FILE_SPREADSHEET + 0x0002,
        FILE_SPREADSHEET_ODS:   FILE_SPREADSHEET + 0x0003,
        FILE_SPREADSHEET_CSV:   FILE_SPREADSHEET + 0x0004,
        FILE_SPREADSHEET_XLSM:  FILE_SPREADSHEET + 0x0005,
        FILE_SPREADSHEET_XLTX:  FILE_SPREADSHEET + 0x0006,
        FILE_SPREADSHEET_XLTM:  FILE_SPREADSHEET + 0x0007,
        FILE_SPREADSHEET_XLSB:  FILE_SPREADSHEET + 0x0008,
        FILE_SPREADSHEET_ODS_FLAT: FILE_SPREADSHEET + 0x0009,
        FILE_SPREADSHEET_OTS:   FILE_SPREADSHEET + 0x000a,

        FILE_CROSSPLATFORM:     FILE_CROSSPLATFORM,
        FILE_CROSSPLATFORM_PDF: FILE_CROSSPLATFORM + 0x0001,
        FILE_CROSSPLATFORM_SWF: FILE_CROSSPLATFORM + 0x0002,
        FILE_CROSSPLATFORM_DJVU: FILE_CROSSPLATFORM + 0x0003,
        FILE_CROSSPLATFORM_XPS: FILE_CROSSPLATFORM + 0x0004,
        FILE_CROSSPLATFORM_PDFA: FILE_CROSSPLATFORM + 0x0009
    };

    utils.parseFileFormat = function(format) {
        switch (format) {
            case utils.defines.FileFormat.FILE_DOCUMENT_DOC:        return 'doc';
            case utils.defines.FileFormat.FILE_DOCUMENT_DOCX:       return 'docx';
            case utils.defines.FileFormat.FILE_DOCUMENT_ODT:        return 'odt';
            case utils.defines.FileFormat.FILE_DOCUMENT_RTF:        return 'rtf';
            case utils.defines.FileFormat.FILE_DOCUMENT_TXT:        return 'txt';
            case utils.defines.FileFormat.FILE_DOCUMENT_HTML:       return 'html';
            case utils.defines.FileFormat.FILE_DOCUMENT_MHT:        return 'mht';
            case utils.defines.FileFormat.FILE_DOCUMENT_EPUB:       return 'epub';
            case utils.defines.FileFormat.FILE_DOCUMENT_FB2:        return 'fb2';
            case utils.defines.FileFormat.FILE_DOCUMENT_DOCM:       return 'docm';
            case utils.defines.FileFormat.FILE_DOCUMENT_DOTX:       return 'dotx';
            case utils.defines.FileFormat.FILE_DOCUMENT_OTT:        return 'ott';
            case utils.defines.FileFormat.FILE_DOCUMENT_OFORM:      return 'oform';
            case utils.defines.FileFormat.FILE_DOCUMENT_OFORM_PDF:  return 'pdf';
            case utils.defines.FileFormat.FILE_DOCUMENT_DOCXF:      return 'docxf';
            case utils.defines.FileFormat.FILE_DOCUMENT_ODT_FLAT:   return 'fodt';
            case utils.defines.FileFormat.FILE_DOCUMENT_DOTM:       return 'dotm';
            case utils.defines.FileFormat.FILE_DOCUMENT_XML:       return 'xml';

            case utils.defines.FileFormat.FILE_SPREADSHEET_XLS:     return 'xls';
            case utils.defines.FileFormat.FILE_SPREADSHEET_XLTX:    return 'xltx';
            case utils.defines.FileFormat.FILE_SPREADSHEET_XLSX:    return 'xlsx';
            case utils.defines.FileFormat.FILE_SPREADSHEET_XLSB:    return 'xlsb';
            case utils.defines.FileFormat.FILE_SPREADSHEET_ODS:     return 'ods';
            case utils.defines.FileFormat.FILE_SPREADSHEET_CSV:     return 'csv';
            case utils.defines.FileFormat.FILE_SPREADSHEET_OTS:     return 'ots';
            case utils.defines.FileFormat.FILE_SPREADSHEET_XLTM:    return 'xltm';
            case utils.defines.FileFormat.FILE_SPREADSHEET_XLSM:    return 'xlsm';
            case utils.defines.FileFormat.FILE_SPREADSHEET_ODS_FLAT:return 'fods';

            case utils.defines.FileFormat.FILE_PRESENTATION_PPT:    return 'ppt';
            case utils.defines.FileFormat.FILE_PRESENTATION_POTX:   return 'potx';
            case utils.defines.FileFormat.FILE_PRESENTATION_PPTX:   return 'pptx';
            case utils.defines.FileFormat.FILE_PRESENTATION_ODP:    return 'odp';
            case utils.defines.FileFormat.FILE_PRESENTATION_PPSX:   return 'ppsx';
            case utils.defines.FileFormat.FILE_PRESENTATION_OTP:    return 'otp';
            case utils.defines.FileFormat.FILE_PRESENTATION_PPTM:   return 'pptm';
            case utils.defines.FileFormat.FILE_PRESENTATION_PPSM:   return 'ppsm';
            case utils.defines.FileFormat.FILE_PRESENTATION_POTM:   return 'potm';
            case utils.defines.FileFormat.FILE_PRESENTATION_ODP_FLAT: return 'fodp';

            case utils.defines.FileFormat.FILE_CROSSPLATFORM_PDFA:
            case utils.defines.FileFormat.FILE_CROSSPLATFORM_PDF:   return 'pdf';
            case utils.defines.FileFormat.FILE_CROSSPLATFORM_DJVU:  return 'djvu';
            case utils.defines.FileFormat.FILE_CROSSPLATFORM_XPS:   return 'xps';
        }

        return '';
    };

    utils.matchFileFormat = function (t) {
        if ( window.PE ) {
            return t > utils.defines.FileFormat.FILE_PRESENTATION &&
                !(t > utils.defines.FileFormat.FILE_SPREADSHEET );
        } else
        if ( window.DE ) {
            return (t > utils.defines.FileFormat.FILE_DOCUMENT &&
                    !(t > utils.defines.FileFormat.FILE_PRESENTATION)) ||
                    t == utils.defines.FileFormat.FILE_CROSSPLATFORM_PDF ||
                    t == utils.defines.FileFormat.FILE_CROSSPLATFORM_PDFA ||
                    t == utils.defines.FileFormat.FILE_CROSSPLATFORM_DJVU;
        } else
        if ( window.SSE ) {
            return (t > utils.defines.FileFormat.FILE_SPREADSHEET &&
                    !(t > utils.defines.FileFormat.FILE_CROSSPLATFORM)) ||
                t == utils.defines.FileFormat.FILE_CROSSPLATFORM_XPS;
        } else
        if ( window.PDFE ) {
            return t == utils.defines.FileFormat.FILE_CROSSPLATFORM_PDFA ||
                    t == utils.defines.FileFormat.FILE_CROSSPLATFORM_PDF ||
                    t == utils.defines.FileFormat.FILE_CROSSPLATFORM_DJVU ||
                    t ==  utils.defines.FileFormat.FILE_CROSSPLATFORM_XPS;
        }

        return false;
    }
});
