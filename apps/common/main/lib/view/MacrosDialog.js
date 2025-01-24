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
            '<div class="content">' +
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
                '<div id="code-editor" class="invisible"></div>' +
            '</div>'+
            '<div class="separator horizontal" style="position: relative"></div>',


        initialize : function(options) {
            var _options = {},
                innerHeight = Math.max(Common.Utils.innerHeight() - Common.Utils.InternalSettings.get('window-inactive-area-top'), 350),
                innerWidth = Math.max(Common.Utils.innerWidth(), 600);

            _.extend(_options, {
                id: 'macros-dialog',
                title: this.textTitle,
                header: true,
                help: true,
                width: Math.min(800, innerWidth),
                height: Math.min(512, innerHeight),
                minwidth: 600,
                minheight: 350,
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
                isFunctionsSupport: !!window.SSE,
                macrosItemMenuOpen: null,
                functionItemMenuOpen: null,
                currentElementMode: this.CurrentElementModeType.Macros,
                currentValue: '',
                currentPos: {row: 2, column: 0}
            };

            _options.tpl = _.template(this.template)({
                isFunctionsSupport: this._state.isFunctionsSupport,
            });

            this.on({
                'help': this.onHelp,
                'drag': function(args){
                    args[0].codeEditor && args[0].codeEditor.enablePointerEvents(args[1]!=='start');
                },
                'resize': function(args){
                    args[0].codeEditor && args[0].codeEditor.enablePointerEvents(args[1]!=='start');
                }
            });

            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            me.aceContainer = $window.find('#code-editor');

            // this.loadMask = new Common.UI.LoadMask({owner: this.$window.find('.body')[0]});
            // this.loadMask.setTitle(this.textLoading);
            // this.loadMask.show();

            me.createCodeEditor();
            me.renderAfterAceLoaded();
        },

        renderAfterAceLoaded: function() {
            var me = this;
            this.btnMacrosRun = new Common.UI.Button({
                parentEl: $('#btn-macros-run'),
                cls: 'btn-toolbar borders--small',
                iconCls: 'icon toolbar__icon btn-run',
                hint: this.tipMacrosRun
            }).on('click', _.bind(this.onRunMacros, this));

            this.btnMacrosAdd = new Common.UI.Button({
                parentEl: $('#btn-macros-add'),
                cls: 'btn-toolbar borders--small',
                iconCls: 'icon toolbar__icon btn-zoomup',
                hint: this.tipMacrosAdd
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
                    '<div class="listitem-icon toolbar__icon btn-more"></div>'
                ].join(''))
            });
            this.listMacros.on('item:add',  _.bind(this.onAddListItem, this));
            this.listMacros.on('item:click', _.bind(this.onClickListMacrosItem, this));
            this.listMacros.on('item:contextmenu', _.bind(this.onContextMenuListMacrosItem, this));
            this.listMacros.on('item:select', _.bind(this.onSelectListMacrosItem, this));
            this.setListMacros();

            this.ctxMenuMacros = new Common.UI.Menu({
                cls: 'shifted-right',
                additionalAlign: this.menuAddAlign,
                items: [
                    new Common.UI.MenuItem({
                        caption     : this.textRun
                    }).on('click', _.bind(this.onRunMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textMakeAutostart
                    }).on('click', _.bind(this.onMakeAutostartMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textUnMakeAutostart
                    }).on('click', _.bind(this.onUnMakeAutostartMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textRename
                    }).on('click', _.bind(this.onRenameMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textDelete
                    }).on('click', _.bind(this.onDeleteMacros, this)),
                    new Common.UI.MenuItem({
                        caption     : this.textCopy
                    }).on('click', _.bind(this.onCopyMacros, this)),
                ]
            });
            this.ctxMenuMacros.on('hide:after', function() {
                me.listMacros.$el.find('.listitem-icon').removeClass('active');
            });

            if(this._state.isFunctionsSupport) {
                this.btnFunctionAdd = new Common.UI.Button({
                    parentEl: $('#btn-function-add'),
                    cls: 'btn-toolbar borders--small',
                    iconCls: 'icon toolbar__icon btn-zoomup',
                    hint: this.tipFunctionAdd
                }).on('click', _.bind(this.onCreateFunction, this));

                this.listFunctions = new Common.UI.ListView({
                    el: $('#list-functions', this.$window),
                    store: new Common.UI.DataViewStore(),
                    tabindex: 1,
                    cls: 'dbl-clickable',
                    itemTemplate: _.template([
                        '<div class="listitem-autostart"></div>',
                        '<div id="<%= id %>" class="list-item" role="listitem"><%= Common.Utils.String.htmlEncode(name) %></div>',
                        '<div class="listitem-icon toolbar__icon btn-more"></div>'
                    ].join(''))
                });
                this.listFunctions.on('item:add',  _.bind(this.onAddListItem, this));
                this.listFunctions.on('item:click', _.bind(this.onClickListFunctionItem, this));
                this.listFunctions.on('item:contextmenu', _.bind(this.onContextMenuListFunctionItem, this));
                this.listFunctions.on('item:select', _.bind(this.onSelectListFunctionItem, this));
                this.setListFunctions();

                this.ctxMenuFunction = new Common.UI.Menu({
                    cls: 'shifted-right',
                    additionalAlign: this.menuAddAlign,
                    items: [
                        new Common.UI.MenuItem({
                            caption     : this.textRename
                        }).on('click', _.bind(this.onRenameFunction, this)),
                        new Common.UI.MenuItem({
                            caption     : this.textDelete
                        }).on('click', _.bind(this.onDeleteFunction, this)),
                        new Common.UI.MenuItem({
                            caption     : this.textCopy
                        }).on('click', _.bind(this.onCopyFunction, this)),
                    ]
                });
                this.ctxMenuFunction.on('hide:after', function() {
                    me.listFunctions.$el.find('.listitem-icon').removeClass('active');
                });
    
            }

            this.makeDragable();
        },

        createCodeEditor: function() {
            var me = this;

            this.codeEditor = new Common.UI.AceEditor({parentEl: '#code-editor'});
            this.codeEditor.on('ready', function() {
                me.codeEditor.updateTheme();
                me.codeEditor.setValue(me._state.currentValue, me._state.currentPos);
                setTimeout(function() {
                    me.aceContainer.removeClass('invisible');
                }, 10);
                // me.loadMask.hide();
            });
            this.codeEditor.on('change', function(value, pos) {
                var selectedItem = me._state.currentElementMode === me.CurrentElementModeType.Macros
                    ? me.listMacros.getSelectedRec()
                    : me.listFunctions.getSelectedRec();
                if(selectedItem) {
                    me._state.currentValue = value;
                    me._state.currentPos = pos;
                    selectedItem.set('value', value);
                    selectedItem.set('currentPos', pos);
                }
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
                            value: '(function()\n{\n\t/* Enter your code here. */\n})();\n\n/*\nExecution of VBA commands does not support.\n' + macros + '*/'
                        });
                    }
                });
            }

            if(macrosList.length > 0) {
                macrosList.forEach(function (macros) {
                    macros.autostart = !!macros.autostart;
                    macros.currentPos = {row: 2, column: 0};
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

            var menuContainerRect = Common.Utils.getBoundingClientRect(menuContainer[0]);

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
                this.ctxMenuMacros.items[1].setVisible(!macrosItem.get('autostart'));
                this.ctxMenuMacros.items[2].setVisible(macrosItem.get('autostart'));
            }
        },
        openContextMenuFunction: function(functionItem, event) {
            var isOpen = this.openContextMenu(this.CurrentElementModeType.CustomFunction, functionItem, event);
            if(isOpen) {
                this._state.functionItemMenuOpen = functionItem;
            }
        },
        openWindowRename: function() {
            var me = this;
            var windowSize = {
                width: 300,
                height: 90
            };
            var macrosWindowRect = Common.Utils.getBoundingClientRect(this.$window[0]);
            var selectedItem = me._state.currentElementMode === me.CurrentElementModeType.Macros
                ? me.listMacros.getSelectedRec()
                : me.listFunctions.getSelectedRec();

            (new Common.Views.TextInputDialog({
                value: selectedItem.get('name'),
                width: windowSize.width,
                height: windowSize.height,
                inputConfig: {
                    allowBlank  : false,
                    validation: function(value) {
                        return value.trim().length > 0 ? true : '';
                    }
                },
                handler: function(result, value) {
                    if (result == 'ok') {
                        selectedItem.set('name', value.trim());
                    }
                }
            })).show(
                macrosWindowRect.left + (macrosWindowRect.width - windowSize.width) / 2,
                macrosWindowRect.top + (macrosWindowRect.height - windowSize.height) / 2
            );
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
                var currentElementCoord = Common.Utils.getBoundingClientRect(currentElement);
                var currentElementCenter = currentElementCoord.y + currentElementCoord.height * 0.45;
                if(cursorPosition > currentElementCenter) {
                    nextIndex += 1;
                }
                return nextIndex
            }

            function handleDragstart(list, e) {
                me.codeEditor.disableDrop(true);

                var id = $(e.target).children('.list-item').attr('id');
                e.dataTransfer.setData("text/plain", id);
                e.dataTransfer.effectAllowed = "move";
                e.target.classList.add('dragged');
                currentIndex = list.store.indexOf(list.store.findWhere({ id: id }));
                e.target.click();
            }

            function handleDragend(list, e) {
                me.codeEditor.disableDrop(false);

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
            this.codeEditor.destroyEditor();
            Common.UI.Window.prototype.close.call(this, arguments);
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
                value : "(function()\n{\n\n})();",
                autostart: false,
                currentPos: {row: 2, column: 0}
            });
            this.listMacros.selectRecord(this.listMacros.store.at(-1));
        },
        onClickListMacrosItem: function(listView, itemView, record, event) {
            if(!event) return;

            var btn = $(event.target);
            if (btn && btn.hasClass('listitem-icon')) {
                itemView.$el.find('.listitem-icon').addClass('active');
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
            this.codeEditor.setValue(record.get('value'), record.get('currentPos')!==undefined ? record.get('currentPos') : {row: 2, column: 0});
            this._state.currentValue = record.get('value');
            this._state.currentPos = record.get('currentPos');

            this.btnMacrosRun.setDisabled(false);
            this.listFunctions && this.listFunctions.deselectAll();
        },
        onRunMacros: function() {
            this.api.callCommand(this._state.currentValue);
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
                value : "(function()\n{\n\t/**\n\t * Function that returns the argument\n\t * @customfunction\n\t * @param {any} arg Any data.\n     * @returns {any} The argumet of the function.\n\t*/\n\tfunction myFunction(arg) {\n\t\t\n\t    return arg;\n\t}\n\tApi.AddCustomFunction(myFunction);\n})();",
                currentPos: {row: 9, column: 2}
            });
            this.listFunctions.selectRecord(this.listFunctions.store.at(-1));
        },
        onClickListFunctionItem: function(listView, itemView, record, event) {
            if(!event) return;

            var btn = $(event.target);
            if (btn && btn.hasClass('listitem-icon')) {
                itemView.$el.find('.listitem-icon').addClass('active');
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
            this.codeEditor.setValue(record.get('value'), record.get('currentPos')!==undefined ? record.get('currentPos') : {row: 2, column: 0});

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
