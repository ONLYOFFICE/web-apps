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

        onBtnPasteOptionsClick: function (btn, api, isSSE) {
            this.api = api;
            this.btn = btn;
            this.isSSE = isSSE;
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
            var me = this;

            if (options === null) {
                var menu = me.btn.menu;

                var mnu = new Common.UI.MenuItem({
                    caption: 'Paste',
                    disabled: true
                });

                menu.addItem(mnu)
                menu.show();
                return
            }

            var pasteItems = options.asc_getOptions(),
                isTable = !!options.asc_getContainTables();

            if (!pasteItems) return;

            me._arrSpecialPaste = [];
            if (!me.isSSE) {
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = me.textPaste;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = me.txtPasteSourceFormat;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = me.txtKeepTextOnly;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.insertAsNestedTable] = me.textNest;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.overwriteCells] = me.txtOverwriteCells;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] = me.txtSourceEmbed;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] = me.txtDestEmbed;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] = me.txtSourceLink;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] = me.txtDestLink;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = me.txtPastePicture;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = me.txtPasteDestFormat;
            } else {
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = [me.txtPaste, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormula] = [me.txtPasteFormulas, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaNumberFormat] = [me.txtPasteFormulaNumFormat, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaAllFormatting] = [me.txtPasteKeepSourceFormat, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaWithoutBorders] = [me.txtPasteBorders, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaColumnWidth] = [me.txtPasteColWidths, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.mergeConditionalFormating] = [me.txtPasteMerge, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyValues] = [me.txtPasteValues, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.valueNumberFormat] = [me.txtPasteValNumFormat, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.valueAllFormating] = [me.txtPasteValFormat, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormating] = [me.txtPasteFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.link] = [me.txtPasteLink, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.transpose] = [me.txtPasteTranspose, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = [me.txtPastePicture, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.linkedPicture] = [me.txtPasteLinkPicture, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = [me.txtPasteSourceFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = [me.txtPasteDestFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = [me.txtKeepTextOnly, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.useTextImport] = [me.txtUseTextImport, 3];
            }

            me.initSpecialPasteEvents();

            if (pasteItems.length>0) {
                var menu = me.btn.menu;

                if (me.isSSE) {
                    var groups = [];
                    for (var i = 0; i < 3; i++) {
                        groups[i] = [];
                    }

                    var importText, pasteItem;
                }

                _.each(pasteItems, function(menuItem, index) {
                    if (me._arrSpecialPaste[menuItem]) {
                        var mnu = new Common.UI.MenuItem({
                            caption: !me.isSSE ? me._arrSpecialPaste[menuItem] + ' (' + me.hkSpecPaste[menuItem] + ')' : 
                                me._arrSpecialPaste[menuItem][0] + (me.hkSpecPaste[menuItem] ? ' (' + me.hkSpecPaste[menuItem] + ')' : ''),
                            value: menuItem,
                            checkable: true,
                            toggleGroup : 'specialPasteGroup'
                        }).on('click', _.bind(me.onSpecialPasteItemClick, me));

                        if (!me.isSSE) {
                            menu.addItem(mnu);
                        } else {
                            if (menuItem == Asc.c_oSpecialPasteProps.paste) {
                                pasteItem = mnu;
                            } else if (menuItem == Asc.c_oSpecialPasteProps.useTextImport) {
                                importText = mnu;
                            } else {
                                groups[me._arrSpecialPaste[menuItem][1]].push(mnu);
                            }

                            me._arrSpecialPaste[menuItem][2] = mnu;
                        }
                    }
                });

                if (me.isSSE) {
                    var groupTitles = [me.txtFormula, me.txtValue, me.txtOther];

                    if (pasteItem) {
                        menu.addItem(pasteItem);
                    }

                    for (var i = 0; i < 3; i++) {
                        if (groups[i].length > 0) {
                            if (menu.items.length > 0) {
                                menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                            }
                            menu.addItem(new Common.UI.MenuItem({
                                header: groupTitles[i],
                                disabled: true,
                                cls: 'menu-header'
                            }));
                            _.each(groups[i], function (menuItem, index) {
                                menu.addItem(menuItem);
                            });
                        }
                    }

                    if (importText) {
                        menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                        menu.addItem(importText);
                    }
                    if (menu.items.length>0 && options.asc_getShowPasteSpecial()) {
                        menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                        var mnu = new Common.UI.MenuItem({
                            caption: me.textPasteSpecial,
                            value: 'special'
                        }).on('click', function(item, e) {
                            (new SSE.Views.SpecialPasteDialog({
                                props: pasteItems,
                                isTable: isTable,
                                handler: function (result, settings) {
                                    if (result == 'ok') {
                                        if (me && me.api) {
                                            me.api.asc_SpecialPaste(settings, true);
                                        }
                                    }
                                }
                            })).show();
                            setTimeout(function(){menu.hide();}, 100);
                        });
                        menu.addItem(mnu);
                    }
                }

                menu.show();
            }
        },

        initSpecialPasteEvents: function() {
            if (this.specialPasteEventsInited) return

            var me = this;
            me.hkSpecPaste = [];

            if (!me.isSSE) {
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = 'P';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = 'K';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = 'T';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.insertAsNestedTable] = 'N';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.overwriteCells] = 'O';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = 'H';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] = 'K';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] = 'H';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] = 'F';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] = 'L';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.picture] = 'U';
            } else {
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = 'P';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormula] = 'F';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaNumberFormat] = 'O';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaAllFormatting] = 'K';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaWithoutBorders] = 'B';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaColumnWidth] = 'W';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.mergeConditionalFormating] = 'G';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.transpose] = 'T';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.pasteOnlyValues] = 'V';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.valueNumberFormat] = 'A';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.valueAllFormating] = 'E';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormating] = 'R';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.link] = 'N';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.picture] = 'U';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.linkedPicture] = 'I';

                me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = 'K';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = 'M';
                me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = 'T';
                // me.hkSpecPaste[Asc.c_oSpecialPasteProps.useTextImport] = '';
            }

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

            var closeMenuOnWindowBlur = function() {
                if (me.btn.menu.$el && me.btn.menu.$el.is(':visible')) {
                    me.btn.menu.hide();
                }
            };
            $(window).on('blur.pastemenuhide', closeMenuOnWindowBlur);

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
            var me = this;

            if (this.api) {
                var menu = this.btn.menu;
                if (!this.isSSE) {
                    this.api.asc_SpecialPaste(item.value, true);
                    setTimeout(function(){
                        menu.hide();
                    }, 100);
                } else {
                    if (item.value == Asc.c_oSpecialPasteProps.useTextImport) {
                        (new Common.Views.OpenDialog({
                            title: me.txtImportWizard,
                            closable: true,
                            type: Common.Utils.importTextType.Paste,
                            preview: true,
                            api: me.api,
                            fromToolbar: true,
                            handler: function (result, settings) {
                                if (result == 'ok') {
                                    if (me && me.api) {
                                        var props = new Asc.SpecialPasteProps();
                                        props.asc_setProps(Asc.c_oSpecialPasteProps.useTextImport);
                                        props.asc_setAdvancedOptions(settings.textOptions);
                                        me.api.asc_SpecialPaste(props, true);
                                    }
                                }
                            }
                        })).show();
                        setTimeout(function(){menu.hide();}, 100);
                    } else {
                        var props = new Asc.SpecialPasteProps();
                        props.asc_setProps(item.value);
                        me.api.asc_SpecialPaste(props, true);
                        setTimeout(function(){menu.hide();}, 100);
                    }
                }
            }
            return false;
        },

    }, Common.Controllers.PasteOptions || {}));
});