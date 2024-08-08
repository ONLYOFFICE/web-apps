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
 * Date: 30.07.19
 */

define([], function () {
    'use strict';

    SSE.Views.Spellcheck = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-spellcheck',

        template: _.template([
            '<div id="spellcheck-box" class="layout-ct active">',
                '<div class="spellcheck-settings">',
                    '<div class="spellcheck-settings-inner">',
                        '<div style="display: flex; width: 100%; padding-bottom: 8px; padding-top: 16px;">',
                            '<div id="spellcheck-current-word"></div>',
                            '<div id="spellcheck-next" style=""></div>',
                        '</div>',
                        '<div id="spellcheck-suggestions-list"></div>',
                        '<div id="spellcheck-change" style=""></div>',
                        '<div id="spellcheck-ignore" class="padding-large margin-left-9"></div>',
                        '<button class="btn btn-text-default auto" id="spellcheck-add-to-dictionary" data-hint="1" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtAddToDictionary %></button>',
                        '<label class="header" style="display: block;"><%= scope.txtDictionaryLanguage %></label>',
                        '<div id="spellcheck-dictionary-language"></div>',
                        '<div id="spellcheck-complete" class="hidden">',
                            '<i class="btn-resolve margin-right-10"></i>',
                            '<%= scope.txtComplete %>' ,
                        '</div>',
                    '</div>',
                '</div>',
                '<div id="spellcheck-header">',
                    '<label role="heading"><%= scope.txtSpelling %></label>',
                    '<div id="spellcheck-btn-close" class="float-right margin-left-4"></div>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el = el || this.el;
            this.$el = $(el);
            this.$el.html(this.template({scope: this}));

            this.buttonClose = new Common.UI.Button({
                parentEl: $('#spellcheck-btn-close', this.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-close',
                hint: this.txtClosePanel,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.buttonClose.on('click', _.bind(this.onClickClosePanel, this));

            this.currentWord = new Common.UI.InputField({
                el : $('#spellcheck-current-word'),
                allowBlank  : true,
                validateOnBlur: false,
                disabled: true,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'big'
            });

            this.buttonNext = new Common.UI.Button({
                parentEl: $('#spellcheck-next'),
                cls: 'btn-toolbar bg-white',
                iconCls: 'toolbar__icon btn-nextitem',
                hint: this.txtNextTip,
                dataHint: '1',
                dataHintDirection: 'bottom'
            });

            this.suggestionList = new Common.UI.ListView({
                el: $('#spellcheck-suggestions-list'),
                emptyText: this.noSuggestions,
                store: new Common.UI.DataViewStore(),
                scrollAlwaysVisible: true,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'big'
            });

            this.btnChange = new Common.UI.Button({
                parentEl: $('#spellcheck-change'),
                cls: 'btn-text-split-default',
                caption: this.textChange,
                split: true,
                width: 110,
                disabled: true,
                menu        : new Common.UI.Menu({
                    style       : 'min-width: 110px',
                    items: [
                        {
                            caption: this.textChange,
                            value: 0
                        },
                        {
                            caption: this.textChangeAll,
                            value: 1
                        }
                        ]
                }),
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.btnIgnore = new Common.UI.Button({
                parentEl: $('#spellcheck-ignore'),
                cls: 'btn-text-split-default',
                caption: this.textIgnore,
                split: true,
                width: 110,
                disabled: true,
                menu        : new Common.UI.Menu({
                    style       : 'min-width: 110px;',
                    items: [
                        {
                            caption: this.textIgnore,
                            value: 0
                        },
                        {
                            caption: this.textIgnoreAll,
                            value: 1
                        }
                    ]
                }),
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.cmbDictionaryLanguage = new Common.UI.ComboBox({
                el          : $('#spellcheck-dictionary-language'),
                style       : 'width: 100%',
                menuStyle   : 'width: 100%;max-height: 163px;',
                editable    : false,
                cls         : 'input-group-nr',
                scroller    : {
                    suppressScrollX: true
                },
                search: true,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.btnToDictionary = new Common.UI.Button({
                el: $('#spellcheck-add-to-dictionary'),
                disabled    : true
            });

            this.lblComplete = this.$el.find('#spellcheck-complete');
            this.trigger('render:after', this);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el.find('.spellcheck-settings-inner'),
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            $(window).on('resize', _.bind(function() {
                this.scroller.update({alwaysVisibleY: true});
            }, this));

            return this;
        },

        show: function () {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.fireEvent('show', this );
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
        },

        ChangeSettings: function(props) {
        },

        onClickClosePanel: function() {
            Common.NotificationCenter.trigger('leftmenu:change', 'hide');
        },

        txtSpelling: 'Spelling',
        noSuggestions: 'No spelling suggestions',
        textChange: 'Change',
        textChangeAll: 'Change All',
        textIgnore: 'Ignore',
        textIgnoreAll: 'Ignore All',
        txtAddToDictionary: 'Add To Dictionary',
        txtDictionaryLanguage: 'Dictionary Language',
        txtComplete: 'Spellcheck has been complete',
        txtNextTip: 'Go to the next word',
        txtClosePanel: 'Close spelling'

    }, SSE.Views.Spellcheck || {}));
});