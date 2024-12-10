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
 * Date: 23.08.2021
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/TreeView',
    'common/main/lib/component/Slider'
], function (template) {
    'use strict';

    DE.Views.PageThumbnails = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-thumbnails',

        storeThumbnails: undefined,
        template: _.template([
            '<div id="thumbnails-box" class="layout-ct vbox">',
                '<div id="thumbnails-header">',
                    '<label><%= scope.textPageThumbnails %></label>',
                    '<div id="thumbnails-btn-close" class="float-right margin-left-4"></div>',
                    '<div id="thumbnails-btn-settings" class="float-right"></div>',
                '</div>',
                '<div id="thumbnails-list">',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            if (!this.rendered) {
                el = el || this.el;
                $(el).html(this.template({scope: this}));
                this.$el = $(el);

                this.buttonClose = new Common.UI.Button({
                    parentEl: $('#thumbnails-btn-close', this.$el),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-close',
                    hint: this.textClosePanel
                });
                this.buttonClose.on('click', _.bind(this.onClickClosePanel, this));

                this.mnuSizeSetting = new Common.UI.MenuItem({
                    template: _.template([
                        '<div id="thumbnails-size"',
                            '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                                'data-stopPropagation="true"',
                            '<% } %>', '>',
                            '<label>' + this.textThumbnailsSize + '</label>',
                            '<div class="thumbnails-sld-box">',
                                '<span class="menu-item-icon menu__icon btn-thumbnail-small"></span>',
                                '<div id="sld-thumbnails-size"></div>',
                                '<span class="menu-item-icon menu__icon btn-thumbnail-big"></span>',
                            '</div>',
                        '</div>'
                    ].join('')),
                    stopPropagation: true
                });

                this.buttonSettings = new Common.UI.Button({
                    parentEl: $('#thumbnails-btn-settings', this.$el),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-settings',
                    hint: this.textThumbnailsSettings,
                    menu: new Common.UI.Menu({
                        menuAlign: 'tr-br',
                        style: 'min-width: 198px;',
                        items: [
                            this.mnuSizeSetting,
                            {caption: '--'},
                            {
                                caption: this.textHighlightVisiblePart,
                                checkable: true,
                                value: 'highlight',
                                checked: Common.localStorage.getBool("de-thumbnails-highlight", true)
                            }
                        ]
                    })
                });
            }

            this.sldrThumbnailsSize = new Common.UI.SingleSlider({
                el: $('#sld-thumbnails-size'),
                width: 120,
                minValue: 0,
                maxValue: 100,
                value: 50
            });

            this.rendered = true;
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

        onClickClosePanel: function() {
            Common.NotificationCenter.trigger('leftmenu:change', 'hide');
        },

        textPageThumbnails: 'Page Thumbnails',
        textClosePanel: 'Close page thumbnails',
        textThumbnailsSettings: 'Thumbnails settings',
        textThumbnailsSize: 'Thumbnails size',
        textHighlightVisiblePart: 'Highlight visible part of page'

    }, DE.Views.PageThumbnails || {}));
});