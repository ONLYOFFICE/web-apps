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
 *  MacrosDialog.js
 *
 *  Created on 04.10.2024
 *
 */

if (Common === undefined)
    var Common = {};

define([], function () {
    'use strict';
    Common.Views.MacrosDialog = Common.UI.Window.extend(_.extend({
        template:
            '<div class="content invisible">' +
                '<div class="common_menu noselect">' +
                    '<div id="menu_macros" class="menu_macros_long" <% if(!isFunctionsSupport){%> style="height: 100%;" <% } %>>' +
                        '<div class="menu_header">' +
                            '<label class="i18n header">Macros</label>' +
                            '<div class="div_buttons">' +
                                '<div id="btn-macros-run"></div>' +
                                '<div id="btn-macros-add"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div id="list-macros"></div>' +
                    '</div>' +
                    '<div class="separator horizontal" <% if(!isFunctionsSupport){%> style="display: none;" <% } %> ></div>' +
                    '<div id="menu_functions" <% if(!isFunctionsSupport){%> style="display: none;" <% } %> >' +
                        '<div class="menu_header">' +
                            '<label class="i18n header">Custom Functions</label>' +
                            '<div id="btn-function-add"></div>' +
                        '</div>' +
                        '<div id="list-functions"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="separator vertical" style="position: relative"></div>' +
                '<div id="code-editor"></div>' +
            '</div>'+
            '<div class="separator horizontal" style="position: relative"></div>',


        initialize : function(options) {
            var _options = {};
            _.extend(_options, {
                id: 'macros-dialog',
                title: this.textTitle,
                header: true,
                help: true,
                width: 800,
                height: 600,
                minwidth: 800,
                minheight: 512,
                resizable: true,
                cls: 'modal-dlg invisible-borders',
                buttons: [{
                    value: 'ok',
                    caption: this.textSave
                }, 'cancel']
            }, options || {});
            this.api = options.api;

            this.CurrentElementModeType = {
                CustomFunction  : 0,
                Macros 			: 1
            };
            this._state = {
                aceLoadedModules: {
                    tern: false,
                    langTools: window.isIE,
                    htmlBeautify: false,
                },
                initCounter: 0,
                isFunctionsSupport: !!window.SSE,
                macrosItemMenuOpen: null,
                functionItemMenuOpen: null,
                isDisable: false,
                currentElementMode: this.CurrentElementModeType.Macros
            };

            _options.tpl = _.template(this.template)({
                isFunctionsSupport: this._state.isFunctionsSupport,
            });

            this.on('help', this.onHelp);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));


            this.loadMask = new Common.UI.LoadMask({owner: this.$window.find('.body')[0]});
            this.loadMask.setTitle(this.textLoading);
            this.loadMask.show();
            require(['../vendor/ace/ace'], function(ace) {
                require(['../vendor/ace/ext-language_tools'], function() {
                    me.createCodeEditor();
                });
            });
        },

        onAceLoadModule: function() {
            if( _.values(this._state.aceLoadedModules).every(function(val) { return val })) {
                this.renderAfterAceLoaded();
                this.loadMask.hide();
                this.$window.find('.content').removeClass('invisible');
            }
        },

        renderAfterAceLoaded: function() {
            this.btnMacrosRun = new Common.UI.Button({
                parentEl: $('#btn-macros-run'),
                cls: 'btn-toolbar borders--small',
                iconCls: 'icon toolbar__icon btn-zoomdown',
                hint: this.tipMacrosRun,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });
            this.btnMacrosAdd = new Common.UI.Button({
                parentEl: $('#btn-macros-add'),
                cls: 'btn-toolbar borders--small',
                iconCls: 'icon toolbar__icon btn-zoomup',
                hint: this.tipMacrosAdd,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            }).on('click', _.bind(this.onCreateMacros, this));

            this.listMacros = new Common.UI.ListView({
                el: $('#list-macros', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                itemTemplate: _.template([
                    '<div class="listitem-autostart">',
                        '<% if (autostart) { %>',
                            '<span>(A)</span>',
                        '<% } %>',
                    '</div>',
                    '<div id="<%= id %>" class="list-item" role="listitem"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div class="listitem-icon toolbar__icon btn-more-vertical"></div>'
                ].join(''))
            });
            this.listMacros.on('item:add',  _.bind(this.onAddListItem, this));
            this.listMacros.on('item:click', _.bind(this.onClickListMacrosItem, this));
            this.listMacros.on('item:contextmenu', _.bind(this.onContextMenuListMacrosItem, this));
            this.listMacros.on('item:select', _.bind(this.onSelectListMacrosItem, this));
            this.setListMacros();

            this.ctxMenuMacros = new Common.UI.Menu({
                cls: 'shifted-right',
                items: [
                    new Common.UI.MenuItem({
                        caption     : this.textRun,
                        checkable   : false
                    }).on('click', _.bind(this.onRunMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textMakeAutostart,
                        checkable   : false
                    }).on('click', _.bind(this.onMakeAutostartMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textUnMakeAutostart,
                        checkable   : false
                    }).on('click', _.bind(this.onUnMakeAutostartMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textRename,
                        checkable   : false
                    }).on('click', _.bind(this.onRenameMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textDelete,
                        checkable   : false
                    }).on('click', _.bind(this.onDeleteMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textCopy,
                        checkable   : false
                    }).on('click', _.bind(this.onCopyMacros, this)),
                ]
            });

            if(this._state.isFunctionsSupport) {
                this.btnFunctionAdd = new Common.UI.Button({
                    parentEl: $('#btn-function-add'),
                    cls: 'btn-toolbar borders--small',
                    iconCls: 'icon toolbar__icon btn-zoomup',
                    hint: this.tipFunctionAdd,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                }).on('click', _.bind(this.onCreateFunction, this));

                this.listFunctions = new Common.UI.ListView({
                    el: $('#list-functions', this.$window),
                    store: new Common.UI.DataViewStore(),
                    tabindex: 1,
                    cls: 'dbl-clickable',
                    itemTemplate: _.template([
                        '<div class="listitem-autostart"></div>',
                        '<div id="<%= id %>" class="list-item" role="listitem"><%= Common.Utils.String.htmlEncode(name) %></div>',
                        '<div class="listitem-icon toolbar__icon btn-more-vertical"></div>'
                    ].join(''))
                });
                this.listFunctions.on('item:add',  _.bind(this.onAddListItem, this));
                this.listFunctions.on('item:click', _.bind(this.onClickListFunctionItem, this));
                this.listFunctions.on('item:contextmenu', _.bind(this.onContextMenuListFunctionItem, this));
                this.listFunctions.on('item:select', _.bind(this.onSelectListFunctionItem, this));
                this.setListFunctions();

                this.ctxMenuFunction = new Common.UI.Menu({
                    cls: 'shifted-right',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : this.textRename,
                            checkable   : false
                        }).on('click', _.bind(this.onRenameFunction, this)),
                        new Common.UI.MenuItem({
                            caption     : this.textDelete,
                            checkable   : false
                        }).on('click', _.bind(this.onDeleteFunction, this)),
                        new Common.UI.MenuItem({
                            caption     : this.textCopy,
                            checkable   : false
                        }).on('click', _.bind(this.onCopyFunction, this)),
                    ]
                });
            }

            this.makeDragable();
        },

        createCodeEditor: function() {
            var me = this;
            function onInitServer(type){
                if (type === (me._state.initCounter & type))
                    return;
                me._state.initCounter |= type;
                if (me._state.initCounter === 3) {
                    var nameDocEditor = 'word';
                    if(!!window.SSE) nameDocEditor = 'cell';
                    else if(!!window.PE) nameDocEditor = 'slide';
                    loadLibrary("onlyoffice", "../../../vendor/ace/libs/" + nameDocEditor + "/api.js");
                }
            }

            function loadLibrary(name, url) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.onreadystatechange = function()
                {
                    if (xhr.readyState == 4)
                    {
                        var EditSession = ace.require("ace/edit_session").EditSession;
                        var editDoc = new EditSession(xhr.responseText, "ace/mode/javascript");
                        me.codeEditor.ternServer.addDoc(name, editDoc);
                    }
                };
                xhr.send();
            }

            this.codeEditor = ace.edit("code-editor");
            this.codeEditor.session.setMode("ace/mode/javascript");
            this.codeEditor.container.style.lineHeight = "20px";
            this.codeEditor.setValue("");

            this.codeEditor.getSession().setUseWrapMode(true);
            this.codeEditor.getSession().setWrapLimitRange(null, null);
            this.codeEditor.setShowPrintMargin(false);
            this.codeEditor.$blockScrolling = Infinity;
            this.codeEditor.setTheme(Common.UI.Themes.isDarkTheme() ? "ace/theme/vs-dark" : "ace/theme/vs-light");

            onInitServer(2);

            ace.config.loadModule('ace/ext/tern', function () {
                me._state.aceLoadedModules.tern = true;
                me.onAceLoadModule();
                me.codeEditor.setOptions({
                    enableTern: {
                        defs: ['browser', 'ecma5'],
                        plugins: { doc_comment: { fullDocs: true } },
                        useWorker: !!window.Worker,
                        switchToDoc: function (name, start) {},
                        startedCb: function () {
                            onInitServer(1);
                        },
                    },
                    enableSnippets: false,
                    tooltipContainer: '#code-editor'
                });
            });


            if (!window.isIE) {
                ace.config.loadModule('ace/ext/language_tools', function () {
                    me._state.aceLoadedModules.langTools = true;
                    me.onAceLoadModule();
                    me.codeEditor.setOptions({
                        enableBasicAutocompletion: false,
                        enableLiveAutocompletion: true
                    });
                });
            }

            ace.config.loadModule('ace/ext/html_beautify', function (beautify) {
                me._state.aceLoadedModules.htmlBeautify = true;
                me.onAceLoadModule();
                me.codeEditor.setOptions({
                    autoBeautify: true,
                    htmlBeautify: true,
                });
                window.beautifyOptions = beautify.options;
            });

            this.codeEditor.getSession().on('change', function() {
                var selectedItem = me._state.currentElementMode === me.CurrentElementModeType.Macros
                    ? me.listMacros.getSelectedRec()
                    : me.listFunctions.getSelectedRec();
                if(!selectedItem || me._state.isDisable) {
                    return;
                }
                selectedItem.set('value', me.codeEditor.getValue());
            });
        },

        setListMacros: function() {
            var me = this;
            var data = this.parseDataFromApi(this.api.pluginMethod_GetMacros());
            var macrosList = data.macrosArray;

            var dataVBA = this.api.pluginMethod_GetVBAMacros();
            if (dataVBA && typeof dataVBA === 'string' && dataVBA.includes('<Module')) {
                var arr = dataVBA.split('<Module ').filter(function(el){return el.includes('Type="Procedural"') || el.includes('Type="Class"')});
                arr.forEach(function(el) {
                    var start = el.indexOf('<SourceCode>') + 12;
                    var end = el.indexOf('</SourceCode>', start);
                    var macros = el.slice(start, end);

                    start = el.indexOf('Name="') + 6;
                    end = el.indexOf('"', start);
                    var name = el.slice(start, end);
                    var index = macrosList.findIndex(function(macr){return macr.name == name});
                    if (index == -1) {
                        macros = macros.replace(/&amp;/g,'&');
                        macros = macros.replace(/&lt;/g,'<');
                        macros = macros.replace(/&gt;/g,'>');
                        macros = macros.replace(/&apos;/g,'\'');
                        macros = macros.replace(/&quot;/g,'"');
                        macros = macros.replace(/Attribute [^\r\n]*\r\n/g, "");
                        macrosList.push({
                            guid: me.createGuid(),
                            name: name,
                            autostart: false,
                            value: '(function()\n{\n\t/* Enter your code here. */\n})();\n\n/*\nExecution of VBA commands does not support.\n' + macros + '*/',
                        });
                    }
                });
            }

            if(macrosList.length > 0) {
                macrosList.forEach(function (macros) {
                    macros.autostart = !!macros.autostart;
                });
                this.listMacros.store.reset(macrosList);
                var selectItem = this.listMacros.store.at(data.current);
                selectItem && this.listMacros.selectRecord(selectItem);
            } else {
                this.onCreateMacros();
            }
        },
        setListFunctions: function() {
            var data = this.parseDataFromApi(this.api.pluginMethod_GetCustomFunctions());
            var macrosList = data.macrosArray;
            this.listFunctions.store.reset(macrosList);
        },
        openContextMenu:  function(elementMode, item, event) {
            var itemMenuOpen, ctxMenu, modeName;
            if(elementMode === this.CurrentElementModeType.Macros) {
                itemMenuOpen = this._state.macrosItemMenuOpen;
                ctxMenu = this.ctxMenuMacros;
                modeName = 'macros';
            } else if(elementMode === this.CurrentElementModeType.CustomFunction){
                itemMenuOpen = this._state.functionItemMenuOpen;
                ctxMenu = this.ctxMenuFunction;
                modeName = 'functions';
            } else {
                return false;
            }

            if (itemMenuOpen === item && ctxMenu.isVisible()) {
                ctxMenu.hide();
                return false;
            }

            var currentTarget = $(event.currentTarget),
                parent = elementMode === this.CurrentElementModeType.Macros ? $('#menu_macros') : $('#menu_functions'),
                containerId = 'macros-dialog-ctx-' + modeName + '-container',
                menuContainer = parent.find('#' + containerId);

            if (!ctxMenu.rendered) {
                if (menuContainer.length < 1) {
                    menuContainer = $('<div id="'+ containerId+ '" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', ctxMenu.id);
                    parent.append(menuContainer);
                }
                ctxMenu.render(menuContainer);
                ctxMenu.cmpEl.attr({tabindex: "-1"});

                ctxMenu.on('show:after', function(cmp) {
                    if (cmp && cmp.menuAlignEl)
                        cmp.menuAlignEl.toggleClass('over', true);
                }).on('hide:after', function(cmp) {
                    if (cmp && cmp.menuAlignEl)
                        cmp.menuAlignEl.toggleClass('over', false);
                });
            }

            var menuContainerRect = menuContainer[0].getBoundingClientRect();

            ctxMenu.menuAlignEl = currentTarget;
            ctxMenu.setOffset(event.clientX - menuContainerRect.x, -currentTarget.height()/2 - 3);
            ctxMenu.show();
            _.delay(function() {
                ctxMenu.cmpEl.focus();
            }, 10);
            event.stopPropagation();
            event.preventDefault();

            return true;
        },
        openContextMenuMacros: function(macrosItem, event) {
            var isOpen = this.openContextMenu(this.CurrentElementModeType.Macros, macrosItem, event);
            if(isOpen) {
                this._state.macrosItemMenuOpen = macrosItem;
                if(macrosItem.get('autostart')) {
                    this.ctxMenuMacros.items[1].setVisible(false);
                    this.ctxMenuMacros.items[2].setVisible(true);
                } else {
                    this.ctxMenuMacros.items[1].setVisible(true);
                    this.ctxMenuMacros.items[2].setVisible(false);
                }
            }
        },
        openContextMenuFunction: function(functionItem, event) {
            var isOpen = this.openContextMenu(this.CurrentElementModeType.CustomFunction, functionItem, event);
            if(isOpen) {
                this._state.functionItemMenuOpen = functionItem;
            }
        },
        openWindowRename: function() {
            var windowSize = {
                width: 300,
                height: 90
            };
            var windowRenameTpl =
                '<div class="box" style="height: 22px">' +
                    '<div id="macros-rename-field"></div>' +
                '</div>';

            var window = new Common.UI.Window({
                id: 'macros-rename-dialog',
                header: false,
                width: windowSize.width,
                height: windowSize.height,
                cls: 'modal-dlg',
                tpl: windowRenameTpl,
                buttons: ['ok', 'cancel']
            }).on('render:after', _.bind(onRender, this));

            var macrosWindowRect = this.$window[0].getBoundingClientRect();
            window.show(
                macrosWindowRect.left + (macrosWindowRect.width - windowSize.width) / 2,
                macrosWindowRect.top + (macrosWindowRect.height - windowSize.height) / 2
            );

            function onRender(windowView) {
                function inputValidation(value) {
                    return value.trim().length > 0;
                }

                var me = this;
                var selectedItem = me._state.currentElementMode === me.CurrentElementModeType.Macros
                    ? me.listMacros.getSelectedRec()
                    : me.listFunctions.getSelectedRec();
                var input = new Common.UI.InputField({
                    el: $('#macros-rename-field'),
                    allowBlank: true,
                    validation: inputValidation,
                    validateOnBlur: false,
                    style: 'width: 100%;',
                    type: 'text',
                    value: selectedItem.get('name'),
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                input.$el.find('input').select();

                var buttons = $(windowView.$window[0]).find('.btn');
                buttons.on('click', function (e){
                    var type = $(e.target).attr('result');
                    if(type == 'ok') {
                        if(input.checkValidate() === true) {
                            if(selectedItem) {
                                selectedItem.set('name', input.getValue().trim());
                            }
                            windowView.close();
                        }
                    } else {
                        windowView.close();
                    }
                });
            };
        },

        makeDragable: function() {
            var me = this;
            var currentElement;
            var currentIndex = 0;
            var insertIndex;
            var macrosList = document.getElementById("list-macros");
            var functionList = document.getElementById("menu_functions");

            function getInsertIndex(cursorPosition, currentElement, elements) {
                // cursorPosition = cursorPosition * ((1 + (1 - zoom)).toFixed(1));
                var currentIndex = elements.index(currentElement);
                var nextIndex = currentIndex;
                var currentElementCoord = currentElement.getBoundingClientRect();
                var currentElementCenter = currentElementCoord.y + currentElementCoord.height * 0.45;
                if(cursorPosition > currentElementCenter) {
                    nextIndex += 1;
                }
                return nextIndex
            }

            function handleDragstart(list, e) {
                var id = $(e.target).children('.list-item').attr('id');
                e.dataTransfer.setData("text/plain", id);
                e.dataTransfer.effectAllowed = "move";
                e.target.classList.add('dragged');
                currentIndex = list.store.indexOf(list.store.findWhere({ id: id }));
                e.target.click();
            }

            function handleDragend(list, e) {
                e.target.classList.remove('dragged');
                $('.dragHovered').removeClass("dragHovered");

                if (currentIndex === insertIndex || insertIndex == null) return;

                if (insertIndex === -1) insertIndex = list.store.length;
                if (currentIndex < insertIndex) insertIndex--;

                var newStoreArr = list.store.models.slice();
                let tmp = newStoreArr.splice(currentIndex, 1)[0];
                newStoreArr.splice(insertIndex, 0, tmp);

                list.store.reset(newStoreArr);
                currentIndex = 0;
            }

            function handleDragover(list, elementModeType, e) {
                e.preventDefault();
                currentElement = e.target;
                let bDragAllowed = me._state.currentElementMode === elementModeType;
                e.dataTransfer.dropEffect = bDragAllowed ? "move" : "none";
                const isMoveable = currentElement.classList.contains('draggable');
                if (!isMoveable || !bDragAllowed)
                    return;

                insertIndex = getInsertIndex(e.clientY, currentElement, $(list).find('.item'));
                $('.dragHovered').removeClass("dragHovered")
                if(insertIndex < $(list).find('.item').length) {
                    $(list).find('.item').last().removeClass(['dragHovered', 'last']);
                    $(list).find('.item')[insertIndex].classList.add('dragHovered');
                } else {
                    $(list).find('.item').last().addClass(['dragHovered', 'last']);
                }
            }

            function handleDragleave(e) {
                if(e.fromElement) {
                    if($(e.fromElement).attr('role') == 'list'
                        || $(e.fromElement).attr('role') == 'listitem'
                        || !!$(e.fromElement).parents('[role="listitem"]').length
                    ) return;

                    $('.dragHovered').removeClass("dragHovered");
                    insertIndex = null;
                }
            }


            macrosList.addEventListener('dragstart', function(e) {
                handleDragstart(me.listMacros, e);
            });
            functionList.addEventListener('dragstart', function(e) {
                handleDragstart(me.listFunctions, e);
            });

            macrosList.addEventListener('dragend', function(e) {
                handleDragend(me.listMacros, e);
            });
            functionList.addEventListener('dragend', function(e) {
                handleDragend(me.listFunctions, e);
            });

            macrosList.addEventListener('dragover', function(e) {
                handleDragover(macrosList, me.CurrentElementModeType.Macros, e)
            });
            functionList.addEventListener('dragover', function(e) {
                handleDragover(functionList, me.CurrentElementModeType.CustomFunction, e)
            });

            macrosList.addEventListener('dragleave', function(e) {
                handleDragleave(e);
            });
            functionList.addEventListener('dragleave', function(e) {
                handleDragleave(e);
            });
        },

        parseDataFromApi: function(data) {
            var result = {
                macrosArray : [],
                current : -1
            };
            if (data) {
                try {
                    result = JSON.parse(data);
                } catch (err) {
                    result = {
                        macrosArray: [],
                        current: -1
                    };
                }
            }
            return result;
        },
        createGuid: function(a,b){
            for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');
            return b
        },

        getFocusedComponents: function() {
            return [].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {

        },

        close: function(suppressevent) {
            var $window = this.getChild();
            if (!$window.find('.combobox.open').length) {
                Common.UI.Window.prototype.close.call(this, arguments);
            }
        },
        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }

            if(state === 'ok') {
                this.api.pluginMethod_SetMacros(JSON.stringify({
                    macrosArray: this.listMacros.store.models.map(function(item) {
                        return {
                            guid: item.get('guid'),
                            name: item.get('name'),
                            autostart: item.get('autostart'),
                            value: item.get('value')
                        }
                    }),
                    current: this.listMacros.store.indexOf(this.listMacros.getSelectedRec())
                }));
                if(this._state.isFunctionsSupport) {
                    this.api.pluginMethod_SetCustomFunctions(JSON.stringify({
                        macrosArray: this.listFunctions.store.models.map(function(item) {
                            return {
                                guid: item.get('guid'),
                                name: item.get('name'),
                                value: item.get('value')
                            }
                        })
                    }));
                }
            }

            this.close();
        },

        onAddListItem: function(listView, itemView) {
            itemView.$el.attr('draggable', true);
            itemView.$el.addClass('draggable');
        },
        onCreateMacros: function() {
            var indexMax = 0;
            var macrosTextEn = 'Macros';
            var macrosTextTranslate = this.textMacros;
            this.listMacros.store.each(function(macros, index) {
                var macrosName = macros.get('name');
                if (0 == macrosName.indexOf(macrosTextEn))
                {
                    var index = parseInt(macrosName.substr(macrosTextEn.length));
                    if (!isNaN(index) && (indexMax < index))
                        indexMax = index;
                }
                else if (0 == macrosName.indexOf(macrosTextTranslate))
                {
                    var index = parseInt(macrosName.substr(macrosTextTranslate.length));
                    if (!isNaN(index) && (indexMax < index))
                        indexMax = index;
                }
            });
            indexMax++;
            this.listMacros.store.add({
                guid: this.createGuid(),
                name : (macrosTextTranslate + " " + indexMax),
                value : "(function()\n{\n})();",
                autostart: false
            });
            this.listMacros.selectRecord(this.listMacros.store.at(-1));
        },
        onClickListMacrosItem: function(listView, itemView, record) {
            var event = window.event ? window.event : window._event;
            if(!event) return;

            var btn = $(event.target);
            if (btn && btn.hasClass('listitem-icon')) {
                this.openContextMenuMacros(record, event);
            }
        },
        onContextMenuListMacrosItem: function(listView, itemView, record, event) {
            var me = this;
            this.listMacros.selectRecord(record);
            _.delay(function() {
                me.openContextMenuMacros(record, event);
            }, 10);
        },
        onSelectListMacrosItem: function(listView, itemView, record) {
            this._state.currentElementMode = this.CurrentElementModeType.Macros;
            this._state.isDisable = true;
            this.codeEditor.setValue(record.get('value'));
            this.codeEditor.setReadOnly(false);
            this._state.isDisable = false;

            this.codeEditor.focus();
            this.codeEditor.selection.clearSelection();
            this.codeEditor.scrollToRow(0);

            this.btnMacrosRun.setDisabled(false);

            this.listFunctions && this.listFunctions.deselectAll();
        },
        onRunMacros: function() {
            console.log('Run');
        },
        onMakeAutostartMacros: function() {
            if(!this._state.macrosItemMenuOpen) return;

            this._state.macrosItemMenuOpen.set('autostart', true);
        },
        onUnMakeAutostartMacros: function() {
            if(!this._state.macrosItemMenuOpen) return;

            this._state.macrosItemMenuOpen.set('autostart', false);
        },

        onRenameMacros: function() {
            if(!this._state.macrosItemMenuOpen) return;

            this.openWindowRename();
        },
        onRenameFunction: function() {
            if(!this._state.functionItemMenuOpen) return;

            this.openWindowRename();
        },

        onDeleteItem: function(list, item) {
            if(!item) return;

            var deletedIndex = list.store.indexOf(item);
            list.store.remove(item);
            if(list.store.length > 0) {
                var selectedIndex = deletedIndex < list.store.length
                    ? deletedIndex
                    : list.store.length - 1;
                list.selectByIndex(selectedIndex);
            } else {
                this.codeEditor.setValue('');
                this.codeEditor.setReadOnly(true);
                this.btnMacrosRun.setDisabled(true);
            }
        },
        onDeleteMacros: function() {
            this.onDeleteItem(this.listMacros, this._state.macrosItemMenuOpen);
        },
        onDeleteFunction: function() {
            this.onDeleteItem(this.listFunctions, this._state.functionItemMenuOpen);
        },

        onCopyItem: function(list, item) {
            list.store.add({
                guid: this.createGuid(),
                name: item.get('name') + '_copy',
                value: item.get('value'),
                autostart: item.get('autostart')
            });
            list.selectRecord(list.store.at(-1));
        },
        onCopyMacros: function() {
            this.onCopyItem(this.listMacros, this._state.macrosItemMenuOpen);
        },
        onCopyFunction: function() {
            this.onCopyItem(this.listFunctions, this._state.functionItemMenuOpen);
        },


        onCreateFunction: function() {
            var indexMax = 0;
            var macrosTextEn = 'Custom function';
            var macrosTextTranslate = this.textCustomFunction;
            this.listFunctions.store.each(function(macros, index) {
                var macrosName = macros.get('name');
                if (0 == macrosName.indexOf("Custom function"))
                {
                    var index = parseInt(macrosName.substr(macrosTextEn.length));
                    if (!isNaN(index) && (indexMax < index))
                        indexMax = index;
                }
                else if (0 == macrosName.indexOf(macrosTextTranslate))
                {
                    var index = parseInt(macrosName.substr(macrosTextTranslate.length));
                    if (!isNaN(index) && (indexMax < index))
                        indexMax = index;
                }
            });
            indexMax++;
            this.listFunctions.store.add({
                guid: this.createGuid(),
                name : (macrosTextTranslate + " " + indexMax),
                value : "(function()\n{\n\t/**\n\t * Function that returns the argument\n\t * @customfunction\n\t * @param {any} arg Any data.\n     * @returns {any} The argumet of the function.\n\t*/\n\tfunction myFunction(arg) {\n\t    return arg;\n\t}\n\tApi.AddCustomFunction(myFunction);\n})();",
                autostart: false
            });
            this.listFunctions.selectRecord(this.listFunctions.store.at(-1));
        },
        onClickListFunctionItem: function(listView, itemView, record) {
            var event = window.event ? window.event : window._event;
            if(!event) return;

            var btn = $(event.target);
            if (btn && btn.hasClass('listitem-icon')) {
                this.openContextMenuFunction(record, event);
            }
        },
        onContextMenuListFunctionItem: function(listView, itemView, record, event) {
            var me = this;
            this.listFunctions.selectRecord(record);
            _.delay(function() {
                me.openContextMenuFunction(record, event);
            }, 10);
        },
        onSelectListFunctionItem: function(listView, itemView, record) {
            this._state.currentElementMode = this.CurrentElementModeType.CustomFunction;
            this._state.isDisable = true;
            this.codeEditor.setValue(record.get('value'));
            this.codeEditor.setReadOnly(false);
            this._state.isDisable = false;

            this.codeEditor.focus();
            this.codeEditor.selection.clearSelection();
            this.codeEditor.scrollToRow(0);

            this.btnMacrosRun.setDisabled(true);

            this.listMacros && this.listMacros.deselectAll();
        },

        onHelp: function() {
            window.open('https://api.onlyoffice.com/plugin/macros', '_blank')
        },
        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },
        // onPrimary: function() {
        //     this.close();
        //     return false;
        // },


        textTitle           : 'Macros',
        textSave            : 'Save',
        textMacros          : 'Macros',
        textRun             : 'Run',
        textUnMakeAutostart : 'Unmake autostart',
        textMakeAutostart   : 'Make autostart',
        textRename          : 'Rename',
        textDelete          : 'Delete',
        textCopy            : 'Copy',
        textCustomFunction  : 'Custom function',
        textLoading         : 'Loading...',
        tipMacrosRun        : 'Run',
        tipMacrosAdd        : 'Add macros',
        tipFunctionAdd      : 'Add custom function',
    }, Common.Views.MacrosDialog || {}))
});
