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

define([], function () {
    'use strict';

    if (window.PE && window.PE.Views && window.PE.Views.DocumentHolder) {
        let dh = window.PE.Views.DocumentHolder.prototype;

        dh.createDelayedElementsViewer = function() {
            var me = this;

            if (me.menuViewCopy) return; // menu is already inited

            me.menuViewCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption: me.textCopy,
                value: 'copy'
            });

            me.menuViewUndo = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-undo',
                caption: me.textUndo
            });

            var menuViewCopySeparator = new Common.UI.MenuItem({
                caption: '--'
            });

            me.menuViewAddComment = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption: me.addCommentText
            });

            this.viewModeMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function (value) {
                    me.menuViewUndo.setVisible(me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    me.menuViewUndo.setDisabled(!me.api.asc_getCanUndo());
                    menuViewCopySeparator.setVisible(!value.isChart && me.api.can_AddQuotedComment() !== false && me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    me.menuViewAddComment.setVisible(!value.isChart && me.api.can_AddQuotedComment() !== false && me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    me.menuViewAddComment.setDisabled(value.locked);
                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuViewCopy.setDisabled(!cancopy);
                },
                items: [
                    me.menuViewCopy,
                    me.menuViewUndo,
                    menuViewCopySeparator,
                    me.menuViewAddComment
                ]
            }).on('hide:after', function (menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                me.currentMenu = null;
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
            });

            me.mnuPreview = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-preview',
                caption : me.txtPreview
            });

            me.mnuSelectAll = new Common.UI.MenuItem({
                caption : me.txtSelectAll
            });

            me.mnuPrintSelection = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-print',
                caption : me.txtPrintSelection
            });

            this.viewModeMenuSlide = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function (value) {
                    me.mnuSelectAll.setDisabled(me.slidesCount<2);
                    me.mnuPrintSelection.setVisible(me.mode.canPrint && value.fromThumbs===true);
                    me.mnuPrintSelection.setDisabled(me.slidesCount<1);
                    me.mnuPreview.setDisabled(me.slidesCount<1);
                },
                items: [
                    me.mnuSelectAll,
                    me.mnuPrintSelection,
                    {caption: '--'},
                    me.mnuPreview
                ]
            }).on('hide:after', function (menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                me.currentMenu = null;
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
            });

            this.fireEvent('createdelayedelements', [this, 'view']);
        };

        dh.createDelayedElements = function(){
            var me = this;

            if (me.mnuDeleteSlide || !window.styles_loaded) return; // menu is already inited or editor styles are not loaded

            me.mnuDeleteSlide = new Common.UI.MenuItem({
                caption     : me.txtDeleteSlide
            });

            me.mnuChangeSlide = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-changeslide',
                caption     : me.txtChangeLayout,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        { template: _.template('<div id="id-docholder-menu-changeslide" class="menu-layouts" style="width: 302px; margin: 0 4px;"></div>') }
                    ]
                })
            });

            me.mnuResetSlide = new Common.UI.MenuItem({
                caption     : me.txtResetLayout
            });

            me.mnuNewSlide = new Common.UI.MenuItem({
                caption     : me.txtNewSlide
            });

            me.mnuDuplicateSlide = new Common.UI.MenuItem({
                caption     : me.txtDuplicateSlide
            });

            var mnuChangeTheme = new Common.UI.MenuItem({
                caption     : me.txtChangeTheme,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        { template: _.template('<div id="id-docholder-menu-changetheme" style="width: 289px; margin: 0 4px;"></div>') }
                    ]
                })
            });

            me.mnuPreview = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-preview',
                caption : me.txtPreview
            });

            me.mnuSelectAll = new Common.UI.MenuItem({
                caption : me.txtSelectAll
            });

            me.mnuPrintSelection = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-print',
                caption : me.txtPrintSelection
            });

            me.mnuMoveSlideToStart = new  Common.UI.MenuItem({
                caption: me.txtMoveSlidesToStart
            });

            me.mnuMoveSlideToEnd = new  Common.UI.MenuItem({
                caption: me.txtMoveSlidesToEnd
            });

            me.menuSlidePaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption : me.textPaste,
                value : 'paste'
            });

            me.menuSlideSettings = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-slide',
                caption : me.textSlideSettings,
                value : null
            });

            me.mnuSlideHide = new Common.UI.MenuItem({
                caption : me.txtSlideHide,
                checkable: true,
                checked: false
            });

            me.mnuGuides = new Common.UI.MenuItem({
                caption     : me.textGuides,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        { caption: me.textShowGuides, value: 'show', checkable: true },
                        { caption: '--'},
                        { caption: me.textAddVGuides, iconCls: 'menu__icon btn-vertical-guide', value: 'add-vert' },
                        { caption: me.textAddHGuides, iconCls: 'menu__icon btn-horizontal-guide', value: 'add-hor' },
                        { caption: me.textDeleteGuide, value: 'del-guide' },
                        { caption: '--'},
                        { caption: me.textSmartGuides, value: 'smart', checkable: true },
                        { caption: me.textClearGuides, value: 'clear' }
                    ]
                })
            });
            me.mnuGridlines = new Common.UI.MenuItem({
                caption     : me.textGridlines,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        { caption: me.textShowGridlines, value: 'show', checkable: true },
                        { caption: me.textSnapObjects, value: 'snap', checkable: true },
                        { caption: '--'},
                        { caption: '--'},
                        { caption: me.textCustom, value: 'custom' }
                    ]
                })
            });
            me.mnuRulers = new Common.UI.MenuItem({
                caption : me.textRulers,
                checkable: true
            });

            me.slideMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value) {
                    var selectedLast = me.api.asc_IsLastSlideSelected(),
                        selectedFirst = me.api.asc_IsFirstSlideSelected();
                    me.menuSlidePaste.setVisible(value.fromThumbs!==true);
                    me.mnuNewSlide.setVisible(value.fromThumbs===true); // New Slide
                    me.mnuDuplicateSlide.setVisible(value.isSlideSelect===true); // Duplicate Slide
                    me.mnuDeleteSlide.setVisible(value.isSlideSelect===true);
                    me.mnuSlideHide.setVisible(value.isSlideSelect===true);
                    me.mnuSlideHide.setChecked(value.isSlideHidden===true);
                    me.slideMenu.items[5].setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    me.mnuChangeSlide.setVisible(!me.api.asc_IsMasterMode() && (value.isSlideSelect===true || value.fromThumbs!==true));
                    me.mnuResetSlide.setVisible(!me.api.asc_IsMasterMode() && (value.isSlideSelect===true || value.fromThumbs!==true));
                    mnuChangeTheme.setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    me.menuSlideSettings.setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    me.menuSlideSettings.options.value = null;

                    me.slideMenu.items[10].setVisible(!value.fromThumbs); // guides separator
                    me.mnuGuides.setVisible(!value.fromThumbs);
                    me.mnuGridlines.setVisible(!value.fromThumbs);
                    me.mnuRulers.setVisible(!value.fromThumbs);
                    me.slideMenu.items[14].setVisible(value.fromThumbs===true);
                    me.mnuSelectAll.setVisible(value.fromThumbs===true);

                    me.mnuPrintSelection.setVisible(me.mode.canPrint && value.fromThumbs===true);
                    me.slideMenu.items[17].setVisible((!selectedLast || !selectedFirst) && value.isSlideSelect===true);
                    me.mnuMoveSlideToEnd.setVisible(!selectedLast && value.isSlideSelect===true);
                    me.mnuMoveSlideToStart.setVisible(!selectedFirst && value.isSlideSelect===true);
                    me.slideMenu.items[20].setVisible(value.fromThumbs===true);
                    me.mnuPreview.setVisible(value.fromThumbs===true);

                    if (!value.fromThumbs) {
                        me.mnuGuides.menu.items[0].setChecked(me.api.asc_getShowGuides(), true);
                        if (value.guide) { // change visibility only on asc_onContextMenu event
                            me.mnuGuides.menu.items[4].setVisible(!!value.guide.guideId);
                            me.mnuGuides.menu.items[4].options.guideId = value.guide.guideId;
                        }
                        me.mnuGuides.menu.items[6].setChecked(me.api.asc_getShowSmartGuides(), true);

                        var viewPropsLock = !!Common.Utils.InternalSettings.get("pe-lock-view-props");
                        me.mnuGuides.menu.items[2].setDisabled(viewPropsLock);
                        me.mnuGuides.menu.items[3].setDisabled(viewPropsLock);
                        me.mnuGuides.menu.items[4].setDisabled(viewPropsLock);
                        me.mnuGuides.menu.items[7].setDisabled(viewPropsLock || !me.api.asc_canClearGuides());

                        me.mnuGridlines.menu.items[0].setChecked(me.api.asc_getShowGridlines(), true);
                        me.mnuGridlines.menu.items[1].setChecked(me.api.asc_getSnapToGrid(), true);

                        var spacing = Common.Utils.Metric.fnRecalcFromMM(me.api.asc_getGridSpacing()/36000),
                            items = me.mnuGridlines.menu.items;
                        if (me._state.unitsChanged) {
                            for (var i = 3; i < items.length-2; i++) {
                                me.mnuGridlines.menu.removeItem(items[i]);
                                i--;
                            }
                            var arr = Common.define.gridlineData.getGridlineData(Common.Utils.Metric.getCurrentMetric());
                            for (var i = 0; i < arr.length; i++) {
                                var menuItem = new Common.UI.MenuItem({
                                    caption: arr[i].caption,
                                    value: arr[i].value,
                                    checkable: true,
                                    toggleGroup: 'mnu-gridlines'
                                });
                                me.mnuGridlines.menu.insertItem(3+i, menuItem);
                            }
                            me._state.unitsChanged = false;
                        }

                        for (var i=3; i<items.length-2; i++) {
                            var item = items[i];
                            if (item.value<1 && Math.abs(item.value - spacing)<0.005)
                                item.setChecked(true);
                            else if (item.value>=1 && Math.abs(item.value - spacing)<0.001)
                                item.setChecked(true);
                            else
                                item.setChecked(false);
                            item.setDisabled(viewPropsLock);
                        }
                        me.mnuGridlines.menu.items[1].setDisabled(viewPropsLock);
                        me.mnuGridlines.menu.items[items.length-1].setDisabled(viewPropsLock);
                        me.mnuRulers.setChecked(!Common.Utils.InternalSettings.get("pe-hidden-rulers"));
                    }

                    var selectedElements = me.api.getSelectedElements(),
                        locked           = false,
                        lockedDeleted    = false,
                        lockedLayout     = false;
                    if (selectedElements && _.isArray(selectedElements)){
                        _.each(selectedElements, function(element, index) {
                            if (Asc.c_oAscTypeSelectElement.Slide == element.get_ObjectType()) {
                                var elValue         = element.get_ObjectValue();
                                locked          = elValue.get_LockDelete();
                                lockedDeleted   = elValue.get_LockRemove();
                                lockedLayout    = elValue.get_LockLayout();
                                me.menuSlideSettings.options.value = element;
                                me.slideLayoutMenu.options.layout_index = elValue.get_LayoutIndex();
                                return false;
                            }
                        });
                    }
                    for (var i = 0; i < 3; i++) {
                        me.slideMenu.items[i].setDisabled(locked);
                    }
                    me.mnuPreview.setDisabled(me.slidesCount<1);
                    me.mnuSelectAll.setDisabled(me.slidesCount<2);
                    me.mnuDeleteSlide.setDisabled(lockedDeleted || locked);
                    me.mnuChangeSlide.setDisabled(lockedLayout || locked);
                    me.mnuResetSlide.setDisabled(lockedLayout || locked);
                    mnuChangeTheme.setDisabled(me._state.themeLock || locked );
                    me.mnuSlideHide.setDisabled(lockedLayout || locked);
                    me.mnuPrintSelection.setDisabled(me.slidesCount<1);
                },
                items: [
                    me.menuSlidePaste,
                    me.mnuNewSlide,
                    me.mnuDuplicateSlide,
                    me.mnuDeleteSlide,
                    me.mnuSlideHide,
                    {caption: '--'},
                    me.mnuChangeSlide,
                    me.mnuResetSlide,
                    mnuChangeTheme,
                    me.menuSlideSettings,
                    {caption: '--'},
                    me.mnuGuides,
                    me.mnuGridlines,
                    me.mnuRulers,
                    {caption: '--'},
                    me.mnuSelectAll,
                    me.mnuPrintSelection,
                    {caption: '--'},
                    me.mnuMoveSlideToStart,
                    me.mnuMoveSlideToEnd,
                    {caption: '--'},
                    me.mnuPreview
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                me.currentMenu = null;
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
            }).on('render:after', function(cmp) {
                me.slideLayoutMenu = new Common.UI.DataView({
                    el          : $('#id-docholder-menu-changeslide'),
                    parentMenu  : me.mnuChangeSlide.menu,
                    style: 'max-height: 300px;',
                    restoreWidth: 302,
                    store       : PE.getCollection('SlideLayouts'),
                    itemTemplate: _.template([
                        '<div class="layout" id="<%= id %>" style="width: <%= itemWidth %>px;">',
                        '<div style="background-image: url(<%= imageUrl %>); width: <%= itemWidth %>px; height: <%= itemHeight %>px;background-size: contain;"></div>',
                        '<div class="title"><%= title %></div> ',
                        '</div>'
                    ].join(''))
                }).on('item:click', function(picker, item, record, e) {
                    if (e.type !== 'click')
                        me.slideMenu.hide();
                    me.fireEvent('layout:change', [record]);
                });

                if (me.slideMenu) {
                    me.mnuChangeSlide.menu.on('show:after', function (menu) {
                        me.onSlidePickerShowAfter(me.slideLayoutMenu);
                        me.slideLayoutMenu.scroller.update({alwaysVisibleY: true});

                        var record = me.slideLayoutMenu.store.findLayoutByIndex(me.slideLayoutMenu.options.layout_index);
                        if (record) {
                            me.slideLayoutMenu.selectRecord(record, true);
                            me.slideLayoutMenu.scrollToRecord(record);
                        }
                    });
                }
                me.slideLayoutMenu._needRecalcSlideLayout = true;
                me.listenTo(PE.getCollection('SlideLayouts'), 'reset',  function() {
                    me.slideLayoutMenu._needRecalcSlideLayout = true;
                });

                me.slideThemeMenu = new Common.UI.DataView({
                    el          : $('#id-docholder-menu-changetheme'),
                    parentMenu  : mnuChangeTheme.menu,
                    // restoreHeight: 300,
                    style: 'max-height: 300px;',
                    store       : PE.getCollection('SlideThemes'),
                    itemTemplate: _.template([
                        '<div class="style" id="<%= id %>"">',
                        '<div class="item-theme" style="' + '<% if (typeof imageUrl !== "undefined") { %>' + 'background-image: url(<%= imageUrl %>);' + '<% } %> background-position: 0 -<%= offsety %>px;"></div>',
                        '</div>'
                    ].join(''))
                }).on('item:click', function(picker, item, record, e) {
                    if (e.type !== 'click')
                        me.slideMenu.hide();
                    me.fireEvent('theme:change', [record]);
                });

                if (me.slideMenu) {
                    mnuChangeTheme.menu.on('show:after', function (menu) {
                        var record = me.slideThemeMenu.store.findWhere({themeId: me._state.themeId});
                        me.slideThemeMenu.selectRecord(record, true);

                        me.slideThemeMenu.scroller.update({alwaysVisibleY: true});
                        me.slideThemeMenu.scroller.scrollTop(0);
                    });
                }
            });

            me.mnuInsertMaster = new Common.UI.MenuItem({
                caption : me.textInsertSlideMaster,
                value : 'ins-master'
            });

            me.mnuInsertLayout = new Common.UI.MenuItem({
                caption : me.textInsertLayout,
                value : 'ins-layout'
            });

            me.mnuDuplicateMaster = new Common.UI.MenuItem({
                caption : me.textDuplicateSlideMaster,
                value : 'duplicate-master'
            });

            me.mnuDeleteMaster = new Common.UI.MenuItem({
                caption : me.textDeleteMaster,
                value : 'delete-master'
            });

            me.mnuDuplicateLayout = new Common.UI.MenuItem({
                caption : me.textDuplicateLayout,
                value : 'duplicate-master'
            });

            me.mnuDeleteLayout = new Common.UI.MenuItem({
                caption : me.textDeleteLayout,
                value : 'delete-layout'
            });

            me.slideMasterMenu = new Common.UI.Menu({
                //cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value) {
                    var isMaster = value.isMaster;

                    me.mnuDuplicateMaster.setVisible(isMaster);
                    me.mnuDeleteMaster.setVisible(isMaster);
                    me.mnuDuplicateLayout.setVisible(!isMaster);
                    me.mnuDeleteLayout.setVisible(!isMaster);

                    isMaster && me.mnuDeleteMaster.setDisabled(!me.api.asc_CanDeleteMaster());
                    !isMaster && me.mnuDeleteLayout.setDisabled(!me.api.asc_CanDeleteLayout());
                },
                items: [
                    me.mnuInsertMaster,
                    me.mnuInsertLayout,
                    me.mnuDuplicateMaster,
                    me.mnuDuplicateLayout,
                    {caption: '--'},
                    me.mnuDeleteMaster,
                    me.mnuDeleteLayout
                ]
            });

            me.mnuTableMerge = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-merge-cells',
                caption     : me.mergeCellsText
            });

            me.mnuTableSplit = new Common.UI.MenuItem({
                caption     : me.splitCellsText
            });

            me.menuTableCellAlign = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-align-top',
                caption  : me.cellAlignText,
                menu    : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        me.menuTableCellTop = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-top',
                            caption     : me.textShapeAlignTop,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popuptablecellalign',
                            value       : Asc.c_oAscVertAlignJc.Top
                        }),
                        me.menuTableCellCenter = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-middle',
                            caption     : me.textShapeAlignMiddle,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popuptablecellalign',
                            value       : Asc.c_oAscVertAlignJc.Center
                        }),
                        me.menuTableCellBottom = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-bottom',
                            caption     : me.textShapeAlignBottom,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popuptablecellalign',
                            value       : Asc.c_oAscVertAlignJc.Bottom
                        })
                    ]
                })
            });

            me.menuTableSaveAsPicture = new Common.UI.MenuItem({
                caption     : me.textSaveAsPicture
            });

            var menuTableSaveAsPictureSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuTableDistRows = new Common.UI.MenuItem({
                caption : me.textDistributeRows
            });

            me.menuTableDistCols = new Common.UI.MenuItem({
                caption : me.textDistributeCols
            });

            me.menuTableSelectText = new Common.UI.MenuItem({
                caption     : me.selectText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : me.rowText,
                            value: 0
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.columnText,
                            value: 1
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.cellText,
                            value: 2
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.tableText,
                            value: 3
                        })
                    ]
                })
            });

            me.menuTableInsertText = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-addcell',
                caption     : me.insertText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    style   : 'width: 100px',
                    items   : [
                        new Common.UI.MenuItem({
                            caption: me.insertColumnLeftText,
                            value: 0
                        }),
                        new Common.UI.MenuItem({
                            caption: me.insertColumnRightText,
                            value: 1
                        }),
                        new Common.UI.MenuItem({
                            caption: me.insertRowAboveText,
                            value: 2
                        }),
                        new Common.UI.MenuItem({
                            caption: me.insertRowBelowText,
                            value: 3
                        })
                    ]
                })
            });

            me.menuTableDeleteText = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-delcell',
                caption     : me.deleteText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : me.rowText,
                            value: 0
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.columnText,
                            value: 1
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.tableText,
                            value: 2
                        })
                    ]
                })
            });

            me.menuSpellTable = new Common.UI.MenuItem({
                caption     : me.loadSpellText,
                disabled    : true
            });

            me.menuSpellMoreTable = new Common.UI.MenuItem({
                caption     : me.moreText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    restoreHeight: true,
                    items   : []
                })
            });

            var langTemplate = _.template([
                '<a id="<%= id %>" tabindex="-1" type="menuitem" langval="<%= value %>" class="<% if (checked) { %> checked <% } %>">',
                '<i class="icon <% if (spellcheck) { %> toolbar__icon btn-ic-docspell spellcheck-lang <% } %>"></i>',
                '<%= caption %>',
                '</a>'
            ].join(''));

            me.langTableMenu = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-ic-doclang',
                caption     : me.langText,
                menu        : new Common.UI.MenuSimple({
                    cls: 'lang-menu',
                    menuAlign: 'tl-tr',
                    restoreHeight: 285,
                    items   : [],
                    itemTemplate: langTemplate,
                    search: true,
                    focusToCheckedItem: true
                })
            });

            me.menuIgnoreSpellTable = new Common.UI.MenuItem({
                caption     : me.ignoreSpellText,
                value: false
            });

            me.menuIgnoreAllSpellTable = new Common.UI.MenuItem({
                caption     : me.ignoreAllSpellText,
                value: true
            });

            me.menuToDictionaryTable = new Common.UI.MenuItem({
                caption     : me.toDictionaryText
            });

            var menuIgnoreSpellTableSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuSpellcheckTableSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuSpellCheckTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-ic-docspell',
                caption     : me.spellcheckText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuSpellTable,
                        me.menuSpellMoreTable,
                        menuIgnoreSpellTableSeparator,
                        me.menuIgnoreSpellTable,
                        me.menuIgnoreAllSpellTable,
                        me.menuToDictionaryTable,
                        { caption: '--' },
                        me.langTableMenu
                    ]
                })
            });

            me.menuSpellPara = new Common.UI.MenuItem({
                caption     : me.loadSpellText,
                disabled    : true
            });

            me.menuSpellMorePara = new Common.UI.MenuItem({
                caption     : me.moreText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    restoreHeight: true,
                    items: []
                })
            });

            me.langParaMenu = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-ic-doclang',
                caption     : me.langText,
                menu        : new Common.UI.MenuSimple({
                    cls: 'lang-menu',
                    menuAlign: 'tl-tr',
                    restoreHeight: 285,
                    items   : [],
                    itemTemplate: langTemplate,
                    search: true,
                    focusToCheckedItem: true
                })
            });

            me.menuIgnoreSpellPara = new Common.UI.MenuItem({
                caption     : me.ignoreSpellText,
                value: false
            });

            me.menuIgnoreAllSpellPara = new Common.UI.MenuItem({
                caption     : me.ignoreAllSpellText,
                value: true
            });

            me.menuToDictionaryPara = new Common.UI.MenuItem({
                caption     : me.toDictionaryText
            });

            var menuIgnoreSpellParaSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuSpellcheckParaSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuTableAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-table',
                caption     : me.advancedTableText
            });

            var menuTableSettingsSeparator = new Common.UI.MenuItem({
                caption : '--'
            });

            me.menuImageAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-image',
                caption     : me.advancedImageText
            });

            me.menuShapeAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-shape',
                caption     : me.advancedShapeText
            });

            me.menuParagraphAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paragraph',
                caption     : me.advancedParagraphText
            });

            me.menuChartAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-chart',
                caption     : me.advancedChartText
            });

            var menuAdvancedSettingsSeparator = new Common.UI.MenuItem({
                caption : '--'
            });

            var menuCommentParaSeparator = new Common.UI.MenuItem({
                caption : '--'
            });

            me.menuAddHyperlinkPara = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption : me.hyperlinkText
            });

            me.menuEditHyperlinkPara = new Common.UI.MenuItem({
                caption : me.editHyperlinkText
            });

            me.menuRemoveHyperlinkPara = new Common.UI.MenuItem({
                caption : me.removeHyperlinkText
            });

            var menuHyperlinkPara = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.hyperlinkText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        me.menuEditHyperlinkPara,
                        me.menuRemoveHyperlinkPara
                    ]
                })
            });

            me.menuAddHyperlinkTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.hyperlinkText
            });

            me.menuEditHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText
            });

            me.menuRemoveHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            });

            var menuHyperlinkTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.hyperlinkText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        me.menuEditHyperlinkTable,
                        me.menuRemoveHyperlinkTable
                    ]
                })
            });

            me.mnuGroupImg = new Common.UI.MenuItem({
                caption     : this.txtGroup,
                iconCls     : 'menu__icon btn-shape-group'
            });

            me.mnuUnGroupImg = new Common.UI.MenuItem({
                caption     : this.txtUngroup,
                iconCls     : 'menu__icon btn-shape-ungroup'
            });

            me.mnuArrangeFront = new Common.UI.MenuItem({
                caption     : this.textArrangeFront,
                iconCls     : 'menu__icon btn-arrange-front'
            });

            me.mnuArrangeBack = new Common.UI.MenuItem({
                caption     : this.textArrangeBack,
                iconCls     : 'menu__icon btn-arrange-back'
            });

            me.mnuArrangeForward = new Common.UI.MenuItem({
                caption     : this.textArrangeForward,
                iconCls     : 'menu__icon btn-arrange-forward'
            });

            me.mnuArrangeBackward = new Common.UI.MenuItem({
                caption     : this.textArrangeBackward,
                iconCls     : 'menu__icon btn-arrange-backward'
            });

            var menuImgShapeArrange = new Common.UI.MenuItem({
                caption     : me.txtArrange,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        me.mnuArrangeFront,
                        me.mnuArrangeBack,
                        me.mnuArrangeForward,
                        me.mnuArrangeBackward,
                        {caption: '--'},
                        me.mnuGroupImg,
                        me.mnuUnGroupImg
                    ]
                })
            });

            me.menuImgShapeAlign = new Common.UI.MenuItem({
                caption     : me.txtAlign,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : me.textShapeAlignLeft,
                            iconCls     : 'menu__icon btn-shape-align-left',
                            value       : Asc.c_oAscAlignShapeType.ALIGN_LEFT
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.textShapeAlignCenter,
                            iconCls     : 'menu__icon btn-shape-align-center',
                            value       : Asc.c_oAscAlignShapeType.ALIGN_CENTER
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.textShapeAlignRight,
                            iconCls     : 'menu__icon btn-shape-align-right',
                            value       : Asc.c_oAscAlignShapeType.ALIGN_RIGHT
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.textShapeAlignTop,
                            iconCls     : 'menu__icon btn-shape-align-top',
                            value       : Asc.c_oAscAlignShapeType.ALIGN_TOP
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.textShapeAlignMiddle,
                            iconCls     : 'menu__icon btn-shape-align-middle',
                            value       : Asc.c_oAscAlignShapeType.ALIGN_MIDDLE
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.textShapeAlignBottom,
                            iconCls     : 'menu__icon btn-shape-align-bottom',
                            value       : Asc.c_oAscAlignShapeType.ALIGN_BOTTOM
                        }),
                        {caption    : '--'},
                        new Common.UI.MenuItem({
                            caption     : me.txtDistribHor,
                            iconCls     : 'menu__icon btn-shape-distribute-hor',
                            value       : 6
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.txtDistribVert,
                            iconCls     : 'menu__icon btn-shape-distribute-vert',
                            value       : 7
                        })
                    ]
                })
            });

            me.menuChartEdit = new Common.UI.MenuItem({
                caption     : me.editChartText
            });

            me.menuParagraphVAlign = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-align-top',
                caption     : me.vertAlignText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        me.menuParagraphTop = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-top',
                            caption     : me.textShapeAlignTop,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Top
                        }),
                        me.menuParagraphCenter = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-middle',
                            caption     : me.textShapeAlignMiddle,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Center
                        }),
                        me.menuParagraphBottom = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-bottom',
                            caption     : me.textShapeAlignBottom,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Bottom
                        })
                    ]
                })
            });

            me.menuParagraphDirection = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-text-orient-hor',
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuParagraphDirectH = new Common.UI.MenuItem({
                            caption     : me.directHText,
                            iconCls     : 'menu__icon btn-text-orient-hor',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.normal
                        }),
                        me.menuParagraphDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'menu__icon btn-text-orient-rdown',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert
                        }),
                        me.menuParagraphDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'menu__icon btn-text-orient-rup',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert270
                        })
                    ]
                })
            });

            var menuImgShapeSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuImgOriginalSize = new Common.UI.MenuItem({
                caption     : me.originalSizeText
            });

            me.menuImgReplace = new Common.UI.MenuItem({
                caption     : me.textReplace,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : this.textFromFile,
                            value: 0
                        }),
                        new Common.UI.MenuItem({
                            caption     : this.textFromUrl,
                            value: 1
                        }),
                        new Common.UI.MenuItem({
                            caption     : this.textFromStorage,
                            value: 2
                        })
                    ]
                })
            });

            me.menuImgShapeRotate = new Common.UI.MenuItem({
                caption     : me.textRotate,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-rotate-90',
                            caption: me.textRotate90,
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-rotate-270',
                            caption: me.textRotate270,
                            value  : 0
                        }),
                        { caption: '--' },
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-flip-hor',
                            caption: me.textFlipH,
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-flip-vert',
                            caption: me.textFlipV,
                            value  : 0
                        })
                    ]
                })
            });

            me.menuImgCrop = new Common.UI.MenuItem({
                caption     : me.textCrop,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption: me.textCrop,
                            checkable: true,
                            allowDepress: true,
                            value  : 0
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textCropFill,
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textCropFit,
                            value  : 2
                        })
                    ]
                })
            });

            me.menuImgSaveAsPicture = new Common.UI.MenuItem({
                caption     : me.textSaveAsPicture
            });

            var menuImgSaveAsPictureSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            /** coauthoring begin **/
            me.menuAddCommentPara = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            me.menuAddCommentPara.hide();

            me.menuAddCommentTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            me.menuAddCommentTable.hide();

            me.menuAddCommentImg = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            me.menuAddCommentImg.hide();
            /** coauthoring end **/

            me.menuParaCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption : me.textCopy,
                value : 'copy'
            });

            me.menuParaPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption : me.textPaste,
                value : 'paste'
            });

            me.menuParaCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption : me.textCut,
                value : 'cut'
            });

            me.menuImgCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption : me.textCopy,
                value : 'copy'
            });

            me.menuImgPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption : me.textPaste,
                value : 'paste'
            });

            me.menuImgCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption : me.textCut,
                value : 'cut'
            });

            me.menuTableCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption : me.textCopy,
                value : 'copy'
            });

            me.menuTablePaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption : me.textPaste,
                value : 'paste'
            });

            me.menuTableCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption : me.textCut,
                value : 'cut'
            });

            var menuEquationSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuTableEquationSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuTableEquationSettingsSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParagraphEquation = new Common.UI.MenuItem({
                caption     : me.advancedEquationText,
                iconCls     : 'menu__icon btn-equation',
                menu        : me.createEquationMenu('popupparaeqinput', 'tl-tr')
            });

            me.menuTableEquationSettings = new Common.UI.MenuItem({
                caption     : me.advancedEquationText,
                iconCls     : 'menu__icon btn-equation',
                menu        : me.createEquationMenu('popuptableeqinput', 'tl-tr')
            });

            me.menuImgEditPoints = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-edit-points',
                caption: me.textEditPoints
            });

            me.textMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                scrollToCheckedItem: false,
                initMenu: function(value){
                    var isInShape = (value.shapeProps && !_.isNull(value.shapeProps.value));
                    var isInChart = (value.chartProps && !_.isNull(value.chartProps.value));

                    var disabled = (value.paraProps!==undefined  && value.paraProps.locked) ||
                        (value.slideProps!==undefined && value.slideProps.locked) ||
                        (isInShape && value.shapeProps.locked);
                    var isEquation= (value.mathProps && value.mathProps.value);
                    me._currentParaObjDisabled = disabled;

                    me.menuParagraphVAlign.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    me.menuParagraphDirection.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    if (isInShape || isInChart) {
                        var align = value.shapeProps.value.get_VerticalTextAlign();
                        var cls = '';
                        switch (align) {
                            case Asc.c_oAscVAlign.Top:
                                cls = 'menu__icon btn-align-top';
                                break;
                            case Asc.c_oAscVAlign.Center:
                                cls = 'menu__icon btn-align-middle';
                                break;
                            case Asc.c_oAscVAlign.Bottom:
                                cls = 'menu__icon btn-align-bottom';
                                break;
                        }
                        me.menuParagraphVAlign.setIconCls(cls);
                        me.menuParagraphTop.setChecked(align == Asc.c_oAscVAlign.Top);
                        me.menuParagraphCenter.setChecked(align == Asc.c_oAscVAlign.Center);
                        me.menuParagraphBottom.setChecked(align == Asc.c_oAscVAlign.Bottom);

                        var dir = value.shapeProps.value.get_Vert();
                        cls = '';
                        switch (dir) {
                            case Asc.c_oAscVertDrawingText.normal:
                                cls = 'menu__icon btn-text-orient-hor';
                                break;
                            case Asc.c_oAscVertDrawingText.vert:
                                cls = 'menu__icon btn-text-orient-rdown';
                                break;
                            case Asc.c_oAscVertDrawingText.vert270:
                                cls = 'menu__icon btn-text-orient-rup';
                                break;
                        }
                        me.menuParagraphDirection.setIconCls(cls);
                        me.menuParagraphDirectH.setChecked(dir == Asc.c_oAscVertDrawingText.normal);
                        me.menuParagraphDirect90.setChecked(dir == Asc.c_oAscVertDrawingText.vert);
                        me.menuParagraphDirect270.setChecked(dir == Asc.c_oAscVertDrawingText.vert270);
                    } else {
                        me.menuParagraphVAlign.setIconCls('');
                        me.menuParagraphDirection.setIconCls('');
                    }
                    me.menuParagraphVAlign.setDisabled(disabled);
                    me.menuParagraphDirection.setDisabled(disabled);

                    var text = null;

                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }

                    me.menuAddHyperlinkPara.setVisible(value.hyperProps===undefined && text!==false);
                    menuHyperlinkPara.setVisible(value.hyperProps!==undefined);

                    me.menuEditHyperlinkPara.hyperProps = value.hyperProps;

                    if (text!==false) {
                        me.menuAddHyperlinkPara.hyperProps = {};
                        me.menuAddHyperlinkPara.hyperProps.value = new Asc.CHyperlinkProperty();
                        me.menuAddHyperlinkPara.hyperProps.value.put_Text(text);
                    }

                    /** coauthoring begin **/
                    me.menuAddCommentPara.setVisible(!isInChart && isInShape && me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    /** coauthoring end **/

                    menuCommentParaSeparator.setVisible(/** coauthoring begin **/ me.menuAddCommentPara.isVisible() || /** coauthoring end **/ me.menuAddHyperlinkPara.isVisible() || menuHyperlinkPara.isVisible());
                    me.menuAddHyperlinkPara.setDisabled(disabled);
                    menuHyperlinkPara.setDisabled(disabled);

                    /** coauthoring begin **/
                    me.menuAddCommentPara.setDisabled(disabled);
                    /** coauthoring end **/

                    me.menuParagraphAdvanced.setDisabled(disabled);
                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuParaCopy.setDisabled(!cancopy);
                    me.menuParaCut.setDisabled(disabled || !cancopy);
                    me.menuParaPaste.setDisabled(disabled);

                    // spellCheck
                    var spell = (value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    me.menuSpellPara.setVisible(spell);
                    menuSpellcheckParaSeparator.setVisible(spell);
                    me.menuIgnoreSpellPara.setVisible(spell);
                    me.menuIgnoreAllSpellPara.setVisible(spell);
                    me.menuToDictionaryPara.setVisible(spell && me.mode.isDesktopApp);
                    me.langParaMenu.setVisible(spell);
                    me.langParaMenu.setDisabled(disabled);
                    menuIgnoreSpellParaSeparator.setVisible(spell);

                    if (spell && value.spellProps.value.get_Variants() !== null && value.spellProps.value.get_Variants() !== undefined) {
                        me.addWordVariants(true);
                    } else {
                        me.menuSpellPara.setCaption(me.loadSpellText);
                        me.clearWordVariants(true);
                        me.menuSpellMorePara.setVisible(false);
                    }
                    if (me.langParaMenu.isVisible() && me._currLang.id !== me._currLang.paraid) {
                        me.changeLanguageMenu(me.langParaMenu.menu);
                        me._currLang.paraid = me._currLang.id;
                    }

                    //equation menu
                    var eqlen = 0;
                    if (isEquation) {
                        eqlen = me.addEquationMenu(me.textMenu, 12);
                    } else
                        me.clearEquationMenu(me.textMenu, 12);
                    menuEquationSeparator.setVisible(isEquation && eqlen>0);

                    me.menuParagraphEquation.setVisible(isEquation);
                    me.menuParagraphEquation.setDisabled(disabled);
                    if (isEquation) {
                        var eq = me.api.asc_GetMathInputType(),
                            isEqToolbarHide = Common.Utils.InternalSettings.get('pe-equation-toolbar-hide');

                        me.menuParagraphEquation.menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                        me.menuParagraphEquation.menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                        me.menuParagraphEquation.menu.items[8].options.isToolbarHide = isEqToolbarHide;
                        me.menuParagraphEquation.menu.items[8].setCaption(isEqToolbarHide ? me.showEqToolbar : me.hideEqToolbar);
                    }
                },
                items: [
                    me.menuSpellPara,
                    me.menuSpellMorePara,
                    menuSpellcheckParaSeparator,
                    me.menuIgnoreSpellPara,
                    me.menuIgnoreAllSpellPara,
                    me.menuToDictionaryPara,
                    me.langParaMenu,
                    menuIgnoreSpellParaSeparator,
                    me.menuParaCut,
                    me.menuParaCopy,
                    me.menuParaPaste,
                    menuEquationSeparator,
                    { caption: '--' },
                    me.menuParagraphVAlign,
                    me.menuParagraphDirection,
                    me.menuParagraphAdvanced,
                    me.menuParagraphEquation,
                    menuCommentParaSeparator,
                    /** coauthoring begin **/
                    me.menuAddCommentPara,
                    /** coauthoring end **/
                    me.menuAddHyperlinkPara,
                    menuHyperlinkPara
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                me.currentMenu = null;
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
            });

            me.tableMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value){
                    // table properties
                    if (_.isUndefined(value.tableProps))
                        return;

                    var isEquation= (value.mathProps && value.mathProps.value);
                    for (var i = 6; i < 18; i++) {
                        me.tableMenu.items[i].setVisible(!isEquation);
                    }

                    var disabled = (value.slideProps!==undefined && value.slideProps.locked);

                    var align = value.tableProps.value.get_CellsVAlign();
                    var cls = '';
                    switch (align) {
                        case Asc.c_oAscVertAlignJc.Top:
                            cls = 'menu__icon btn-align-top';
                            break;
                        case Asc.c_oAscVertAlignJc.Center:
                            cls = 'menu__icon btn-align-middle';
                            break;
                        case Asc.c_oAscVertAlignJc.Bottom:
                            cls = 'menu__icon btn-align-bottom';
                            break;
                    }
                    me.menuTableCellAlign.setIconCls(cls);
                    me.menuTableCellTop.setChecked(align == Asc.c_oAscVertAlignJc.Top);
                    me.menuTableCellCenter.setChecked(align == Asc.c_oAscVertAlignJc.Center);
                    me.menuTableCellBottom.setChecked(align == Asc.c_oAscVertAlignJc.Bottom);

                    if (me.api) {
                        me.mnuTableMerge.setDisabled(value.tableProps.locked || disabled || !me.api.CheckBeforeMergeCells());
                        me.mnuTableSplit.setDisabled(value.tableProps.locked || disabled || !me.api.CheckBeforeSplitCells());
                    }
                    me.menuTableDistRows.setDisabled(value.tableProps.locked || disabled);
                    me.menuTableDistCols.setDisabled(value.tableProps.locked || disabled);

                    me.tableMenu.items[7].setDisabled(value.tableProps.locked || disabled);
                    me.tableMenu.items[8].setDisabled(value.tableProps.locked || disabled);

                    me.menuTableCellAlign.setDisabled(value.tableProps.locked || disabled);

                    me.menuTableSaveAsPicture.setVisible(!isEquation);
                    menuTableSaveAsPictureSeparator.setVisible(!isEquation);

                    me.menuTableAdvanced.setVisible(!isEquation);
                    me.menuTableAdvanced.setDisabled(value.tableProps.locked || disabled);
                    menuTableSettingsSeparator.setVisible(me.menuTableAdvanced.isVisible());

                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuTableCopy.setDisabled(!cancopy);
                    me.menuTableCut.setDisabled(value.tableProps.locked || disabled || !cancopy);
                    me.menuTablePaste.setDisabled(value.tableProps.locked || disabled);

                    // hyperlink properties
                    var text = null;

                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }

                    me.menuAddHyperlinkTable.setVisible(!_.isUndefined(value.paraProps) && _.isUndefined(value.hyperProps) && text!==false);
                    menuHyperlinkTable.setVisible(!_.isUndefined(value.paraProps) && !_.isUndefined(value.hyperProps));

                    me.menuEditHyperlinkTable.hyperProps = value.hyperProps;

                    if (text!==false) {
                        me.menuAddHyperlinkTable.hyperProps = {};
                        me.menuAddHyperlinkTable.hyperProps.value = new Asc.CHyperlinkProperty();
                        me.menuAddHyperlinkTable.hyperProps.value.put_Text(text);
                    }
                    if (!_.isUndefined(value.paraProps)) {
                        me.menuAddHyperlinkTable.setDisabled(value.paraProps.locked || disabled);
                        menuHyperlinkTable.setDisabled(value.paraProps.locked || disabled);
                        me._currentParaObjDisabled = value.paraProps.locked || disabled;
                    }

                    /** coauthoring begin **/
                    me.menuAddCommentTable.setVisible(me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    me.menuAddCommentTable.setDisabled(!_.isUndefined(value.paraProps) && value.paraProps.locked || disabled);
                    /** coauthoring end **/

                    me.menuSpellCheckTable.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    me.menuToDictionaryTable.setVisible(me.mode.isDesktopApp);
                    menuSpellcheckTableSeparator.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);

                    me.langTableMenu.setDisabled(disabled);
                    if (value.spellProps!==undefined && value.spellProps.value.get_Checked()===false && value.spellProps.value.get_Variants() !== null && value.spellProps.value.get_Variants() !== undefined) {
                        me.addWordVariants(false);
                    } else {
                        me.menuSpellTable.setCaption(me.loadSpellText);
                        me.clearWordVariants(false);
                        me.menuSpellMoreTable.setVisible(false);
                    }

                    if (me.menuSpellCheckTable.isVisible() && me._currLang.id !== me._currLang.tableid) {
                        me.changeLanguageMenu(me.langTableMenu.menu);
                        me._currLang.tableid = me._currLang.id;
                    }

                    //equation menu
                    var eqlen = 0;
                    if (isEquation) {
                        eqlen = me.addEquationMenu(me.tableMenu, 6);
                    } else
                        me.clearEquationMenu(me.tableMenu, 6);

                    menuTableEquationSeparator.setVisible(eqlen>0);
                    me.menuTableEquationSettings.setVisible(isEquation);
                    menuTableEquationSettingsSeparator.setVisible(isEquation);
                    me.menuTableEquationSettings.setDisabled(disabled);
                    if (isEquation) {
                        var eq = me.api.asc_GetMathInputType(),
                            isEqToolbarHide = Common.Utils.InternalSettings.get('pe-equation-toolbar-hide');

                        me.menuTableEquationSettings.menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                        me.menuTableEquationSettings.menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                        me.menuTableEquationSettings.menu.items[8].options.isToolbarHide = isEqToolbarHide;
                        me.menuTableEquationSettings.menu.items[8].setCaption(isEqToolbarHide ? me.showEqToolbar : me.hideEqToolbar);
                    }
                },
                items: [
                    me.menuSpellCheckTable,         //0
                    menuSpellcheckTableSeparator,   //1
                    me.menuTableCut,                //2
                    me.menuTableCopy,               //3
                    me.menuTablePaste,              //4
                    { caption: '--' },              //5
                    me.menuTableSelectText,         //6
                    me.menuTableInsertText,         //7
                    me.menuTableDeleteText,         //8
                    { caption: '--' },              //9
                    me.mnuTableMerge,               //10
                    me.mnuTableSplit,               //11
                    { caption: '--' },              //12
                    me.menuTableDistRows,           //13
                    me.menuTableDistCols,           //14
                    { caption: '--' },              //15
                    me.menuTableCellAlign,          //16
                    { caption: '--'},               //17
                    menuTableEquationSeparator,     //18
                    me.menuTableSaveAsPicture,      //19
                    menuTableSaveAsPictureSeparator,//20
                    me.menuTableAdvanced,           //21
                    menuTableSettingsSeparator,     //22
                    me.menuTableEquationSettings,           //23
                    menuTableEquationSettingsSeparator,     //24
                    /** coauthoring begin **/
                    me.menuAddCommentTable,         //25
                    /** coauthoring end **/
                    me.menuAddHyperlinkTable,       //26
                    menuHyperlinkTable             //27
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                me.currentMenu = null;
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
            });

            me.menuEditObjectSeparator = new Common.UI.MenuItem({
                caption: '--'
            });

            me.menuEditObject = new Common.UI.MenuItem({
                caption: me.textEditObject
            });

            me.pictureMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value){
                    if (me.api) {
                        me.mnuUnGroupImg.setDisabled(!me.api.canUnGroup());
                        me.mnuGroupImg.setDisabled(!me.api.canGroup());
                    }

                    var isimage = (_.isUndefined(value.shapeProps) || value.shapeProps.value.get_FromImage()) && _.isUndefined(value.chartProps),
                        imgdisabled = (value.imgProps!==undefined && value.imgProps.locked),
                        shapedisabled = (value.shapeProps!==undefined && value.shapeProps.locked),
                        chartdisabled = (value.chartProps!==undefined && value.chartProps.locked),
                        disabled = imgdisabled || shapedisabled || chartdisabled || (value.slideProps!==undefined && value.slideProps.locked),
                        pluginGuid = (value.imgProps) ? value.imgProps.value.asc_getPluginGuid() : null,
                        inSmartartInternal = value.shapeProps && value.shapeProps.value.get_FromSmartArtInternal();

                    var pluginGuidAvailable = (pluginGuid !== null && pluginGuid !== undefined);
                    me.menuEditObject.setVisible(pluginGuidAvailable);
                    me.menuEditObjectSeparator.setVisible(pluginGuidAvailable);

                    if (pluginGuidAvailable) {
                        var plugin = PE.getCollection('Common.Collections.Plugins').findWhere({guid: pluginGuid});
                        me.menuEditObject.setDisabled(!me.api.asc_canEditTableOleObject() && (plugin === null || plugin === undefined) || disabled);
                    }

                    me.mnuArrangeFront.setDisabled(inSmartartInternal);
                    me.mnuArrangeBack.setDisabled(inSmartartInternal);
                    me.mnuArrangeForward.setDisabled(inSmartartInternal);
                    me.mnuArrangeBackward.setDisabled(inSmartartInternal);

                    me.menuImgShapeRotate.setVisible(_.isUndefined(value.chartProps) && (pluginGuid===null || pluginGuid===undefined));
                    if (me.menuImgShapeRotate.isVisible()) {
                        me.menuImgShapeRotate.setDisabled(disabled || (value.shapeProps && value.shapeProps.value.get_FromSmartArt()));
                        me.menuImgShapeRotate.menu.items[3].setDisabled(inSmartartInternal);
                        me.menuImgShapeRotate.menu.items[4].setDisabled(inSmartartInternal);
                    }

                    // image properties
                    me.menuImgOriginalSize.setVisible(isimage);
                    if (me.menuImgOriginalSize.isVisible())
                        me.menuImgOriginalSize.setDisabled(disabled || _.isNull(value.imgProps.value.get_ImageUrl()) || _.isUndefined(value.imgProps.value.get_ImageUrl()));

                    me.menuImgReplace.setVisible(isimage && (pluginGuid===null || pluginGuid===undefined));
                    if (me.menuImgReplace.isVisible())
                        me.menuImgReplace.setDisabled(disabled || pluginGuid===null);
                    me.menuImgReplace.menu.items[2].setVisible(me.mode.canRequestInsertImage || me.mode.fileChoiceUrl && me.mode.fileChoiceUrl.indexOf("{documentType}")>-1);

                    me.menuImgCrop.setVisible(me.api.asc_canEditCrop());
                    if (me.menuImgCrop.isVisible())
                        me.menuImgCrop.setDisabled(disabled);

                    var canEditPoints = me.api && me.api.asc_canEditGeometry();
                    me.menuImgEditPoints.setVisible(canEditPoints);
                    canEditPoints && me.menuImgEditPoints.setDisabled(disabled);

                    me.menuImageAdvanced.setVisible(isimage);
                    me.menuShapeAdvanced.setVisible(_.isUndefined(value.imgProps)   && _.isUndefined(value.chartProps));
                    me.menuChartEdit.setVisible(_.isUndefined(value.imgProps) && !_.isUndefined(value.chartProps) && (_.isUndefined(value.shapeProps) || value.shapeProps.isChart));
                    me.menuChartAdvanced.setVisible(_.isUndefined(value.imgProps) && !_.isUndefined(value.chartProps) && (_.isUndefined(value.shapeProps) || value.shapeProps.isChart));
                    menuImgShapeSeparator.setVisible(me.menuImageAdvanced.isVisible() || me.menuShapeAdvanced.isVisible() || me.menuChartEdit.isVisible() || me.menuChartAdvanced.isVisible());
                    menuAdvancedSettingsSeparator.setVisible(
                        me.menuImgCrop.isVisible() || me.menuImgOriginalSize.isVisible() ||
                        me.menuImgReplace.isVisible() || me.menuImageAdvanced.isVisible() ||
                        me.menuImgEditPoints.isVisible() || me.menuShapeAdvanced.isVisible() ||
                        me.menuChartEdit.isVisible() || me.menuChartAdvanced.isVisible()
                    );

                    /** coauthoring begin **/
                    me.menuAddCommentImg.setVisible(me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    me.menuAddCommentImg.setDisabled(disabled);
                    /** coauthoring end **/
                    me.menuImgShapeAlign.setDisabled(disabled);
                    if (!disabled) {
                        var objcount = me.api.asc_getSelectedDrawingObjectsCount(),
                            slide_checked = Common.Utils.InternalSettings.get("pe-align-to-slide") || false;
                        me.menuImgShapeAlign.menu.items[7].setDisabled(objcount==2 && !slide_checked);
                        me.menuImgShapeAlign.menu.items[8].setDisabled(objcount==2 && !slide_checked);
                    }
                    me.menuImageAdvanced.setDisabled(disabled);
                    me.menuShapeAdvanced.setDisabled(disabled);
                    me.menuChartAdvanced.setDisabled(disabled);
                    if (me.menuChartEdit.isVisible())
                        me.menuChartEdit.setDisabled(disabled);


                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuImgCopy.setDisabled(!cancopy);
                    me.menuImgCut.setDisabled(disabled || !cancopy);
                    me.menuImgPaste.setDisabled(disabled);
                    menuImgShapeArrange.setDisabled(disabled);
                },
                items: [
                    me.menuImgCut,
                    me.menuImgCopy,
                    me.menuImgPaste,
                    me.menuEditObjectSeparator,
                    me.menuEditObject,
                    { caption: '--' },              //Separator
                    menuImgShapeArrange,
                    me.menuImgShapeAlign,
                    me.menuImgShapeRotate,
                    menuImgShapeSeparator,          //Separator
                    me.menuImgSaveAsPicture,
                    menuImgSaveAsPictureSeparator,     //Separator
                    me.menuImgCrop,
                    me.menuImgOriginalSize,
                    me.menuImgReplace,
                    me.menuImageAdvanced,
                    me.menuImgEditPoints,
                    me.menuShapeAdvanced,
                    me.menuChartEdit,
                    me.menuChartAdvanced,
                    menuAdvancedSettingsSeparator,  //Separator
                    /** coauthoring begin **/
                    me.menuAddCommentImg
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                me.currentMenu = null;
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
            });

            me.menuAnimStartOnClick = new Common.UI.MenuItem({
                caption: me.textStartOnClick,
                checkable: true,
                value: AscFormat.NODE_TYPE_CLICKEFFECT
            });

            me.menuAnimStartWithPrevious = new Common.UI.MenuItem({
                caption: me.textStartWithPrevious,
                checkable: true,
                value: AscFormat.NODE_TYPE_WITHEFFECT
            });

            me.menuAnimStartAfterPrevious = new Common.UI.MenuItem({
                caption: me.textStartAfterPrevious,
                checkable: true,
                value: AscFormat.NODE_TYPE_AFTEREFFECT
            });

            me.menuAnimRemove = new Common.UI.MenuItem({
                caption: me.textRemove,
                value: 'remove'
            });

            me.animEffectMenu = new Common.UI.Menu({
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                style: 'min-width: auto;',
                initMenu: function(value){
                    me.menuAnimStartOnClick.setChecked(value.effect === AscFormat.NODE_TYPE_CLICKEFFECT, true);
                    me.menuAnimStartWithPrevious.setChecked(value.effect === AscFormat.NODE_TYPE_WITHEFFECT, true);
                    me.menuAnimStartAfterPrevious.setChecked(value.effect === AscFormat.NODE_TYPE_AFTEREFFECT, true);
                },
                items: [
                    me.menuAnimStartOnClick,
                    me.menuAnimStartWithPrevious,
                    me.menuAnimStartAfterPrevious,
                    {caption: '--'},
                    me.menuAnimRemove
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                me.currentMenu = null;
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
            });

            var nextpage = $('#id_buttonNextPage');
            nextpage.attr('data-toggle', 'tooltip');
            nextpage.tooltip({
                title       : me.textNextPage + Common.Utils.String.platformKey('PgDn'),
                placement   : 'top-right'
            });

            var prevpage = $('#id_buttonPrevPage');
            prevpage.attr('data-toggle', 'tooltip');
            prevpage.tooltip({
                title       : me.textPrevPage + Common.Utils.String.platformKey('PgUp'),
                placement   : 'top-right'
            });

            this.fireEvent('createdelayedelements', [this, 'edit']);
        };
    }
});