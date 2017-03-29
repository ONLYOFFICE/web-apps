/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  Created by Maxim Kadushkin
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/StatusBar.template',
    'jquery',
    'underscore',
    'backbone',
    'tip',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'documenteditor/main/app/model/Pages'
 ],
    function(template, $, _, Backbone){
        'use strict';

        function _onCountPages(count){
            this.pages.set('count', count);
        }

        function _onCurrentPage(number){
            this.pages.set('current', number+1);
        }

        var _tplPages = _.template('Page <%= current %> of <%= count %>');

        function _updatePagesCaption(model,value,opts) {
            $('.statusbar #label-pages',this.$el).text(
                Common.Utils.String.format(this.pageIndexText, model.get('current'), model.get('count')) );
        }

        function _clickLanguage(menu, item, state) {
            var $parent = menu.$el.parent();

            $parent.find('#status-label-lang').text(item.caption);
            $parent.find('.icon-lang-flag')
                    .removeClass(this.langMenu.prevTip)
                    .addClass(item.value.tip);

            this.langMenu.prevTip = item.value.tip;

            this.fireEvent('langchanged', [this, item.value.code, item.caption]);
        }

        if ( DE.Views.Statusbar )
            var LanguageDialog = DE.Views.Statusbar.LanguageDialog || {};

        DE.Views.Statusbar = Backbone.View.extend(_.extend({
            el: '#statusbar',
            template: _.template(template),

            events: {
            },

            api: undefined,
            pages: undefined,

            initialize: function (options) {
                _.extend(this, options);
                this.pages = new DE.Models.Pages({current:1, count:1});
                this.pages.on('change', _.bind(_updatePagesCaption,this));
                this.state = {};
            },

            render: function () {
                var me = this;
                this.$el.html(this.template({
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
                    hint: this.tipZoomOut + Common.Utils.String.platformKey('Ctrl+-'),
                    hintAnchor: 'top'
                });

                this.btnZoomUp = new Common.UI.Button({
                    el: $('#btn-zoom-up',this.el),
                    hint: this.tipZoomIn + Common.Utils.String.platformKey('Ctrl++'),
                    hintAnchor: 'top-right'
                });

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

                this.btnReview = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    iconCls     : 'btn-ic-review',
                    hint        : this.tipReview,
                    hintAnchor: 'top',
                    enableToggle: true,
                    split       : true,
                    menu        : new Common.UI.Menu({
                        menuAlign: 'bl-tl',
                        style: 'margin-top:-5px;',
                        items: [
                            this.mnuTrackChanges = new Common.UI.MenuItem({
                                caption: this.textTrackChanges,
                                checkable: true,
                                value: 'track'
                            }),
                            this.mnuChangesPanel = new Common.UI.MenuItem({
                                caption: this.textChangesPanel,
                                checkable: true,
                                value: 'panel'
                            })
                        ]
                    })
                });
                this.btnReview.render($('#btn-doc-review'));
                this.btnReviewCls = 'btn-ic-review';

                var panelLang = $('.cnt-lang',this.el);
                this.langMenu = new Common.UI.Menu({
                    style: 'margin-top:-5px;',
                    maxHeight: 300,
                    itemTemplate: _.template([
                        '<a id="<%= id %>" tabindex="-1" type="menuitem">',
                            '<span class="lang-item-icon img-toolbarmenu lang-flag <%= iconCls %>"></span>',
                            '<%= caption %>',
                        '</a>'
                    ].join('')),
                    menuAlign: 'bl-tl'
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

                this.langMenu.prevTip = 'en';
                this.langMenu.on('item:click', _.bind(_clickLanguage,this));

                // Go To Page

                this.txtGoToPage = new Common.UI.InputField({
                    el          : $('#status-goto-page', me.$el),
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

                return this;
            },

            setApi: function(api) {
                this.api = api;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onCountPages',   _.bind(_onCountPages, this));
                    this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(_onCurrentPage, this));
                }

                return this;

            },

            setMode: function(mode) {
                this.mode = mode;
                this.$el.find('.el-edit')[mode.isEdit?'show':'hide']();
                this.$el.find('.el-review')[(mode.canReview && !mode.isLightVersion)?'show':'hide']();
            },

            setVisible: function(visible) {
                visible
                    ? this.show()
                    : this.hide();
            },

            reloadLanguages: function(array) {
                _.each(array, function(item) {
                    this.langMenu.addItem({
                        iconCls     : item['tip'],
                        caption     : item['title'],
                        value       : {tip: item['tip'], code: item['code']},
                        checkable   : true,
                        checked     : this.langMenu.saved == item.title,
                        toggleGroup : 'language'
                    });
                }, this);

                this.langMenu.doLayout();
                if (this.langMenu.items.length>0) {
                    this.btnLanguage.setDisabled(false);
                    this.btnDocLanguage.setDisabled(false);
                }
            },

            setLanguage: function(info) {
                if (this.langMenu.prevTip != info.tip) {
                    var $parent = $(this.langMenu.el.parentNode, this.$el);
                    $parent.find('.icon-lang-flag')
                        .removeClass(this.langMenu.prevTip)
                        .addClass(info.tip);

                    this.langMenu.prevTip = info.tip;

                    $parent.find('#status-label-lang').text(info.title);

                    var index = $parent.find('ul li a:contains("'+info.title+'")').parent().index();
                    index < 0 ? this.langMenu.saved = info.title :
                                this.langMenu.items[index-1].setChecked(true);
                }
            },

            showStatusMessage: function(message) {
                $('.statusbar #label-action').text(message);
            },

            clearStatusMessage: function() {
                $('.statusbar #label-action').text('');
            },

            SetDisabled: function(disable) {
                var langs = this.langMenu.items.length>0;
                this.btnLanguage.setDisabled(disable || !langs);
                this.btnDocLanguage.setDisabled(disable || !langs);
                if (disable) {
                    this.state.changespanel = this.mnuChangesPanel.checked;
                }
                this.mnuChangesPanel.setChecked(!disable && (this.state.changespanel==true));
                this.btnReview.setDisabled(disable);
            },

            pageIndexText       : 'Page {0} of {1}',
            goToPageText        : 'Go to Page',
            tipFitPage          : 'Fit to Page',
            tipFitWidth         : 'Fit to Width',
            tipZoomIn           : 'Zoom In',
            tipZoomOut          : 'Zoom Out',
            tipZoomFactor       : 'Magnification',
            tipSetLang          : 'Set Text Language',
            tipSetDocLang       : 'Set Document Language',
            tipSetSpelling      : 'Turn on spell checking option',
            txtPageNumInvalid   : 'Page number invalid',
            tipReview           : 'Review',
            textTrackChanges    : 'Track Changes',
            textChangesPanel    : 'Changes panel'
        }, DE.Views.Statusbar || {}));

        DE.Views.Statusbar.LanguageDialog = Common.UI.Window.extend(_.extend({
            options: {
                header: false,
                width: 350,
                cls: 'modal-dlg'
            },

            template:   '<div class="box">' +
                            '<div class="input-row">' +
                                '<label><%= label %></label>' +
                            '</div>' +
                            '<div class="input-row" id="id-document-language">' +
                            '</div>' +
                        '</div>' +
                        '<div class="footer right">' +
                            '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;"><%= btns.ok %></button>'+
                            '<button class="btn normal dlg-btn" result="cancel"><%= btns.cancel %></button>'+
                        '</div>',

            initialize : function(options) {
                _.extend(this.options, options || {}, {
                    label: this.labelSelect,
                    btns: {ok: this.btnOk, cancel: this.btnCancel}
                });
                this.options.tpl = _.template(this.template, this.options);

                Common.UI.Window.prototype.initialize.call(this, this.options);
            },

            render: function() {
                Common.UI.Window.prototype.render.call(this);

                var $window = this.getChild();
                $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

                this.cmbLanguage = new Common.UI.ComboBox({
                    el: $window.find('#id-document-language'),
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 318px; max-height: 300px;',
                    editable: false,
                    template: _.template([
                        '<span class="input-group combobox <%= cls %> combo-langs" id="<%= id %>" style="<%= style %>">',
                            '<input type="text" class="form-control">',
                            '<span class="input-lang-icon img-toolbarmenu lang-flag" style="position: absolute;"></span>',
                            '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret img-commonctrl"></span></button>',
                            '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                                '<% _.each(items, function(item) { %>',
                                    '<li id="<%= item.id %>" data-value="<%= item.value %>">',
                                        '<a tabindex="-1" type="menuitem" style="padding-left: 26px !important;">',
                                            '<span class="lang-item-icon img-toolbarmenu lang-flag <%= item.value %>" style="position: absolute;margin-left:-21px;"></span>',
                                            '<%= scope.getDisplayValue(item) %>',
                                        '</a>',
                                    '</li>',
                                '<% }); %>',
                            '</ul>',
                        '</span>'
                    ].join('')),
                    data: this.options.languages
                });

                if (this.cmbLanguage.scroller) this.cmbLanguage.scroller.update({alwaysVisibleY: true});
                this.cmbLanguage.on('selected', _.bind(this.onLangSelect, this));
                this.cmbLanguage.setValue(Common.util.LanguageInfo.getLocalLanguageName(this.options.current)[0]);
                this.onLangSelect(this.cmbLanguage, this.cmbLanguage.getSelectedRecord());
            },

            close: function(suppressevent) {
                var $window = this.getChild();
                if (!$window.find('.combobox.open').length) {
                    Common.UI.Window.prototype.close.call(this, arguments);
                }
            },

            onBtnClick: function(event) {
                if (this.options.handler) {
                    this.options.handler.call(this, event.currentTarget.attributes['result'].value, this.cmbLanguage.getValue());
                }

                this.close();
            },

            onLangSelect: function(cmb, rec, e) {
                var icon    = cmb.$el.find('.input-lang-icon'),
                    plang   = icon.attr('lang');

                if (plang) icon.removeClass(plang);
                icon.addClass(rec.value).attr('lang',rec.value);
            },

            labelSelect     : 'Select document language',
            btnCancel       : 'Cancel',
            btnOk           : 'Ok'
        }, LanguageDialog||{}));
    }
);