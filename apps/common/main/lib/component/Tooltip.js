/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *    Tooltip.js
 *
 *    Created on 14 March 2014
 *
 */
/*
*       Configuration
*       =============
*
*       @cfg {String} title
*
*       @cfg {String} placement
*       Default value is 'top'.
*       Describes tooltips position relatively of the parent component
*       acceptable values: 'top', 'bottom', 'right', 'left', 'top-right/left', 'bottom-right/left', 'cursor'
*       If placement = 'cursor', tooltip doesn't arrange position relatively
*       of the parent and shows relatively of the cursor position.
*
*       @cfg {String} offset
*       The number of pixels to offset the tooltip from the parent component
*
*       @cfg {String} cls
*       An extra CSS class that will be added to tooltip dom-element.
*
*
*       Methods
*       =======
*
*       @method setTitle
*
*       @method show
*       @params {Array} at - set predefined position for the tooltip
*
*
*       Events
*       ======
*
*       @event tooltip:show
*       Fires after the tooltip is shown
*
*       @event tooltip:hide
*       Fires after the tooltip is hidden
*
* */

 define([
    'tip',
    'backbone'
], function () {
    'use strict';

    var Tooltip = function(options) {
        this.$element =
        this.placement = undefined;
        this.init.call(this, options);
    };

    _.extend(Tooltip.prototype, Backbone.Events, {
        init: function(opts) {
            this.$element  = opts.owner instanceof Backbone.View ? opts.owner.$el : $(opts.owner);
            this.placement = opts.placement;

            if (this.$element.data('bs.tooltip'))
                this.$element.removeData('bs.tooltip');

            this.$element.tooltip({
                title       : opts.title,
                trigger     : 'manual',
                placement   : opts.placement,
                offset      : opts.offset,
                cls         : opts.cls,
                html        : opts.html,
                hideonclick : opts.hideonclick,
                keepvisible: opts.keepvisible,
                dir        : opts.dir,
                animation  : opts.animation
            });

            if (opts.hideonclick) {
                var me = this;
                var tip = this.$element.data('bs.tooltip');
                if (tip) tip.tip().on('click', function() {
                    tip.hide();
                    me.trigger('tooltip:hideonclick', this);
                });
            }

            this.$element.on('shown.bs.tooltip', _.bind(this.onTipShown, this));
            this.$element.on('hidden.bs.tooltip', _.bind(this.onTipHidden, this));
        },

        show: function(at) {
            this.getBSTip().show(at);
        },

        hide: function(callback) {
            this.getBSTip().hide(callback);
        },

        setTitle: function(title) {
            var tip = this.getBSTip();
            if (tip) tip.options.title = title;
        },

        updateTitle: function() {
            var tip = this.getBSTip();
            tip.$tip.find('.tooltip-inner')[tip.options.html ? 'html' : 'text'](tip.options.title);
        },

        getBSTip: function() {
            return this.$element.data('bs.tooltip');
        },

        onTipShown: function() {
            this.trigger('tooltip:show', this);
        },

        onTipHidden: function() {
            this.trigger('tooltip:hide', this);
        },

        isVisible: function() {
            return this.getBSTip().tip().is(':visible');
        }
    });
    Common.UI = Common.UI || {};
    Common.UI.Tooltip = Tooltip;
});