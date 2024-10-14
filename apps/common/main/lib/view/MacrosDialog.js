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

define([
    'common/main/lib/component/Window'
], function () {
    'use strict';
    Common.Views.MacrosDialog = Common.UI.Window.extend(_.extend({
        template:
            '<div class="content">' +
                '<div class="common_menu noselect">' +
                    '<div id="menu_macros" class="menu_macros_long">' +
                        '<div class="menu_header">' +
                            '<label class="i18n header">Macros</label>' +
                            '<div class="div_buttons">' +
                                '<div id="btn-macros-run"></div>' +
                                '<div id="btn-macros-add"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div id="list-macros"></div>' +
                        '<div id="menu_content_macros" class="menu_padding"></div>' +
                    '</div>' +
                    '<div class="separator horizontal" style="width: 100%;"></div>' +
                    '<div id="menu_functions">' +
                        '<div class="menu_header">' +
                            '<label class="i18n header">Custom Functions</label>' +
                            '<div id="btn-function-add"></div>' +
                        '</div>' +
                        '<div id="menu_content_functions" class="menu_padding"></div>' +
                    '</div>' +
                '</div>' +
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

            _options.tpl = _.template(this.template)(_options);

            this._state = {
                macrosItemMenuOpen: null
            }

            this.on('help', this.onHelp);
            this.on('close', this.onClose);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

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

            this.btnFunctionAdd = new Common.UI.Button({
                parentEl: $('#btn-function-add'),
                cls: 'btn-toolbar borders--small',
                iconCls: 'icon toolbar__icon btn-zoomup',
                hint: this.tipFunctionAdd,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });

            this.listMacros = new Common.UI.ListView({
                el: $('#list-macros', this.$window),
                store: new Common.UI.DataViewStore(),
                tabindex: 1,
                cls: 'dbl-clickable',
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
            this.listMacros.on('item:add',  _.bind(this.onAddListMacrosItem, this));
            this.listMacros.on('item:click', _.bind(this.onClickListMacrosItem, this));
            this.listMacros.on('item:contextmenu', _.bind(this.onContextMenuListMacrosItem, this));

            this.setListMacros();
            this.makeDragable();

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

            this.inputText = new Common.UI.InputField({
                el: $('#search-adv-text'),
                placeHolder: this.textFind,
                allowBlank: true,
                validateOnBlur: false,
                style: 'width: 100%;',
                type: 'search',
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            var windowRenameTpl =
                '<div class="box" style="height: 22px">' +
                    '<div class="input-field">' +
                        '<input type="text" name="range" class="form-control"><span class="input-error"/>' +
                    '</div>' +
                '</div>';

            this.windowRename = new Common.UI.Window({
                id: 'macros-rename-dialog',
                header: false,
                width: 300,
                height: 90,
                cls: 'modal-dlg',
                tpl: windowRenameTpl,
                buttons: ['ok', 'cancel']
            }).on('render:after', _.bind(this.onRenderWindowRename, this));

            this.createCodeEditor();
        },


        createCodeEditor: function() {
            var me = this;
            function on_init_server(type){
                if (type === (window.initCounter & type))
                    return;
                window.initCounter |= type;
                if (window.initCounter === 3)
                {
                    // this.load_library("onlyoffice", "./libs/" + 'de' + "/api.js");
                }
            }

            function load_library(name, url) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.onreadystatechange = function()
                {
                    if (xhr.readyState == 4)
                    {
                        var EditSession = ace.require("ace/edit_session").EditSession;
                        var editDoc = new EditSession(xhr.responseText, "ace/mode/javascript");
                        this.codeEditor.ternServer.addDoc(name, editDoc);
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

            on_init_server(2);

            ace.config.loadModule('ace/ext/tern', function () {
                me.codeEditor.setOptions({
                    enableTern: {
                        defs: ['browser', 'ecma5'],
                        plugins: { doc_comment: { fullDocs: true } },
                        useWorker: !!window.Worker,
                        switchToDoc: function (name, start) {},
                        startedCb: function () {
                            on_init_server(1);
                        },
                    },
                    enableSnippets: false
                });
            });


            // if (!window.isIE) {
            //     ace.config.loadModule('ace/ext/language_tools', function () {
            //         me.codeEditor.setOptions({
            //             enableBasicAutocompletion: false,
            //             enableLiveAutocompletion: true
            //         });
            //     });
            // }

            ace.config.loadModule('ace/ext/html_beautify', function (beautify) {
                me.codeEditor.setOptions({
                    autoBeautify: true,
                    htmlBeautify: true,
                });
                window.beautifyOptions = beautify.options;
            });

            this.codeEditor.getSession().on('change', function() {
                // let obj = (CurrentElementModeType.Macros === CurrentElementMode) ? Content : CustomFunctions;
                //
                // if (obj.current == -1 || window.isDisable)
                //     return;

                // obj.macrosArray[obj.current].value = editor.getValue();
                console.log(me.codeEditor);
            });
        },

        setListMacros: function() {
            function parseData(data) {
                var result;
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
            }

            // TODO: Добавить VBAMacros
            var data = parseData(this.api.pluginMethod_GetMacros());
            var macrosList = data.macrosArray;
            macrosList.forEach(function (macros) {
                macros.autostart = false;
            });

            this.listMacros.store.reset(macrosList);
            var selectItem = this.listMacros.store.at(data.current);
            selectItem && this.listMacros.selectRecord(selectItem);
        },
        openContextMenuMacros: function(macrosItem, event) {
            // TODO: Чтобы меню открывалось либо около курсора, либо около кнопки.
            if (this._state.macrosItemMenuOpen === macrosItem && this.ctxMenuMacros.isVisible()) {
                this.ctxMenuMacros.hide();
                return;
            }
            this._state.macrosItemMenuOpen = macrosItem;

            var menu = this.ctxMenuMacros,
                currentTarget = $(event.currentTarget),
                parent = $('#menu_macros');

            var menuContainer = parent.find('#macros-dialog-fields-container');
            if (!menu.rendered) {
                if (menuContainer.length < 1) {
                    menuContainer = $('<div id="macros-dialog-fields-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                    parent.append(menuContainer);
                }
                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});

                menu.on('show:after', function(cmp) {
                    if (cmp && cmp.menuAlignEl)
                        cmp.menuAlignEl.toggleClass('over', true);
                }).on('hide:after', function(cmp) {
                    if (cmp && cmp.menuAlignEl)
                        cmp.menuAlignEl.toggleClass('over', false);
                });
            }

            if(macrosItem.get('autostart')) {
                menu.items[1].setVisible(false);
                menu.items[2].setVisible(true);
            } else {
                menu.items[1].setVisible(true);
                menu.items[2].setVisible(false);
            }

            menu.menuAlignEl = currentTarget;
            menu.setOffset(15, -currentTarget.height()/2 - 3);
            menu.show();
            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            event.stopPropagation();
            event.preventDefault();
        },

        makeDragable: function() {
            var me = this;
            var indActive = 0;
            var activeElement;
            var currentElement;
            var nextElement;
            var macrosList = document.getElementById("list-macros");
            var functionList = document.getElementById("menu_functions");

            macrosList.addEventListener('dragstart', function(evt) {
                var id = $(evt.target).children('.list-item').attr('id');
                evt.dataTransfer.setData("text", id);
                evt.dataTransfer.effectAllowed = "move";
                activeElement = evt.target;
                evt.target.classList.add('dragged');
                indActive = me.listMacros.store.indexOf(me.listMacros.store.findWhere({ id: id }));
                evt.target.click();
            });

            functionList.addEventListener('dragstart', function(evt) {
                window.CustomContextMenu.hide();
                evt.dataTransfer.setData("text", evt.target.id);
                evt.dataTransfer.effectAllowed = "move";
                activeElement = evt.target;
                evt.target.classList.add('dragged');
                indActive = CustomFunctions.macrosArray.findIndex(function(el) {
                    return (el.name == evt.target.innerText)
                })
                evt.target.onclick();
            });

            macrosList.addEventListener('dragend', function(evt) {
                evt.target.classList.remove('dragged');
                $('.dragHovered').removeClass("dragHovered");

                if (currentElement === activeElement)
                    return;

                var indNext = me.listMacros.store.indexOf(me.listMacros.store.findWhere({
                    id: $(nextElement).children('.list-item').attr('id')
                }));
                if (indNext === -1)
                    indNext = me.listMacros.store.length;

                if (indActive < indNext)
                    indNext--;

                var newStoreArr = me.listMacros.store.models.slice();
                let tmp = newStoreArr.splice(indActive, 1)[0];
                newStoreArr.splice(indNext, 0, tmp);
                me.listMacros.store.reset(newStoreArr);
                indActive = 0;
            });

            functionList.addEventListener('dragend', function(evt) {
                evt.target.classList.remove('dragged');
                $('.dragHovered').removeClass("dragHovered");

                if (currentElement === activeElement)
                    return;

                try {
                    functionList.insertBefore(activeElement, nextElement);
                } catch (err) {
                    return;
                }
                let indNext = CustomFunctions.macrosArray.findIndex(function(el) {
                    return (nextElement && el.name == nextElement.innerText)
                })
                if (indNext === -1)
                    indNext = CustomFunctions.macrosArray.length;

                if (indActive < indNext)
                    indNext--;

                let tmp = CustomFunctions.macrosArray.splice(indActive, 1)[0];
                CustomFunctions.macrosArray.splice(indNext, 0, tmp);
                CustomFunctions.current = indNext;
                indActive = 0;
                updateFunctionsMenu();
            });

            function getNextElement(cursorPosition, currentElement) {
                // cursorPosition = cursorPosition * ((1 + (1 - zoom)).toFixed(1));
                const currentElementCoord = currentElement.getBoundingClientRect();
                const currentElementCenter = currentElementCoord.y + currentElementCoord.height * 0.45;
                const nextElement = (cursorPosition < currentElementCenter) ? currentElement : currentElement.nextElementSibling;
                return nextElement;
            };

            macrosList.addEventListener('dragover', function(evt) {
                currentElement = evt.target;
                let bDragAllowed = true || !!((CurrentElementModeType.Macros === CurrentElementMode) && currentElement.id.includes('mac'));
                evt.preventDefault();
                evt.dataTransfer.dropEffect = bDragAllowed ? "move" : "none";
                const isMoveable = currentElement.classList.contains('draggable');
                if (!isMoveable)
                    return;

                nextElement = getNextElement(evt.clientY, currentElement);
                $('.dragHovered').removeClass("dragHovered")
                if (nextElement) {
                    if($(nextElement).attr('role') == 'listitem') {
                        $(macrosList).find('.item').last().removeClass(['dragHovered', 'last']);
                        nextElement.classList.add('dragHovered');
                    } else {
                        $(macrosList).find('.item').last().addClass(['dragHovered', 'last']);
                    }
                }
            });

            functionList.addEventListener('dragover', function(evt) {
                currentElement = evt.target;
                let bDragAllowed = false && !!((CurrentElementModeType.CustomFunction === CurrentElementMode) && currentElement.id.includes('function'));
                evt.preventDefault();
                evt.dataTransfer.dropEffect = bDragAllowed ? "move" : "none";
                const isMoveable = currentElement.classList.contains('draggable');
                if (!isMoveable)
                    return;

                nextElement = getNextElement(evt.clientY, currentElement);
                $('.dragHovered').removeClass("dragHovered")
                if (nextElement)
                    nextElement.classList.add('dragHovered');
            });
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
                            value: item.get('value'),
                        }
                    }),
                    // TODO: Изменить на выбранный элемент 
                    current: -1
                }));
            }

            this.close();
        },

        onCreateMacros: function() {
            var indexMax = 0;
            var macrosTranslate = this.textMacros;
            this.listMacros.store.each(function(macros, index) {
                var macrosName = macros.get('name');
                if (0 == macrosName.indexOf("Macros"))
                {
                    var index = parseInt(macrosName.substr(6));
                    if (!isNaN(index) && (indexMax < index))
                        indexMax = index;
                }
                else if (0 == macrosName.indexOf(macrosTranslate))
                {
                    var index = parseInt(macrosName.substr(macrosTranslate.length));
                    if (!isNaN(index) && (indexMax < index))
                        indexMax = index;
                }
            });
            indexMax++;
            this.listMacros.store.add({
                name : (macrosTranslate + " " + indexMax),
                value : "(function()\n{\n})();",
                autostart: false
            });
            this.listMacros.selectRecord(this.listMacros.store.at(-1));

            // TODO:СДЕЛАЙ ЭТО!!!
            // CurrentElementMode = CurrentElementModeType.Macros;
            // editor.focus();
        },
        onAddListMacrosItem: function(listView, itemView) {
            itemView.$el.attr('draggable', true);
            itemView.$el.addClass('draggable');
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

            this.windowRename.show();
        },
        onDeleteMacros: function() {
            if(!this._state.macrosItemMenuOpen) return;

            var deletedIndex = this.listMacros.store.indexOf(this._state.macrosItemMenuOpen);
            this.listMacros.store.remove(this._state.macrosItemMenuOpen);
            if(this.listMacros.store.length > 0) {
                var selectedIndex = deletedIndex < this.listMacros.store.length
                    ? deletedIndex
                    : this.listMacros.store.length - 1;
                this.listMacros.selectByIndex(selectedIndex);
            }
        },
        onCopyMacros: function() {
            if(!this._state.macrosItemMenuOpen) return;

            this.listMacros.store.add({
                name: this._state.macrosItemMenuOpen.get('name') + '_copy',
                value: this._state.macrosItemMenuOpen.get('value'),
                autostart: this._state.macrosItemMenuOpen.get('autostart')
            });
            this.listMacros.selectRecord(this.listMacros.store.at(-1));
        },
        onRenderWindowRename: function(windowView) {
            var buttons = $(windowView.$window[0]).find('.btn');
            buttons.on('click', (e) => {
                var type = $(e.target).attr('result');
                console.log(type);
                windowView.hide();
            });
        },

        onHelp: function() {
            window.open('https://api.onlyoffice.com/plugin/macros', '_blank')
        },
        onClose: function() {
            console.log('Close');
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
        tipMacrosRun        : 'Run',
        tipMacrosAdd        : 'Add macros',
        tipFunctionAdd      : 'Add custom function',
    }, Common.Views.MacrosDialog || {}))
});
