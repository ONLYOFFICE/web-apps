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
 * User: Julia.Radzhabova
 * Date: 30.07.19
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Button',
    'common/main/lib/component/ListView',
    'common/main/lib/component/InputField',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ComboDataView'
], function (template) {
    'use strict';

    SSE.Views.Spellcheck = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-spellcheck',

        template: _.template([
            '<div id="spellcheck-box" class="layout-ct vbox active" style="padding-left: 15px; padding-right: 15px; padding-top: 20px; width: 100%; position: relative;">',
            '<div id="spellcheck-header" style="font-size: 14px; padding-bottom: 16px;"><%= scope.txtSpelling %></div>',
            '<div style="display: flex; width: 100%; padding-bottom: 8px;"><div id="spellcheck-current-word" style="vertical-align: top; width: 100%; display: inline-block;"></div><div id="spellcheck-next" style="display: inline-block;"></div></div>',
            '<div id="spellcheck-suggestions-list" style="width: 100%; height: 100px; background-color: #fff; margin-bottom: 8px;"></div>',
            '<div id="spellcheck-change" style="width: 105px; display: inline-block; padding-bottom: 16px;"></div><div id="spellcheck-ignore" class="padding-large" style="margin-left: 19px; width: 105px; display: inline-block;"></div>',
            '<button class="btn btn-text-default auto" id="spellcheck-add-to-dictionary" style="min-width: 105px; display: block; margin-bottom: 16px;"><%= scope.txtAddToDictionary %></button>',
            '<label class="header"><%= scope.txtDictionaryLanguage %></label><div id="spellcheck-dictionary-language" style="margin-top: 3px; padding-bottom: 16px;"></div>',
            '<div id="spellcheck-complete" style="display: flex;" class="hidden"><i class="img-commonctrl img-complete" style="display: inline-block;margin-right: 10px;"></i><%= scope.txtComplete %></div>',
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

            this.currentWord = new Common.UI.InputField({
                el : $('#spellcheck-current-word'),
                allowBlank  : true,
                validateOnBlur: false,
                disabled: true
            });

            this.buttonNext = new Common.UI.Button({
                style: 'margin-left: 5px; width: 22px; height: 22px; border: 1px solid #cfcfcf;',
                cls: 'btn-toolbar bg-white',
                iconCls: 'btn-spellcheck-next'
            });
            this.buttonNext.render($('#spellcheck-next'));

            this.suggestionList = new Common.UI.ListView({
                el: $('#spellcheck-suggestions-list'),
                emptyText: this.noSuggestions,
                store: new Common.UI.DataViewStore()
            });

            this.btnChange = new Common.UI.Button({
                cls: 'btn-text-split-default',
                caption: this.textChange,
                split: true,
                width: 105,
                disabled: true,
                menu        : new Common.UI.Menu({
                    style       : 'min-width: 105px;',
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
                })
            });
            this.btnChange.render( $('#spellcheck-change')) ;

            this.btnIgnore = new Common.UI.Button({
                cls: 'btn-text-split-default',
                caption: this.textIgnore,
                split: true,
                width: 105,
                disabled: true,
                menu        : new Common.UI.Menu({
                    style       : 'min-width: 105px;',
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
                })
            });
            this.btnIgnore.render( $('#spellcheck-ignore')) ;

            this.cmbDictionaryLanguage = new Common.UI.ComboBox({
                el          : $('#spellcheck-dictionary-language'),
                style       : 'width: 230px',
                menuStyle   : 'min-width: 230px;max-height: 200px;',
                editable    : false,
                cls         : 'input-group-nr'
            });

            this.btnToDictionary = new Common.UI.Button({
                el: $('#spellcheck-add-to-dictionary')
            });

            this.lblComplete = this.$el.find('#spellcheck-complete');
            this.trigger('render:after', this);
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

        txtSpelling: 'Spelling',
        noSuggestions: 'No spelling suggestions',
        textChange: 'Change',
        textChangeAll: 'Change All',
        textIgnore: 'Ignore',
        textIgnoreAll: 'Ignore All',
        txtAddToDictionary: 'Add To Dictionary',
        txtDictionaryLanguage: 'Dictionary Language',
        txtComplete: 'Spellcheck has been complete'

    }, SSE.Views.Spellcheck || {}));
});