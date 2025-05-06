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
 *  MacrosAiDialog.js
 *
 *  Created on 23.04.2025
 *
 */

define([], function () { 'use strict';

    Common.Views.MacrosAiDialog = Common.UI.Window.extend(_.extend({

        initialize : function(options) {
            var _options = {};

            var windowSize = {
                width: { init: 400, min: 400, max: 800 },
                height: { init: 200, min: 200, max: 400 }
            };
            var windowClasses = 'modal-dlg invisible-borders';

            if(options.inputType == 'codeEditor') {
                windowSize = {
                    width: { init: 600, min: 600, max: 1000 },
                    height: { init: 400, min: 400, max: 600 }
                }
                windowClasses += ' padding-none';
            }

            _.extend(_options, {
                id: 'macros-ai-dialog',
                title: options.title,
                width: windowSize.width.init,
                height: windowSize.height.init,
                minwidth: windowSize.width.min,
                minheight: windowSize.height.min,
                maxwidth: windowSize.width.max,
                maxheight: windowSize.height.max,
                resizable: true,
                cls: windowClasses,
                buttons: [
                    {caption: this.textCreate, value: 'ok', primary: true},
                    'cancel'
                ]
            }, options || {});

            this.api = options.api;
            this.instruction = options.instruction;
            this.inputType = options.inputType || 'textarea';       //'textarea' or 'codeEditor'

            this._state = {
                codeEditorValue: ''
            };

            if(this.inputType == 'textarea') {
                this.template = [
                    '<div class="box">',
                        '<div id="macros-ai-dialog-textarea"></div>',
                    '</div>'
                ].join('');
            } else {
                this.template = [
                    '<div id="macros-ai-dialog-code-editor"></div>',
                    '<div class="separator horizontal" style="position: relative"></div>'
                ].join('');
            }

            _options.tpl = _.template(this.template)(_options);
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            var $window = this.getChild();

            if(this.inputType == 'textarea') {
                this.textareaPrompt = new Common.UI.TextareaField({
                    el          : $window.find('#macros-ai-dialog-textarea'),
                    placeHolder : this.textAreaPlaceholder
                });
            } else {
                this.createCodeEditor();
            }            

            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));
        },

        createCodeEditor: function() {
            var me = this;

            this.codeEditor = new Common.UI.MonacoEditor({
                parentEl: '#macros-ai-dialog-code-editor',
                language: 'vba'
            });
            this.codeEditor.on('ready', function() {
                me.codeEditor.updateTheme();
                me.codeEditor.setValue('', {row: 0, column: 0});
            });
            this.codeEditor.on('change', function(value, pos) {
                me._state.codeEditorValue = value;
            });
        },

        getFocusedComponents: function() {
            return [].concat(this.getFooterButtons());
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            if(this.textareaPrompt) {
                var me = this;
                _.delay(function(){
                    me.textareaPrompt.focus();
                },50);
            }
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        close: function(suppressevent) {
            if(this.codeEditor) {
                this.codeEditor.destroyEditor();
            }
            Common.UI.Window.prototype.close.call(this, arguments);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if(state == 'ok') {
                    var me = this;
                    var content = this.inputType == 'textarea' ? this.textareaPrompt.getValue() : this._state.codeEditorValue;
                    me.api.AI({ type : "text", data : [{role: "system", content: this.instruction}, {role:"user", content: content}] }, function(data){
                        if (!data.error) {
                            if(!data || !data.text) {
                                return me._handleInput("cancel");
                            }
                            
                            function trimResult(data, posStart, isSpaces) {
                                let pos = posStart || 0;
                                if (-1 != pos) {
                                    let trimC = ["\"", "'", "\n", "\r"];
                                    if (true === isSpaces)
                                        trimC.push(" ");
                                    while (pos < data.length && trimC.includes(data[pos]))
                                        pos++;
                        
                                    let posEnd = data.length - 1;
                                    while (posEnd > 0 && trimC.includes(data[posEnd]))
                                        posEnd--;
                        
                                    if (posEnd > pos)
                                        return data.substring(pos, posEnd + 1);				
                                }
                                return data;
                            }

                            var cleanResult = data.text.replace(/```javascript|```/g, "");
                            cleanResult = trimResult(cleanResult, 0, true);
                            me.close();
                            me.options.handler.call(me, state, cleanResult);
                        } else {
                            if ("no-engine" === data.type)
                                return me._handleInput("cancel");

                            console.log(data.error);
                        }
                    });
                } else {
                    this.close();
                    this.options.handler.call(this, state);
                }
            }
        },

        textCreate                  : 'Create',
        textAreaPlaceholder         : 'Input a prompt for the query',
    }, Common.Views.MacrosAiDialog || {}));
});