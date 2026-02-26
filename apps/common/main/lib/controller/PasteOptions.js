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
 *  PasteOptions.js
 *
 *  Created on 26.02.2026
 *
 */
define([
    'core',
], function () {
    'use strict';
    Common.Controllers.PasteOptions = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        sdkViewName : '#id_main',
        initialize: function () {

            this.addListeners({
                'Toolbar': {
                    'paste:options': _.bind(this.onBtnPasteOptionsClick, this)
                }
            });
        },

        setApi: function(api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onFocusObject',       _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onAddChartStylesPreview', _.bind(this.onAddChartStylesPreview, this));
                this.api.asc_registerCallback('asc_onUpdateChartStyles', _.bind(this._onUpdateChartStyles, this));
                this.api.asc_registerCallback('asc_onStartUpdateExternalReference', _.bind(this.onStartUpdateExternalReference, this));
                Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
                Common.NotificationCenter.on('uitheme:changed', _.bind(this.onThemeChanged, this));

            }
            return this;
        },

        setMode: function(mode) {
            this.appConfig = mode;
            return this;
        },

        onBtnPasteOptionsClick: function (btn, api) {
            console.log('onBtnPasteOptionsClick')
            this.api = api;
            this.btn = btn;
            var me = this;
            var menu = btn.menu;
            if (menu && menu.items && menu.items.length > 0) {
                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }
            }

            this.api.asc_getPasteOptions(function (options) {
                me.handlePasteOptions(options)
            });
        },

        handlePasteOptions: function(options) {
            console.log('handlePasteOptions')
            var me = this;

            if (options === null) {
                var menu = me.btn.menu;

                var mnu = new Common.UI.MenuItem({
                    caption: 'Paste',
                    disabled: true
                });

                menu.addItem(mnu)
                menu.show();
                console.log('options === null')
                return
            }

            var pasteItems = options.asc_getOptions(),
                isTable = !!options.asc_getContainTables();

            console.log(pasteItems, 'Paste items')
            if (!pasteItems) return;

            me._arrSpecialPaste = [];
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = documentHolder.textPaste;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = documentHolder.txtPasteSourceFormat;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = documentHolder.txtKeepTextOnly;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.insertAsNestedTable] = documentHolder.textNest;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.overwriteCells] = documentHolder.txtOverwriteCells;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] = documentHolder.txtSourceEmbed;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] = documentHolder.txtDestEmbed;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] = documentHolder.txtSourceLink;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] = documentHolder.txtDestLink;
            me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = documentHolder.txtPastePicture;

            me.initSpecialPasteEvents();

            if (pasteItems.length>0) {
                var menu = me.btn.menu;
                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }

                var group_prev = -1;
                _.each(pasteItems, function(menuItem, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption: me._arrSpecialPaste[menuItem] + ' (' + me.hkSpecPaste[menuItem] + ')',
                        value: menuItem,
                        checkable: true,
                        toggleGroup : 'specialPasteGroup'
                    }).on('click', _.bind(me.onSpecialPasteItemClick, me));
                    menu.addItem(mnu);
                });
            }
        },

        initSpecialPasteEvents: function() {
            if (this.specialPasteEventsInited) return

            var me = this;
            me.hkSpecPaste = [];
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = 'P';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = 'T';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.insertAsNestedTable] = 'N';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.overwriteCells] = 'O';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] = 'H';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] = 'F';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] = 'L';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.picture] = 'U';

            var str = '';
            for(var key in me.hkSpecPaste){
                if(me.hkSpecPaste.hasOwnProperty(key)){
                    if (str.indexOf(me.hkSpecPaste[key])<0)
                        str += me.hkSpecPaste[key] + ',';
                }
            }
            str = str.substring(0, str.length-1)
            var keymap = {};
            keymap[str + ' ' + 'special-paste-toolbar'] = _.bind(function(e) {
                var menu = this.btn.menu;
                for (var i = 0; i < menu.items.length; i++) {
                    if (this.hkSpecPaste[menu.items[i].value] === String.fromCharCode(e.keyCode)) {
                        return me.onSpecialPasteItemClick({value: menu.items[i].value});
                    }
                }
            }, me);
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});
            window.key.setScope('special-paste-toolbar');

            me.btn.menu.on('show:after', function(menu) {
                window.key.setScope('special-paste-toolbar');
                Common.util.Shortcuts.resumeEvents(str);
                $(window).on('blur.pastemenuhide', closeMenuOnWindowBlur);
            }).on('hide:after', function(menu) {
                window.key.setScope('all');
                Common.util.Shortcuts.suspendEvents(str, undefined, true);
                $(window).off('blur.pastemenuhide', closeMenuOnWindowBlur);
            });

            this.specialPasteEventsInited = true;
        },

        onSpecialPasteItemClick: function(item, e) {
            if (this.api) {
                this.api.asc_SpecialPaste(item.value, true);
                var menu = this.btn.menu;
                setTimeout(function(){
                    menu.hide();
                }, 100);
            }
            return false;
        },

    }, Common.Controllers.PasteOptions || {}));
});