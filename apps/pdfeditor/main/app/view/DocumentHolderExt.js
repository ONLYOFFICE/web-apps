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

    if (window.PDFE && window.PDFE.Views && window.PDFE.Views.DocumentHolder) {
        let dh = window.PDFE.Views.DocumentHolder.prototype;

        dh.createDelayedElementsPDFViewer = function() {
            var me = this;

            if (me.menuPDFViewCopy) return; // menu is already inited

            me.menuPDFViewCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption: me.textCopy,
                value: 'copy'
            });

            me.menuAddComment = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });

            me.menuRemoveComment = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cc-remove',
                caption     : me.removeCommentText
            });

            this.viewPDFModeMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function (value) {
                    me.menuPDFViewCopy.setDisabled(!(me.api && me.api.can_CopyCut()));
                    me.menuAddComment.setVisible(me.mode && me.mode.canComments);
                    me.menuRemoveComment.setVisible(value && value.annotProps && value.annotProps.value);
                },
                items: [
                    me.menuPDFViewCopy,
                    me.menuAddComment,
                    me.menuRemoveComment
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

            this.fireEvent('createdelayedelements', [this, 'pdf']);
        };

        dh.createDelayedElementsPDFEditor = function() {
            var me = this;

            if (me.menuPDFEditCopy) return; // menu is already inited

            me.menuPDFEditCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption: me.textCopy,
                value: 'copy'
            });

            me.menuEditAddComment = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });

            me.menuEditRemoveComment = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cc-remove',
                caption     : me.removeCommentText
            });

            this.editPDFModeMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function (value) {
                    me.menuPDFEditCopy.setDisabled(!(me.api && me.api.can_CopyCut()));
                    me.menuEditAddComment.setVisible(me.mode && me.mode.canComments);
                    me.menuEditRemoveComment.setVisible(value && value.annotProps && value.annotProps.value);
                },
                items: [
                    me.menuPDFEditCopy,
                    me.menuEditAddComment,
                    me.menuEditRemoveComment
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

            // Table
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

            me.menuTableAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-table',
                caption     : me.advancedTableText
            });

            var menuTableSettingsSeparator = new Common.UI.MenuItem({
                caption : '--'
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

            me.menuAddCommentTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            me.menuAddCommentTable.hide();

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

            var menuTableEquationSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuTableEquationSettingsSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuTableEquationSettings = new Common.UI.MenuItem({
                caption     : me.advancedEquationText,
                iconCls     : 'menu__icon btn-equation',
                menu        : me.createEquationMenu('popuptableeqinput', 'tl-tr')
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
                    for (var i = 4; i < 16; i++) {
                        me.tableMenu.items[i].setVisible(!isEquation);
                    }

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
                        me.mnuTableMerge.setDisabled(value.tableProps.locked || !me.api.CheckBeforeMergeCells());
                        me.mnuTableSplit.setDisabled(value.tableProps.locked || !me.api.CheckBeforeSplitCells());
                    }
                    me.menuTableDistRows.setDisabled(value.tableProps.locked);
                    me.menuTableDistCols.setDisabled(value.tableProps.locked);

                    me.tableMenu.items[5].setDisabled(value.tableProps.locked);
                    me.tableMenu.items[6].setDisabled(value.tableProps.locked);

                    me.menuTableCellAlign.setDisabled(value.tableProps.locked);

                    me.menuTableSaveAsPicture.setVisible(!isEquation);
                    menuTableSaveAsPictureSeparator.setVisible(!isEquation);

                    me.menuTableAdvanced.setVisible(!isEquation);
                    me.menuTableAdvanced.setDisabled(value.tableProps.locked);
                    menuTableSettingsSeparator.setVisible(me.menuTableAdvanced.isVisible());

                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuTableCopy.setDisabled(!cancopy);
                    me.menuTableCut.setDisabled(value.tableProps.locked || !cancopy);
                    me.menuTablePaste.setDisabled(value.tableProps.locked);

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
                        me.menuAddHyperlinkTable.setDisabled(value.paraProps.locked);
                        menuHyperlinkTable.setDisabled(value.paraProps.locked);
                        me._currentParaObjDisabled = value.paraProps.locked;
                    }

                    me.menuAddCommentTable.setVisible(me.mode && me.mode.canComments);

                    //equation menu
                    var eqlen = 0;
                    if (isEquation) {
                        eqlen = me.addEquationMenu(me.tableMenu, 4);
                    } else
                        me.clearEquationMenu(me.tableMenu, 4);

                    menuTableEquationSeparator.setVisible(eqlen>0);
                    me.menuTableEquationSettings.setVisible(isEquation);
                    menuTableEquationSettingsSeparator.setVisible(isEquation);
                    if (isEquation) {
                        var eq = me.api.asc_GetMathInputType(),
                            isEqToolbarHide = Common.Utils.InternalSettings.get('pdfe-equation-toolbar-hide');

                        me.menuTableEquationSettings.menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                        me.menuTableEquationSettings.menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                        me.menuTableEquationSettings.menu.items[8].options.isToolbarHide = isEqToolbarHide;
                        me.menuTableEquationSettings.menu.items[8].setCaption(isEqToolbarHide ? me.showEqToolbar : me.hideEqToolbar);
                    }
                },
                items: [
                    me.menuTableCut,                //0
                    me.menuTableCopy,               //1
                    me.menuTablePaste,              //2
                    { caption: '--' },              //3
                    me.menuTableSelectText,         //4
                    me.menuTableInsertText,         //5
                    me.menuTableDeleteText,         //6
                    { caption: '--' },              //7
                    me.mnuTableMerge,               //8
                    me.mnuTableSplit,               //9
                    { caption: '--' },              //10
                    me.menuTableDistRows,           //11
                    me.menuTableDistCols,           //12
                    { caption: '--' },              //13
                    me.menuTableCellAlign,          //14
                    { caption: '--'},               //15
                    menuTableEquationSeparator,     //16
                    me.menuTableSaveAsPicture,      //17
                    menuTableSaveAsPictureSeparator,//18
                    me.menuTableAdvanced,           //19
                    menuTableSettingsSeparator,     //20
                    me.menuTableEquationSettings,           //21
                    menuTableEquationSettingsSeparator,     //22
                    /** coauthoring begin **/
                    me.menuAddCommentTable,         //23
                    /** coauthoring end **/
                    me.menuAddHyperlinkTable,       //24
                    menuHyperlinkTable
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

            // Image
            me.menuImageAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-image',
                caption     : me.advancedImageText
            });

            me.menuShapeAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-shape',
                caption     : me.advancedShapeText
            });

            var menuAdvancedSettingsSeparator = new Common.UI.MenuItem({
                caption : '--'
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
                        // {caption: '--'},
                        // me.mnuGroupImg,
                        // me.mnuUnGroupImg
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

            me.menuAddCommentImg = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            me.menuAddCommentImg.hide();

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

            me.menuImgEditPoints = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-edit-points',
                caption: me.textEditPoints
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
                        disabled = imgdisabled || shapedisabled || chartdisabled,
                        pluginGuid = (value.imgProps) ? value.imgProps.value.asc_getPluginGuid() : null,
                        inSmartartInternal = value.shapeProps && value.shapeProps.value.get_FromSmartArtInternal(),
                        lastSeparator = menuImgSaveAsPictureSeparator;

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
                    // me.menuChartEdit.setVisible(_.isUndefined(value.imgProps) && !_.isUndefined(value.chartProps) && (_.isUndefined(value.shapeProps) || value.shapeProps.isChart));
                    // me.menuChartAdvanced.setVisible(_.isUndefined(value.imgProps) && !_.isUndefined(value.chartProps) && (_.isUndefined(value.shapeProps) || value.shapeProps.isChart));
                    menuImgShapeSeparator.setVisible(me.menuImageAdvanced.isVisible() || me.menuShapeAdvanced.isVisible() || /*me.menuChartEdit.isVisible() || */me.menuChartAdvanced.isVisible());
                    menuAdvancedSettingsSeparator.setVisible(
                        me.menuImgCrop.isVisible() || me.menuImgOriginalSize.isVisible() ||
                        me.menuImgReplace.isVisible() || me.menuImageAdvanced.isVisible() ||
                        me.menuImgEditPoints.isVisible() || me.menuShapeAdvanced.isVisible() /*||
                        me.menuChartEdit.isVisible() || me.menuChartAdvanced.isVisible()*/
                    );
                    menuAdvancedSettingsSeparator.isVisible() && (lastSeparator = menuAdvancedSettingsSeparator);

                    /** coauthoring begin **/
                    me.menuAddCommentImg.setVisible(me.mode && me.mode.canComments);
                    !me.menuAddCommentImg.isVisible() && lastSeparator.setVisible(false);
                    /** coauthoring end **/
                    me.menuImgShapeAlign.setDisabled(disabled);
                    if (!disabled) {
                        var objcount = me.api.asc_getSelectedDrawingObjectsCount(),
                            slide_checked = Common.Utils.InternalSettings.get("pdfe-align-to-slide") || false;
                        me.menuImgShapeAlign.menu.items[7].setDisabled(objcount==2 && !slide_checked);
                        me.menuImgShapeAlign.menu.items[8].setDisabled(objcount==2 && !slide_checked);
                    }
                    me.menuImageAdvanced.setDisabled(disabled);
                    me.menuShapeAdvanced.setDisabled(disabled);
                    // me.menuChartAdvanced.setDisabled(disabled);
                    // if (me.menuChartEdit.isVisible())
                    //     me.menuChartEdit.setDisabled(disabled);

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
                    // me.menuChartEdit,
                    // me.menuChartAdvanced,
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

            // Paragraph
            me.menuParagraphAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paragraph',
                caption     : me.advancedParagraphText
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

            me.menuAddCommentPara = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            me.menuAddCommentPara.hide();

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

            var menuEquationSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParagraphEquation = new Common.UI.MenuItem({
                caption     : me.advancedEquationText,
                iconCls     : 'menu__icon btn-equation',
                menu        : me.createEquationMenu('popupparaeqinput', 'tl-tr')
            });

            me.textMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                scrollToCheckedItem: false,
                initMenu: function(value){
                    var isInShape = (value.shapeProps && !_.isNull(value.shapeProps.value));
                    var isInChart = (value.chartProps && !_.isNull(value.chartProps.value));

                    var disabled = (value.paraProps!==undefined  && value.paraProps.locked) ||
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
                    me.menuAddCommentPara.setVisible(me.mode && me.mode.canComments);
                    /** coauthoring end **/

                    menuCommentParaSeparator.setVisible(/** coauthoring begin **/ me.menuAddCommentPara.isVisible() || /** coauthoring end **/ me.menuAddHyperlinkPara.isVisible() || menuHyperlinkPara.isVisible());
                    me.menuAddHyperlinkPara.setDisabled(disabled);
                    menuHyperlinkPara.setDisabled(disabled);

                    me.menuParagraphAdvanced.setDisabled(disabled);
                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuParaCopy.setDisabled(!cancopy);
                    me.menuParaCut.setDisabled(disabled || !cancopy);
                    me.menuParaPaste.setDisabled(disabled);

                    //equation menu
                    var eqlen = 0;
                    if (isEquation) {
                        eqlen = me.addEquationMenu(me.textMenu, 4);
                    } else
                        me.clearEquationMenu(me.textMenu, 4);
                    menuEquationSeparator.setVisible(isEquation && eqlen>0);

                    me.menuParagraphEquation.setVisible(isEquation);
                    me.menuParagraphEquation.setDisabled(disabled);
                    if (isEquation) {
                        var eq = me.api.asc_GetMathInputType(),
                            isEqToolbarHide = Common.Utils.InternalSettings.get('pdfe-equation-toolbar-hide');

                        me.menuParagraphEquation.menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                        me.menuParagraphEquation.menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                        me.menuParagraphEquation.menu.items[8].options.isToolbarHide = isEqToolbarHide;
                        me.menuParagraphEquation.menu.items[8].setCaption(isEqToolbarHide ? me.showEqToolbar : me.hideEqToolbar);
                    }
                },
                items: [
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

            me.mnuDeletePage = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cc-remove',
                caption     : me.txtDeletePage
            });
            me.mnuNewPageBefore = new Common.UI.MenuItem({
                caption     : me.txtNewPageBefore,
                value: true
            });
            me.mnuNewPageAfter = new Common.UI.MenuItem({
                caption     : me.txtNewPageAfter,
                value: false
            });
            me.mnuRotatePageRight = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-rotate-90',
                caption     : me.txtRotateRight
            });
            me.mnuRotatePageLeft = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-rotate-270',
                caption     : me.txtRotateLeft
            });

            var menuPageDelSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuPageNewSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.pageMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value) {
                    me.mnuRotatePageRight.options.value = me.mnuRotatePageLeft.options.value = value.pageNum;
                    me.mnuRotatePageRight.setVisible(value.isPageSelect===true);
                    me.mnuRotatePageLeft.setVisible(value.isPageSelect===true);
                    me.mnuDeletePage.setVisible(value.isPageSelect===true);
                    menuPageNewSeparator.setVisible(value.isPageSelect===true);
                    menuPageDelSeparator.setVisible(value.isPageSelect===true);

                    me.mnuDeletePage.setDisabled(me._pagesCount<2);
                },
                items: [
                    me.mnuNewPageBefore,
                    me.mnuNewPageAfter,
                    menuPageNewSeparator,
                    me.mnuRotatePageRight,
                    me.mnuRotatePageLeft,
                    menuPageDelSeparator,
                    me.mnuDeletePage
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

            this.fireEvent('createdelayedelements', [this, 'edit']);
        };

        dh.createDelayedElementsPDFForms = function() {
            var me = this;

            if (me.menuPDFFormsCopy) return; // menu is already inited

            me.menuPDFFormsCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption: me.textCopy,
                value: 'copy'
            });

            me.menuPDFFormsPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption : me.textPaste,
                value : 'paste'
            });

            me.menuPDFFormsCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption : me.textCut,
                value : 'cut'
            });

            me.menuPDFFormsUndo = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-undo',
                caption: me.textUndo
            });

            me.menuPDFFormsRedo = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-redo',
                caption: me.textRedo
            });

            me.menuPDFFormsClear = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-clearstyle',
                caption: me.textClearField
            });

            me.formsPDFMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function (value) {
                    var cancopy = me.api.can_CopyCut(),
                        disabled = value.paraProps && value.paraProps.locked || value.headerProps && value.headerProps.locked ||
                            value.imgProps && (value.imgProps.locked || value.imgProps.content_locked) || me._isDisabled;
                    me.menuPDFFormsUndo.setDisabled(disabled || !me.api.asc_getCanUndo()); // undo
                    me.menuPDFFormsRedo.setDisabled(disabled || !me.api.asc_getCanRedo()); // redo

                    me.menuPDFFormsClear.setDisabled(disabled || !me.api.asc_IsContentControl()); // clear
                    me.menuPDFFormsCut.setDisabled(disabled || !cancopy); // cut
                    me.menuPDFFormsCopy.setDisabled(!cancopy); // copy
                    me.menuPDFFormsPaste.setDisabled(disabled) // paste;
                },
                items: [
                    me.menuPDFFormsUndo,
                    me.menuPDFFormsRedo,
                    { caption: '--' },
                    me.menuPDFFormsClear,
                    { caption: '--' },
                    me.menuPDFFormsCut,
                    me.menuPDFFormsCopy,
                    me.menuPDFFormsPaste
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

            this.fireEvent('createdelayedelements', [this, 'forms']);
        };

    }
});