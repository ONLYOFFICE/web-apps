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
        initialize : function(options) {
            var _options = {},
                innerHeight = Math.max(Common.Utils.innerHeight() - Common.Utils.InternalSettings.get('window-inactive-area-top'), 350),
                innerWidth = Math.max(Common.Utils.innerWidth(), 600);

            _.extend(_options, {
                id: 'macros-dialog',
                title: this.textTitle,
                header: true,
                help: true,
                width: Math.min(810, innerWidth),
                height: Math.min(512, innerHeight),
                minwidth: 750,
                minheight: 350,
                resizable: true,
                cls: 'modal-dlg invisible-borders',
                buttons: [{
                    value: 'ok',
                    caption: this.textSave
                }, 'cancel']
            }, options || {});
            this.api = options.api;

            this.ItemTypes = {
                CustomFunction  : 0,
                Macros 			: 1
            };
            this._state = {
                isFunctionsSupport: !!window.SSE,
                selectedItem: {
                    record: null,
                    type: null
                },
                currentValue: '',
                currentPos: {row: 3, column: 0}
            };

            this.template = [
                '<div id="macros-dialog-content">' +
                    '<div id="macros-dialog-left" class="noselect">' +
                        '<div id="macros-menu" <% if(!isFunctionsSupport){%> style="height: 100%;" <% } %>>' +
                            '<div class="menu-header">' +
                                '<label>' + this.textMacros + '</label>' +
                                '<div id="btn-ai-macros-add"></div>' +
                                '<div id="btn-macros-add"></div>' +
                            '</div>' +
                            '<div class="separator horizontal" style="position: relative"></div>' +
                            '<div id="macros-list"></div>' +
                        '</div>' +
                        '<div class="separator horizontal" <% if(!isFunctionsSupport){%> style="display: none;" <% } %> ></div>' +
                        '<div id="functions-menu" <% if(!isFunctionsSupport){%> style="display: none;" <% } %> >' +
                            '<div class="menu-header">' +
                                '<label id="macros-dialog-functions-label">' + this.textCustomFunctions + '</label>' +
                                '<div id="btn-function-add"></div>' +
                            '</div>' +
                            '<div class="separator horizontal" style="position: relative"></div>' +
                            '<div id="functions-list"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="separator vertical" style="position: relative"></div>' +
                    '<div id="macros-dialog-right">' + 
                        '<div class="menu-header">' +
                            '<div id="btn-macros-undo"></div>' +
                            '<div id="btn-macros-redo"></div>' +
                            '<div id="btn-macros-run" class="lock-for-function"></div>' +
                            '<div id="btn-macros-debug" class="lock-for-function"></div>' +
                            '<div id="btn-macros-copy"></div>' +
                            '<div id="btn-macros-rename"></div>' +
                            '<div id="btn-macros-delete"></div>' +
                            '<div id="ch-macros-autostart" class="lock-for-function"></div>' +
                        '</div>' +
                        '<div class="separator horizontal" style="position: relative"></div>' +
                        '<div id="macros-code-editor" class="invisible"></div>' +
                    '</div>' +
                '</div>'+
                '<div class="separator horizontal" style="position: relative"></div>',
            ].join('');

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

            me.aceContainer = $window.find('#macros-code-editor');

            // this.loadMask = new Common.UI.LoadMask({owner: this.$window.find('.body')[0]});
            // this.loadMask.setTitle(this.textLoading);
            // this.loadMask.show();

            me.createCodeEditor();
            me.renderAfterAceLoaded();
            me.calcHeaderBreakpoints();
            me.collapseHeaderItems();
            me.updateCustomFunctionLabel();

            var throttleResizing = _.throttle(_.bind(this.collapseHeaderItems, this), 100);

            this.on('resizing', function(){
                throttleResizing();
            });
        },

        renderAfterAceLoaded: function() {
            this.btnUndo = new Common.UI.Button({
                parentEl    : $('#btn-macros-undo'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-undo icon-rtl',
                hint        : this.tipUndo
            }).on('click', _.bind(this.onUndo, this));

            this.btnRedo = new Common.UI.Button({
                parentEl    : $('#btn-macros-redo'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-redo icon-rtl',
                hint        : this.tipRedo
            }).on('click', _.bind(this.onRedo, this));

            this.btnRun = new Common.UI.Button({
                parentEl    : $('#btn-macros-run'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-run',
                caption     : this.textRun,
                hint        : this.tipMacrosRun
            }).on('click', _.bind(this.onRunMacros, this, false));

            this.btnDebug = new Common.UI.Button({
                parentEl    : $('#btn-macros-debug'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-debug',
                caption     : this.textDebug,
                hint        : this.tipMacrosDebug
            }).on('click', _.bind(this.onRunMacros, this, true));

            this.btnCopy = new Common.UI.Button({
                parentEl    : $('#btn-macros-copy'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-copy',
                caption     : this.textCopy,
                hint        : this.tipMacrosCopy
            }).on('click', _.bind(this.onCopyItem, this));

            this.btnRename = new Common.UI.Button({
                parentEl    : $('#btn-macros-rename'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-rename',
                caption     : this.textRename,
                hint        : this.tipMacrosRename
            }).on('click', _.bind(this.onRenameItem, this));

            this.btnDelete = new Common.UI.Button({
                parentEl    : $('#btn-macros-delete'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-cc-remove',
                caption     : this.textDelete,
                hint        : this.tipMacrosDelete
            }).on('click', _.bind(this.onDeleteItem, this));

            this.chAutostart = new Common.UI.CheckBox({
                el: $('#ch-macros-autostart'),
                labelText: this.textAutostart
            }).on('change', _.bind(this.onChangeAutostart, this));

            var isPresentAI = this.api.checkAI();
            this.btnAiMacrosAdd = new Common.UI.Button({
                parentEl    : $('#btn-ai-macros-add'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-general-ai',
                menu        : new Common.UI.Menu({
                    additionalAlign: this.menuAddAlign,
                    items:[
                        {caption: this.textCreateFromDesc,  value: 'create',    disabled: !isPresentAI},
                        {caption: this.textConvertFromVBA,  value: 'convert',   disabled: !isPresentAI}
                    ]
                }),
                hint        : this.tipAi
            });
            this.btnAiMacrosAdd.menu.on('item:click', _.bind(this.onAiMenu, this));

            this.btnMacrosAdd = new Common.UI.Button({
                parentEl: $('#btn-macros-add'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-zoomup',
                hint: this.tipMacrosAdd
            }).on('click', _.bind(this.onCreateMacros, this, ''));

            this.listMacros = new Common.UI.ListView({
                el: $('#macros-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                itemTemplate: _.template([
                    '<div class="listitem-autostart">',
                        '<% if (autostart) { %>',
                            '<span>(A)</span>',
                        '<% } %>',
                    '</div>',
                    '<div id="<%= id %>" class="list-item" role="listitem"><%= Common.Utils.String.htmlEncode(name) %></div>'
                ].join(''))
            });
            this.listMacros.on('item:add',  _.bind(this.onAddListItem, this));
            this.listMacros.on('item:select', _.bind(this.onSelectListMacrosItem, this));
            this.setListMacros();

            if(this._state.isFunctionsSupport) {
                this.btnFunctionAdd = new Common.UI.Button({
                    parentEl: $('#btn-function-add'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-zoomup',
                    hint: this.tipFunctionAdd
                }).on('click', _.bind(this.onCreateFunction, this));

                this.listFunctions = new Common.UI.ListView({
                    el: $('#functions-list', this.$window),
                    store: new Common.UI.DataViewStore(),
                    tabindex: 1,
                    cls: 'dbl-clickable',
                    itemTemplate: _.template([
                        '<div class="listitem-autostart"></div>',
                        '<div id="<%= id %>" class="list-item" role="listitem"><%= Common.Utils.String.htmlEncode(name) %></div>'
                    ].join(''))
                });
                this.listFunctions.on('item:add',  _.bind(this.onAddListItem, this));
                this.listFunctions.on('item:select', _.bind(this.onSelectListFunctionItem, this));
                this.setListFunctions();    
            }

            this.makeDragable();
        },

        createCodeEditor: function() {
            var me = this;

            this.codeEditor = new Common.UI.MonacoEditor({parentEl: '#macros-code-editor'});
            this.codeEditor.on('ready', function() {
                me.codeEditor.updateTheme();
                me.codeEditor.setValue(me._state.currentValue, me._state.currentPos);
                setTimeout(function() {
                    me.aceContainer.removeClass('invisible');
                }, 10);
                // me.loadMask.hide();
            });
            this.codeEditor.on('change', function(value, pos) {
                if(me._state.selectedItem.record) {
                    me._state.currentValue = value;
                    me._state.currentPos = pos;
                    me._state.selectedItem.record.set('value', value);
                    me._state.selectedItem.record.set('currentPos', pos);
                }
            });
        },

        calcHeaderBreakpoints: function() {
            this.breakpoints = [];

            var me = this;
            var maxHeaderWidth = 10;    //10px - gap between chAutostart and btnDelete
            var headerItems = [
                { btn: this.btnUndo, collapsible: false },
                { btn: this.btnRedo, collapsible: false },
                { btn: this.btnRun, collapsible: true },
                { btn: this.btnDebug, collapsible: true },
                { btn: this.btnCopy, collapsible: true },
                { btn: this.btnRename, collapsible: true },
                { btn: this.btnDelete, collapsible: true },
                { btn: this.chAutostart, collapsible: false, withoutMargin: true }
            ];
            this.collapsibleHeaderItems = headerItems.filter(function(item) { return item.collapsible });

            headerItems.forEach(function(item) {
                var $caption = item.btn.$el.find('.caption');
                var hasCaptionHidden = $caption.hasClass('hide');
                $caption.removeClass('hide');

                item.expandedWidth = item.btn.$el.outerWidth(!item.withoutMargin);
                item.collapsedWidth = item.collapsible ? (item.expandedWidth - $caption.outerWidth(true)) : item.expandedWidth;

                maxHeaderWidth += item.expandedWidth;
                hasCaptionHidden && $caption.addClass('hide');
            });

            this.collapsibleHeaderItems.forEach(function(item, index) {
                if(index == 0) {
                    me.breakpoints.push({
                        width: maxHeaderWidth,
                        collapseItems: [item]
                    });
                } else {
                    var prevBreakpoint = me.breakpoints[index - 1];
                    var prevItem = me.collapsibleHeaderItems[index - 1];

                    me.breakpoints.push({
                        width: prevBreakpoint.width - (prevItem.expandedWidth - prevItem.collapsedWidth),
                        collapseItems: [item].concat(prevBreakpoint.collapseItems)
                    });
                }
            });
        },

        collapseHeaderItems: function() {
            var width = this.getChild().find('#macros-dialog-right .menu-header').width();
            var currentBreakpoint = null;
            
            for (let i = this.breakpoints.length - 1; i >= 0; i--) {
                if(width < this.breakpoints[i].width) {
                    currentBreakpoint = this.breakpoints[i];
                    break;
                }
            }

            this.collapsibleHeaderItems.forEach(function(item) {
                var shouldCollapse = currentBreakpoint && currentBreakpoint.collapseItems.indexOf(item) !== -1;
                item.btn.$el.find('.caption').toggleClass('hide', !!shouldCollapse);
            });
        },

        updateCustomFunctionLabel: function() {
            var $window = this.getChild();

            var $macrosDialogLeft = $window.find('#macros-dialog-left');
            var $menuHeader = $window.find('#functions-menu .menu-header');
            var $btnFunctionAdd = $window.find('#btn-function-add');
            var $functionLabel = $window.find('#macros-dialog-functions-label');

            var minWidth = parseFloat($macrosDialogLeft.css('min-width')) || 0;
            var menuHeaderPadding = (parseFloat($menuHeader.css('padding-left')) || 0) + (parseFloat($menuHeader.css('padding-right')) || 0);
            var btnWidth = $btnFunctionAdd.outerWidth(true) || 0;
           
            var allowedWidth = minWidth - menuHeaderPadding - btnWidth;

            if ($functionLabel.width() > allowedWidth) {
                $functionLabel.text(this.textFunctions);
            }
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

            if(macrosList && macrosList.length > 0) {
                macrosList.forEach(function (macros) {
                    macros.autostart = !!macros.autostart;
                    macros.currentPos = {row: 3, column: 0};
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

        makeDragable: function() {
            var me = this;
            var currentElement;
            var currentIndex = 0;
            var insertIndex;
            var macrosList = document.getElementById("macros-list");
            var functionList = document.getElementById("functions-list");

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

            function handleDragover(list, type, e) {
                e.preventDefault();
                currentElement = e.target;
                let bDragAllowed = me._state.selectedItem.type === type;
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
                handleDragover(macrosList, me.ItemTypes.Macros, e)
            });
            functionList.addEventListener('dragover', function(e) {
                handleDragover(functionList, me.ItemTypes.CustomFunction, e)
            });

            macrosList.addEventListener('dragleave', function(e) {
                handleDragleave(e);
            });
            functionList.addEventListener('dragleave', function(e) {
                handleDragleave(e);
            });
        },

        selectItem: function(record, type) {
            this._state.selectedItem.record = record;
            this._state.selectedItem.type = type;
            this.codeEditor.setValue(record.get('value'), record.get('currentPos')!==undefined ? record.get('currentPos') : {row: 3, column: 0});
            this.codeEditor.revealPositionInCenter();
            this._state.currentValue = record.get('value');
            this._state.currentPos = record.get('currentPos');
            
            this.chAutostart.setValue(record.get('autostart'));
            this.getChild().find('.lock-for-function').toggleClass('hidden', type == this.ItemTypes.CustomFunction);

            if(type == this.ItemTypes.Macros && this.listFunctions) {
                this.listFunctions.deselectAll();
            } 
            if(type == this.ItemTypes.CustomFunction && this.listMacros) {
                this.listMacros.deselectAll();
            }
            this.updateHintButtons();
            this.setDisableButtons(false); 
        },

        updateHintButtons: function() {
            var typeString = (this._state.selectedItem.type == this.ItemTypes.Macros ? 'Macros' : 'Function');
            this.btnCopy.updateHint(this['tip' + typeString + 'Copy']);
            this.btnRename.updateHint(this['tip' + typeString + 'Rename']);
            this.btnDelete.updateHint(this['tip' + typeString + 'Delete']);
        },

        setDisableButtons: function(value) {
            this.btnUndo.setDisabled(value);
            this.btnRedo.setDisabled(value);
            this.btnRun.setDisabled(value);
            this.btnDebug.setDisabled(value);
            this.btnCopy.setDisabled(value);
            this.btnRename.setDisabled(value);
            this.btnDelete.setDisabled(value);
            this.chAutostart.setDisabled(value);
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

        onCopyItem: function() {
            if(!this._state.selectedItem.record) return;
            let list = (this._state.selectedItem.type == this.ItemTypes.Macros 
                ? this.listMacros 
                : this.listFunctions);
            let item = this._state.selectedItem.record;

            list.store.add({
                guid: this.createGuid(),
                name: item.get('name') + '_copy',
                value: item.get('value'),
                autostart: item.get('autostart')
            });
            list.selectRecord(list.store.at(-1));
        },

        onRenameItem: function() {
            if(!this._state.selectedItem.record) return;

            var me = this;
            var windowSize = {
                width: 300,
                height: 90
            };
            var macrosWindowRect = Common.Utils.getBoundingClientRect(this.$window[0]);

            (new Common.Views.TextInputDialog({
                value: me._state.selectedItem.record.get('name'),
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
                        me._state.selectedItem.record.set('name', value.trim());
                    }
                }
            })).show(
                macrosWindowRect.left + (macrosWindowRect.width - windowSize.width) / 2,
                macrosWindowRect.top + (macrosWindowRect.height - windowSize.height) / 2
            );
        },

        onCreateMacros: function(value) {
            var indexMax = 0;
            var macrosTextEn = 'Macro';
            var macrosTextTranslate = this.textMacro;
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
                value : value || "(function()\n{\n    \n})();",
                autostart: false,
                currentPos: {row: 3, column: 5}
            });
            this.listMacros.selectRecord(this.listMacros.store.at(-1));
        },

        onSelectListMacrosItem: function(listView, itemView, record) {
            this.selectItem(record, this.ItemTypes.Macros);
        },

        onUndo: function() {
            this.codeEditor.undo();
        },

        onRedo: function() {
            this.codeEditor.redo();
        },

        onAiMenu: function(menu, item) {
            var me = this;
            var title = '';
            var instruction = '';
            var instructionOutput = 'Generate JavaScript code as an Immediately Invoked Function Expression (IIFE), in the format (function(){ ... })();, that [describe what the code should do]. The code should be self-contained and execute immediately. ';
            var langCode = Common.Locale.getCurrentLanguage()
            var langName = Common.util.LanguageInfo.getLocalLanguageName(Common.util.LanguageInfo.getLocalLanguageCode(langCode));
            if(langName && typeof langName[1] == "string") {
                langName = langName[1];
            } else {
                langName = null;
            }

            var editorName = 'Document Editor';
            if(window.PE) editorName = 'Presentation Editor';
            if(window.SSE) editorName = 'Spreadsheet Editor';
            
            if(item.value == 'create') {
                title = this.textCreateMacrosFromDesc;
                instruction = '' + 
                    'Create a macro for OnlyOffice. ' + 
                    'The macro should be written specifically for the OnlyOffice ' + editorName + '. ' +
                    'Return only code with comments, as plain text without markdown. ' + 
                    'The format of the code is JavaScript. ' + 
                    'Write comments in the same language as the user prompt. ' + 
                    'The description of what the macro should do is also described in the user message. ' + instructionOutput;
            } else if(item.value == 'convert') {
                title = this.textConvertMacrosFromVBA;
                instruction = '' + 
                    'Convert macro for OnlyOffice from VBA. ' +
                    'The macro should be written specifically for the OnlyOffice ' + editorName + '. ' +
                    'Return only code with comments, as plain text without markdown. ' +
                    'The code format is JavaScript. ' +
                    'Write comments in ' + langCode + (langName ? '(' + langName + ')' : '') + ' language. ' + 
                    'The code of the macro in VBA should be presented in the user message. ' + instructionOutput;
            }
            if(item.value == 'create' || item.value == 'convert') {
                var macrosWindow = new Common.Views.MacrosAiDialog({
                    title: title,
                    api: this.api,
                    instruction: instruction,
                    inputType: item.value == 'create' ? 'textarea' : 'codeEditor',
                    handler: function(btnValue, value) {
                        if(btnValue == 'ok') {
                            me.onCreateMacros(value);
                        }
                    }
                });
                macrosWindow.show();
            }
        },

        onRunMacros: function(isDebug) {
            this.api.callCommand(isDebug ? "debugger;\n" + this._state.currentValue : this._state.currentValue);
        },

        onChangeAutostart: function(field, newValue) {
            if(!this._state.selectedItem.record) return;

            this._state.selectedItem.record.set('autostart', newValue == 'checked');
        },

        onDeleteItem: function() {
            if(!this._state.selectedItem.record) return;
            let list = (this._state.selectedItem.type == this.ItemTypes.Macros 
                ? this.listMacros 
                : this.listFunctions);
            let item = this._state.selectedItem.record;

            var deletedIndex = list.store.indexOf(item);
            list.store.remove(item);
            if(list.store.length > 0) {
                var selectedIndex = deletedIndex < list.store.length
                    ? deletedIndex
                    : list.store.length - 1;
                list.selectByIndex(selectedIndex);
            } else {
                this.codeEditor.setValue('', {row: 0, column: 0}, true);
                this.setDisableButtons(true);
            }
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
                currentPos: {row: 10, column: 3}
            });
            this.listFunctions.selectRecord(this.listFunctions.store.at(-1));
        },

        onSelectListFunctionItem: function(listView, itemView, record) {
            this.selectItem(record, this.ItemTypes.CustomFunction);
        },

        onThemeChanged: function() {
            this.calcHeaderBreakpoints();
            this.collapseHeaderItems();
            Common.UI.Window.prototype.onThemeChanged.call(this);
        },
        
        onHelp: function() {
            window.open('https://api.onlyoffice.com/docs/plugin-and-macros/macros/getting-started/', '_blank')
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
        textMacro           : 'Macro',
        textMacros          : 'Macros',
        textRun             : 'Run',
        textDebug           : 'Debug',
        textAutostart       : 'Autostart',
        textRename          : 'Rename',
        textDelete          : 'Delete',
        textCopy            : 'Copy',
        textCustomFunction  : 'Custom function',
        textCustomFunctions : 'Custom functions',
        textFunctions       : 'Functions',
        textLoading         : 'Loading...',
        textCreateFromDesc  : 'Create from description',
        textCreateMacrosFromDesc  : 'Create macros from description',
        textConvertFromVBA  : 'Convert from VBA',
        textConvertMacrosFromVBA  : 'Convert macros from VBA',
        tipUndo             : 'Undo',
        tipRedo             : 'Redo',
        tipMacrosRename     : 'Rename macros',
        tipMacrosDelete     : 'Delete macros',
        tipMacrosCopy       : 'Copy macros',
        tipMacrosRun        : 'Run macros',
        tipMacrosDebug      : 'Debug macros',
        tipMacrosAdd        : 'Add macros',
        tipFunctionRename   : 'Rename custom function',
        tipFunctionDelete   : 'Delete custom function',
        tipFunctionCopy     : 'Copy custom function',
        tipFunctionAdd      : 'Add custom function',
        tipAi               : 'AI'
    }, Common.Views.MacrosDialog || {}))
});
