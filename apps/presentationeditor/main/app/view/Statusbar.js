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
 *  StatusBar View
 *
 *  Created by Maxim Kadushkin on 8 April 2014
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/main/app/template/StatusBar.template',
    'backbone',
    'tip',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'presentationeditor/main/app/model/Pages'
 ], function(template, Backbone){
        'use strict';

        function _onCountPages(count){
            if (this.pages.get('count')<0)
                $('#status-label-pages').css('display', 'inline-block');

            this.pages.set('count', count);
            var isDisabled = (count<=0);
            if (this.btnPreview.isDisabled() !== isDisabled)
                this.btnPreview.setDisabled(isDisabled);
        }

        function _onCurrentPage(number){
            this.pages.set('current', number+1);
        }

        var _tplPages = _.template('Slide <%= current %> of <%= count %>');

        function _updatePagesCaption(model,value,opts) {
            $('#status-label-pages').text(
                Common.Utils.String.format(this.pageIndexText, model.get('current'), model.get('count')) );
        }

        function _clickLanguage(menu, item, state) {
            var $parent = menu.$el.parent();
            $parent.find('#status-label-lang').text(item.caption);
            this.langMenu.prevTip = item.value.value;

            this.fireEvent('langchanged', [this, item.value.code, item.caption]);
        }

        PE.Views.Statusbar = Backbone.View.extend(_.extend({
            el: '#statusbar',
            template: _.template(template),

            events: {},

            api: undefined,
            pages: undefined,

            initialize: function (options) {
                _.extend(this, options);
                this.pages = new PE.Models.Pages({current:1, count:-1});
                this.pages.on('change', _.bind(_updatePagesCaption,this));
                this._state = {no_paragraph: true};
            },

            render: function () {
                var me = this;
                $(this.el).html(this.template({
                    scope: this
                }));

                this.btnZoomToPage = new Common.UI.Button({
                    el: $('#btn-zoom-topage',this.el),
                    hint: this.tipFitPage,
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnZoomToWidth = new Common.UI.Button({
                    el: $('#btn-zoom-towidth',this.el),
                    hint: this.tipFitWidth,
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnZoomDown = new Common.UI.Button({
                    el: $('#btn-zoom-down',this.el),
                    hint: this.tipZoomOut+Common.Utils.String.platformKey('Ctrl+-'),
                    hintAnchor: 'top'
                });

                this.btnZoomUp = new Common.UI.Button({
                    el: $('#btn-zoom-up',this.el),
                    hint: this.tipZoomIn+Common.Utils.String.platformKey('Ctrl++'),
                    hintAnchor: 'top-right'
                });

                this.cntZoom = new Common.UI.Button({
                    el: $('.cnt-zoom',this.el),
                    hint: this.tipZoomFactor,
                    hintAnchor: 'top'
                });
                this.cntZoom.cmpEl.on('show.bs.dropdown', function () {
                        _.defer(function(){
                            me.cntZoom.cmpEl.find('ul').focus();
                        }, 100);
                    }
                );
                this.cntZoom.cmpEl.on('hide.bs.dropdown', function () {
                        _.defer(function(){
                            me.api.asc_enableKeyEvents(true);
                        }, 100);
                    }
                );

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
                        { caption: "200%", value: 200 }
                    ]
                });
                this.zoomMenu.render($('.cnt-zoom',this.el));
                this.zoomMenu.cmpEl.attr({tabindex: -1});

                this.txtGoToPage = new Common.UI.InputField({
                    el          : $('#status-goto-page'),
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
                }).on('keypress:after', function(input, e) {
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
                    }
                ).on('keyup:after', function(input, e) {
                        if (e.keyCode === Common.UI.Keys.ESC) {
                            var box = me.$el.find('#status-goto-box');
                            box.focus();                        // for IE
                            box.parent().removeClass('open');
                            me.api.asc_enableKeyEvents(true);
                            return false;
                        }
                    }
                );

                var goto = this.$el.find('#status-goto-box');
                goto.on('click', function() {
                    return false;
                });
                goto.parent().on('show.bs.dropdown',
                    function () {
                        me.txtGoToPage.setValue(me.api.getCurrentPage() + 1);
                        me.txtGoToPage.checkValidate();
                        var edit = me.txtGoToPage.$el.find('input');
                        _.defer(function(){edit.focus(); edit.select();}, 100);

                    }
                );
                goto.parent().on('hide.bs.dropdown',
                    function () { var box = me.$el.find('#status-goto-box');
                        if (me.api && box) {
                            box.focus();                        // for IE
                            box.parent().removeClass('open');

                            me.api.asc_enableKeyEvents(true);
                        }
                    }
                );

                this.btnPreview = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'btn-preview',
                    hint: this.tipPreview,
                    hintAnchor: 'top',
                    split: true,
                    menu: new Common.UI.Menu({
                        menuAlign: 'bl-tl',
                        style: 'margin-top:-5px;',
                        items: [
                            {caption: this.textShowBegin, value: 0},
                            {caption: this.textShowCurrent, value: 1},
                            {caption: this.textShowPresenterView, value: 2}
                        ]
                    })
                });
                this.btnPreview.render($('#slot-status-btn-preview'));

                this.btnDocLanguage = new Common.UI.Button({
                    el: $('#btn-doc-lang',this.el),
                    hint: this.tipSetDocLang,
                    hintAnchor: 'top',
                    disabled: true
                });

                this.btnSetSpelling = new Common.UI.Button({
                    el: $('#btn-doc-spell',this.el),
                    enableToggle: true,
                    hint: this.tipSetSpelling,
                    hintAnchor: 'top'
                });

                var panelLang = $('.cnt-lang',this.el);
                this.langMenu = new Common.UI.Menu({
                    cls: 'lang-menu',
                    style: 'margin-top:-5px;',
                    maxHeight: 300,
                    restoreHeight: 300,
                    itemTemplate: _.template([
                        '<a id="<%= id %>" tabindex="-1" type="menuitem" style="padding-left: 28px !important;" langval="<%= options.value.value %>">',
                            '<i class="icon <% if (options.spellcheck) { %> img-toolbarmenu spellcheck-lang <% } %>"></i>',
                            '<%= caption %>',
                        '</a>'
                    ].join('')),
                    menuAlign: 'bl-tl'
                }).on('show:before', function (mnu) {
                    if (!this.scroller) {
                        this.scroller = new Common.UI.Scroller({
                            el: $(this.el).find('.dropdown-menu '),
                            useKeyboard: this.enableKeyEvents && !this.handleSelect,
                            minScrollbarLength: 30,
                            alwaysVisibleY: true
                        });
                    }
                });

                this.btnLanguage = new Common.UI.Button({
                    el: panelLang,
                    hint: this.tipSetLang,
                    hintAnchor: 'top-left',
                    disabled: true
                });
                this.btnLanguage.cmpEl.on({
                    'show.bs.dropdown': function () {
                        _.defer(function(){
                            me.btnLanguage.cmpEl.find('ul').focus();
                        }, 100);
                    },
                    'hide.bs.dropdown': function () {
                        _.defer(function(){
                            me.api.asc_enableKeyEvents(true);
                        }, 100);
                    },
                    'click': function (e) {
                        if (me.btnLanguage.isDisabled()) {
                            return false;
                        }
                    }
                });

                this.langMenu.render(panelLang);
                this.langMenu.cmpEl.attr({tabindex: -1});
                this.langMenu.prevTip = 'en';
                this.langMenu.on('item:click', _.bind(_clickLanguage,this));

                return this;
            },

            setApi: function(api) {
                this.api = api;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onCountPages',   _.bind(_onCountPages, this));
                    this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(_onCurrentPage, this));
                    this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onApiFocusObject, this));
                    Common.NotificationCenter.on('api:disconnect',     _.bind(this.onApiCoAuthoringDisconnect, this));
                }

                return this;

            },

            setMode: function(mode) {
                this.mode = mode;
                this.$el.find('.el-edit')[this.mode.isEdit?'show':'hide']();
            },

            setVisible: function(visible) {
                visible
                    ? this.show()
                    : this.hide();
            },

            showStatusMessage: function(message) {
                $('#status-label-action').text(message);
            },

            clearStatusMessage: function() {
                $('#status-label-action').text('');
            },

            reloadLanguages: function(array) {
                this.langMenu.removeAll();
                _.each(array, function(item) {
                    this.langMenu.addItem({
                        caption     : item['displayValue'],
                        value       : {value: item['value'], code: item['code']},
                        checkable   : true,
                        checked     : this.langMenu.saved == item['displayValue'],
                        spellcheck   : item['spellcheck'],
                        toggleGroup : 'language'
                    });
                }, this);

                if (this.langMenu.items.length>0) {
                    this.btnLanguage.setDisabled(false || this._state.no_paragraph);
                    this.btnDocLanguage.setDisabled(!!this.mode.isDisconnected);
                }
            },

            setLanguage: function(info) {
                if (this.langMenu.prevTip != info.value && info.code !== undefined) {
                    var $parent = $(this.langMenu.el.parentNode, this.$el);
                    $parent.find('#status-label-lang').text(info.displayValue);

                    this.langMenu.prevTip = info.value;

                    var index = $parent.find('ul li a:contains("'+info.displayValue+'")').parent().index();
                    if (index < 0) {
                        this.langMenu.saved = info.displayValue;
                        this.langMenu.clearAll();
                    } else
                        this.langMenu.items[index].setChecked(true);
                }
            },

            SetDisabled: function(disable) {
                var langs = this.langMenu.items.length>0;
                this.btnLanguage.setDisabled(disable || !langs || this._state.no_paragraph);
                this.btnDocLanguage.setDisabled(disable || !langs);
                this.mode.isEdit = !disable;
            },

            onApiFocusObject: function(selectedObjects) {
                if (!this.mode || !this.mode.isEdit) return;

                this._state.no_paragraph = true;
                var i = -1;
                while (++i < selectedObjects.length) {
                    var type = selectedObjects[i].get_ObjectType();
                    if (type == Asc.c_oAscTypeSelectElement.Paragraph || type == Asc.c_oAscTypeSelectElement.Shape || type == Asc.c_oAscTypeSelectElement.Chart || type == Asc.c_oAscTypeSelectElement.Table) {
                        this._state.no_paragraph = selectedObjects[i].get_ObjectValue().get_Locked();
                        if (this._state.no_paragraph) break;  // break if one of the objects is locked
                    }
                }
                this._state.no_paragraph = this._state.no_paragraph || this.langMenu.items.length<1;
                if (this._state.no_paragraph !== this.btnLanguage.isDisabled())
                    this.btnLanguage.setDisabled(this._state.no_paragraph);
            },

            onApiCoAuthoringDisconnect: function() {
                this.setMode({isDisconnected:true});
                this.SetDisabled(true);
            },

            pageIndexText   : 'Slide {0} of {1}',
            goToPageText    : 'Go to Slide',
            tipFitPage      : 'Fit to Slide',
            tipFitWidth     : 'Fit to Width',
            tipZoomIn       : 'Zoom In',
            tipZoomOut      : 'Zoom Out',
            tipZoomFactor   : 'Magnification',
            txtPageNumInvalid: 'Slide number invalid',
            tipPreview      : 'Start Slideshow',
            tipAccessRights : 'Manage document access rights',
            tipSetLang      : 'Set Text Language',
            tipSetDocLang   : 'Set Document Language',
            tipSetSpelling  : 'Spell checking',
            textShowBegin: 'Show from Beginning',
            textShowCurrent: 'Show from Current slide',
            textShowPresenterView: 'Show presenter view'
        }, PE.Views.Statusbar || {}));
    }
);