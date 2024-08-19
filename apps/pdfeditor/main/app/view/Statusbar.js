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

define([
    'text!pdfeditor/main/app/template/StatusBar.template',
    'jquery',
    'underscore',
    'backbone',
    'tip',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'pdfeditor/main/app/model/Pages'
 ],
    function(template, $, _, Backbone){
        'use strict';

        function _onCountPages(count){
            this.pages.set('count', count);
            this.btnPagePrev && this.btnPagePrev.setDisabled(this.pages.get('current')<1);
            this.btnPageNext && this.btnPageNext.setDisabled(this.pages.get('current')>=this.pages.get('count')-1);
        }

        function _onCurrentPage(number){
            this.pages.set('current', number+1);
            this.btnPagePrev && this.btnPagePrev.setDisabled(number<1);
            this.btnPageNext && this.btnPageNext.setDisabled(number>=this.pages.get('count')-1);
        }

        var _tplPages = _.template('Page <%= current %> of <%= count %>');

        function _updatePagesCaption(model,value,opts) {
            $('.statusbar #label-pages',this.$el).text(
                Common.Utils.String.format(this.pageIndexText, model.get('current'), model.get('count')) );
        }

        function _onAppReady(config) {
            var me = this;
            if (config.canUseSelectHandTools) {
                me.btnSelectTool.updateHint(me.tipSelectTool);
                me.btnHandTool.updateHint(me.tipHandTool);
            }
            me.btnZoomToPage.updateHint(me.tipFitPage);
            me.btnZoomToWidth.updateHint(me.tipFitWidth);
            me.btnZoomDown.updateHint(me.tipZoomOut + Common.Utils.String.platformKey('Ctrl+-'));
            me.btnZoomUp.updateHint(me.tipZoomIn + Common.Utils.String.platformKey('Ctrl++'));
            me.btnPagePrev.updateHint(me.tipPagePrev);
            me.btnPageNext.updateHint(me.tipPageNext);

            me.cntZoom.updateHint(me.tipZoomFactor);
            me.cntZoom.cmpEl.on({
                'show.bs.dropdown': function () {
                    _.defer(function(){
                        me.cntZoom.cmpEl.find('ul').focus();
                    }, 100);
                },
                'hide.bs.dropdown': function () {
                    _.defer(function(){
                        me.api.asc_enableKeyEvents(true);
                    }, 100);
                }
            });

            me.txtGoToPage.on({
                    'keypress:after': function (input, e) {
                        if (e.keyCode === Common.UI.Keys.RETURN) {
                            var box = me.$el.find('#status-goto-box'),
                                edit = box.find('input[type=text]'), page = parseInt(edit.val());
                            if (!page || page-- > me.pages.get('count') || page < 0) {
                                edit.select();
                                return false;
                            }

                            box.focus();                        // for IE
                            box.parent().removeClass('open');

                            me.api.goToPage(page);
                            me.api.asc_enableKeyEvents(true);

                            return false;
                        }
                    },
                    'keyup:after': function (input, e) {
                        if (e.keyCode === Common.UI.Keys.ESC) {
                            var box = me.$el.find('#status-goto-box');
                            box.focus();                        // for IE
                            box.parent().removeClass('open');
                            me.api.asc_enableKeyEvents(true);
                            return false;
                        }
                    }
            });

            var goto = me.$el.find('#status-goto-box');
            goto.on('click', function() {
                return false;
            });
            goto.parent().on({
                'show.bs.dropdown': function () {
                    me.txtGoToPage.setValue(me.api.getCurrentPage() + 1);
                    me.txtGoToPage.checkValidate();
                    var edit = me.txtGoToPage.$el.find('input');
                    _.defer(function(){
                        edit.focus().select();
                    }, 100);
                },
                'hide.bs.dropdown': function () {
                    var box = me.$el.find('#status-goto-box');
                    if (me.api && box) {
                        box.focus();                        // for IE
                        box.parent().removeClass('open');

                        me.api.asc_enableKeyEvents(true);
                    }
                }
            });

            me.zoomMenu.on('item:click', function(menu, item) {
                me.fireEvent('zoom:value', [item.value]);
            });
        }

        PDFE.Views.Statusbar = Backbone.View.extend(_.extend({
            el: '#statusbar',
            template: _.template(template),

            events: {
            },

            api: undefined,
            pages: undefined,

            initialize: function (options) {
                _.extend(this, options);
                this.pages = new PDFE.Models.Pages({current:1, count:1});
                this.pages.on('change', _.bind(_updatePagesCaption,this));
                this._state = {
                };
                this._isDisabled = false;

                var me = this;
                this.$layout = $(this.template({
                    textGotoPage: this.goToPageText,
                    textPageNumber: Common.Utils.String.format(this.pageIndexText, 1, 1)
                }));

                this.btnSelectTool = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'select-tools',
                    enableToggle: true,
                    allowDepress: false
                });

                this.btnHandTool = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'select-tools',
                    enableToggle: true,
                    allowDepress: false
                });

                this.btnZoomToPage = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnZoomToWidth = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.cntZoom = new Common.UI.Button({
                    hintAnchor: 'top'
                });

                this.btnZoomDown = new Common.UI.Button({
                    hintAnchor: 'top'
                });

                this.btnZoomUp = new Common.UI.Button({
                    hintAnchor: 'top-right'
                });

                this.zoomMenu = new Common.UI.Menu({
                    style: 'margin-top:-5px;',
                    menuAlign: 'bl-tl',
                    items: [
                        { caption: "50%", value: 50 },
                        { caption: "75%", value: 75 },
                        { caption: "100%", value: 100 },
                        { caption: "125%", value: 125 },
                        { caption: "150%", value: 150 },
                        { caption: "175%", value: 175 },
                        { caption: "200%", value: 200 },
                        { caption: "300%", value: 300 },
                        { caption: "400%", value: 400 },
                        { caption: "500%", value: 500 }
                    ]
                });

                this.txtGoToPage = new Common.UI.InputField({
                    allowBlank  : true,
                    validateOnChange: true,
                    style       : 'width: 60px;',
                    maskExp: /[0-9]/,
                    validation  : function(value) {
                        if (/(^[0-9]+$)/.test(value)) {
                            value = parseInt(value);
                            if (undefined !== value && value > 0 && value <= me.pages.get('count'))
                                return true;
                        }

                        return me.txtPageNumInvalid;
                    }
                });

                this.btnPagePrev = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-previtem',
                    disabled: true,
                    hintAnchor  : 'top',
                    dataHint    : '0',
                    dataHintDirection: 'top'
                });

                this.btnPageNext = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-nextitem',
                    disabled: true,
                    hintAnchor  : 'top-left',
                    dataHint    : '0',
                    dataHintDirection: 'top'
                });

                var promise = new Promise(function (accept, reject) {
                    accept();
                });

                Common.NotificationCenter.on('app:ready', function(mode) {
                    promise.then( _onAppReady.bind(this, mode) );
                }.bind(this));
            },

            render: function(config) {
                var me = this;

                function _btn_render(button, slot) {
                    button.setElement(slot, false);
                    button.render();
                }

                this.fireEvent('render:before', [this.$layout]);

                _btn_render(me.btnZoomToPage, $('#btn-zoom-topage', me.$layout));
                _btn_render(me.btnZoomToWidth, $('#btn-zoom-towidth', me.$layout));
                _btn_render(me.cntZoom, $('.cnt-zoom',me.$layout));
                _btn_render(me.btnZoomDown, $('#btn-zoom-down', me.$layout));
                _btn_render(me.btnZoomUp, $('#btn-zoom-up', me.$layout));
                _btn_render(me.txtGoToPage, $('#status-goto-page', me.$layout));

                me.zoomMenu.render($('.cnt-zoom',me.$layout));
                me.zoomMenu.cmpEl.attr({tabindex: -1});
                me.btnPagePrev.render($('#slot-status-btn-prev', me.$layout));
                me.btnPageNext.render($('#slot-status-btn-next', me.$layout));

                if (config.canUseSelectHandTools) {
                    _btn_render(me.btnSelectTool, $('#status-btn-select-tool', me.$layout));
                    _btn_render(me.btnHandTool, $('#status-btn-hand-tool', me.$layout));
                }

                this.$el.html(me.$layout);
                this.fireEvent('render:after', [this]);

                return this;
            },

            setApi: function(api) {
                this.api = api;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onCountPages',   _.bind(_onCountPages, this));
                    this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(_onCurrentPage, this));
                    this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('api:disconnect',      _.bind(this.onApiCoAuthoringDisconnect, this));
                }
                return this;

            },

            setMode: function(mode) {
                this.mode = mode;
            },

            setVisible: function(visible) {
                visible
                    ? this.show()
                    : this.hide();
            },

            isVisible: function() {
                return this.$el && this.$el.is(':visible');
            },

            getStatusLabel: function() {
                return $('.statusbar #label-action');
            },

            showStatusMessage: function(message) {
                this.getStatusLabel().text(message);
            },

            clearStatusMessage: function() {
                this.getStatusLabel().text('');
            },

            SetDisabled: function(disable) {
                this._isDisabled = disable;
            },

            onApiCoAuthoringDisconnect: function() {
                this.setMode({isDisconnected:true});
                this.SetDisabled(true);
            },

            pageIndexText       : 'Page {0} of {1}',
            goToPageText        : 'Go to Page',
            tipFitPage          : 'Fit to Page',
            tipFitWidth         : 'Fit to Width',
            tipZoomIn           : 'Zoom In',
            tipZoomOut          : 'Zoom Out',
            tipZoomFactor       : 'Magnification',
            txtPageNumInvalid   : 'Page number invalid',
            tipPagePrev: 'Go to previous page',
            tipPageNext: 'Go to nex page',
            tipSelectTool       : 'Select tool',
            tipHandTool         : 'Hand tool'
        }, PDFE.Views.Statusbar || {}));
    }
);