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

    if (window.DE && window.DE.Views && window.DE.Views.DocumentHolder) {
        let dh = window.DE.Views.DocumentHolder.prototype;

        dh.createDelayedElements = function() {
            var me = this;

            if (me.menuInsertCaption || !window.styles_loaded) return; // menu is already inited or editor styles are not loaded
            me.menuInsertCaption = new Common.UI.MenuItem({
                caption : me.txtInsertCaption
            });
            var menuInsertCaptionSeparator = new Common.UI.MenuItem({ caption: '--' });

            me.menuSaveAsPicture = new Common.UI.MenuItem({
                caption     : me.textSaveAsPicture
            });

            var menuSaveAsPictureSeparator = new Common.UI.MenuItem({ caption: '--'});

            me.menuEquationInsertCaption = new Common.UI.MenuItem({
                caption : me.txtInsertCaption
            });
            var menuEquationInsertCaptionSeparator = new Common.UI.MenuItem({ caption: '--' });

            me.menuImageAlign = new Common.UI.MenuItem({
                caption     : me.textAlign,
                menu        : new Common.UI.Menu({
                    cls: 'ppm-toolbar shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption : me.textShapeAlignLeft,
                            iconCls : 'menu__icon btn-shape-align-left',
                            value: Asc.c_oAscAlignShapeType.ALIGN_LEFT
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textShapeAlignCenter,
                            iconCls : 'menu__icon btn-shape-align-center',
                            value: Asc.c_oAscAlignShapeType.ALIGN_CENTER
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textShapeAlignRight,
                            iconCls : 'menu__icon btn-shape-align-right',
                            value: Asc.c_oAscAlignShapeType.ALIGN_RIGHT
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textShapeAlignTop,
                            iconCls : 'menu__icon btn-shape-align-top',
                            value: Asc.c_oAscAlignShapeType.ALIGN_TOP
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textShapeAlignMiddle,
                            iconCls : 'menu__icon btn-shape-align-middle',
                            value: Asc.c_oAscAlignShapeType.ALIGN_MIDDLE
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textShapeAlignBottom,
                            iconCls : 'menu__icon btn-shape-align-bottom',
                            value: Asc.c_oAscAlignShapeType.ALIGN_BOTTOM
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

            me.mnuGroup = new Common.UI.MenuItem({
                caption : this.txtGroup,
                iconCls : 'menu__icon btn-shape-group'
            });

            me.mnuUnGroup = new Common.UI.MenuItem({
                iconCls : 'menu__icon btn-shape-ungroup',
                caption : this.txtUngroup
            });

            me.menuImageArrange = new Common.UI.MenuItem({
                caption : me.textArrange,
                menu    : new Common.UI.Menu({
                    cls: 'ppm-toolbar shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption : me.textArrangeFront,
                            iconCls : 'menu__icon btn-arrange-front',
                            valign  : Asc.c_oAscChangeLevel.BringToFront
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textArrangeBack,
                            iconCls : 'menu__icon btn-arrange-back',
                            valign  : Asc.c_oAscChangeLevel.SendToBack
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textArrangeForward,
                            iconCls : 'menu__icon btn-arrange-forward',
                            valign  : Asc.c_oAscChangeLevel.BringForward
                        }),
                        new Common.UI.MenuItem({
                            caption : me.textArrangeBackward,
                            iconCls : 'menu__icon btn-arrange-backward',
                            valign  : Asc.c_oAscChangeLevel.BringBackward
                        }),
                        { caption: '--' },
                        me.mnuGroup,
                        me.mnuUnGroup
                    ]
                })
            });

            me.menuWrapPolygon = new Common.UI.MenuItem({
                caption : me.textEditWrapBoundary,
                cls     : 'no-icon-wrap-item'
            });

            me.menuImageWrap = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-small-wrap-inline',
                caption : me.textWrap,
                menu    : new Common.UI.Menu({
                    cls: 'ppm-toolbar shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : me.txtInline,
                            iconCls     : 'menu__icon btn-small-wrap-inline',
                            toggleGroup : 'popuppicturewrapping',
                            wrapType    : Asc.c_oAscWrapStyle2.Inline,
                            checkmark   : false,
                            checkable   : true
                        }),
                        { caption: '--' },
                        new Common.UI.MenuItem({
                            caption     : me.txtSquare,
                            iconCls     : 'menu__icon btn-small-wrap-square',
                            toggleGroup : 'popuppicturewrapping',
                            wrapType    : Asc.c_oAscWrapStyle2.Square,
                            checkmark   : false,
                            checkable   : true
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.txtTight,
                            iconCls     : 'menu__icon btn-small-wrap-tight',
                            toggleGroup : 'popuppicturewrapping',
                            wrapType    : Asc.c_oAscWrapStyle2.Tight,
                            checkmark   : false,
                            checkable   : true
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.txtThrough,
                            iconCls     : 'menu__icon btn-small-wrap-through',
                            toggleGroup : 'popuppicturewrapping',
                            wrapType    : Asc.c_oAscWrapStyle2.Through,
                            checkmark   : false,
                            checkable   : true
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.txtTopAndBottom,
                            iconCls     : 'menu__icon btn-small-wrap-topandbottom',
                            toggleGroup : 'popuppicturewrapping',
                            wrapType    : Asc.c_oAscWrapStyle2.TopAndBottom,
                            checkmark   : false,
                            checkable   : true
                        }),
                        { caption: '--' },
                        new Common.UI.MenuItem({
                            caption     : me.txtInFront,
                            iconCls     : 'menu__icon btn-small-wrap-infront',
                            toggleGroup : 'popuppicturewrapping',
                            wrapType    : Asc.c_oAscWrapStyle2.InFront,
                            checkmark   : false,
                            checkable   : true
                        }),
                        new Common.UI.MenuItem({
                            caption     : me.txtBehind,
                            iconCls     : 'menu__icon btn-small-wrap-behind',
                            toggleGroup : 'popuppicturewrapping',
                            wrapType    : Asc.c_oAscWrapStyle2.Behind,
                            checkmark   : false,
                            checkable   : true
                        }),
                        { caption: '--' },
                        me.menuWrapPolygon
                    ]
                })
            });

            me.menuImageAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-image',
                caption : me.advancedText
            });

            me.menuChartEdit = new Common.UI.MenuItem({
                caption : me.editChartText
            });

            me.menuOriginalSize = new Common.UI.MenuItem({
                caption : me.originalSizeText
            });

            me.menuImgReplace = new Common.UI.MenuItem({
                caption     : me.textReplace,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({caption: this.textFromFile, value: 0}),
                        new Common.UI.MenuItem({caption: this.textFromUrl,  value: 1}),
                        new Common.UI.MenuItem({caption: this.textFromStorage, value: 2})
                    ]
                })
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

            me.menuImgAccept = new Common.UI.MenuItem({
                caption : me.textAccept,
                value : 'accept'
            });

            me.menuImgReject = new Common.UI.MenuItem({
                caption : me.textReject,
                value : 'reject'
            });

            var menuImgReviewSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuImgPrint = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-print',
                caption : me.txtPrintSelection
            });

            me.menuSignatureEditSign   = new Common.UI.MenuItem({caption: this.strSign,      value: 0 });
            me.menuSignatureEditSetup  = new Common.UI.MenuItem({caption: this.strSetup,     value: 2 });
            var menuEditSignSeparator = new Common.UI.MenuItem({ caption: '--' });

            me.menuImgRotate = new Common.UI.MenuItem({
                caption     : me.textRotate,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-rotate-90',
                            caption: this.textRotate90,
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-rotate-270',
                            caption: this.textRotate270,
                            value  : 0
                        }),
                        { caption: '--' },
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-flip-hor',
                            caption: this.textFlipH,
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-flip-vert',
                            caption: this.textFlipV,
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

            me.menuImgRemoveControl = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cc-remove',
                caption: me.textRemoveControl,
                value: 'remove'
            });

            me.menuImgControlSettings = new Common.UI.MenuItem({
                caption: me.textEditControls,
                value: 'settings'
            });

            var menuImgControlSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuImgEditPoints = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-edit-points',
                caption: me.textEditPoints
            });

            me.menuEditObjectSeparator = new Common.UI.MenuItem({
                caption: '--'
            });

            me.menuEditObject = new Common.UI.MenuItem({
                caption: me.textEditObject
            });

            this.pictureMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value){
                    if (_.isUndefined(value.imgProps))
                        return;

                    var notflow = !value.imgProps.value.get_CanBeFlow(),
                        wrapping = value.imgProps.value.get_WrappingStyle();

                    me.menuImageWrap._originalProps = value.imgProps.value;

                    var cls = 'menu__icon ';
                    if (notflow) {
                        for (var i = 0; i < 8; i++) {
                            me.menuImageWrap.menu.items[i].setChecked(false);
                        }
                        cls += 'btn-small-wrap-inline';
                    } else {
                        switch (wrapping) {
                            case Asc.c_oAscWrapStyle2.Inline:
                                me.menuImageWrap.menu.items[0].setChecked(true);
                                cls += 'btn-small-wrap-inline';
                                break;
                            case Asc.c_oAscWrapStyle2.Square:
                                me.menuImageWrap.menu.items[2].setChecked(true);
                                cls += 'btn-small-wrap-square';
                                break;
                            case Asc.c_oAscWrapStyle2.Tight:
                                me.menuImageWrap.menu.items[3].setChecked(true);
                                cls += 'btn-small-wrap-tight';
                                break;
                            case Asc.c_oAscWrapStyle2.Through:
                                me.menuImageWrap.menu.items[4].setChecked(true);
                                cls += 'btn-small-wrap-through';
                                break;
                            case Asc.c_oAscWrapStyle2.TopAndBottom:
                                me.menuImageWrap.menu.items[5].setChecked(true);
                                cls += 'btn-small-wrap-topandbottom';
                                break;
                            case Asc.c_oAscWrapStyle2.Behind:
                                me.menuImageWrap.menu.items[8].setChecked(true);
                                cls += 'btn-small-wrap-behind';
                                break;
                            case Asc.c_oAscWrapStyle2.InFront:
                                me.menuImageWrap.menu.items[7].setChecked(true);
                                cls += 'btn-small-wrap-infront';
                                break;
                            default:
                                for (var i = 0; i < 8; i++) {
                                    me.menuImageWrap.menu.items[i].setChecked(false);
                                }
                                cls += 'btn-small-wrap-infront';
                                break;
                        }
                    }
                    me.menuImageWrap.setIconCls(cls);
                    _.each(me.menuImageWrap.menu.items, function(item) {
                        item.setDisabled(notflow);
                    });

                    var onlyCommonProps = ( value.imgProps.isImg && value.imgProps.isChart || value.imgProps.isImg && value.imgProps.isShape ||
                        value.imgProps.isShape && value.imgProps.isChart);
                    if (onlyCommonProps) {
                        me.menuImageAdvanced.setCaption(me.advancedText);
                        me.menuImageAdvanced.setIconCls('menu__icon btn-menu-image');
                    } else {
                        me.menuImageAdvanced.setCaption((value.imgProps.isImg) ? me.imageText : ((value.imgProps.isChart) ? me.chartText : me.shapeText));
                        me.menuImageAdvanced.setIconCls('menu__icon ' + (value.imgProps.isImg ? 'btn-menu-image' : (value.imgProps.isChart ? 'btn-menu-chart' : 'btn-menu-shape')));
                    }

                    me.menuChartEdit.setVisible(!_.isNull(value.imgProps.value.get_ChartProperties()) && !onlyCommonProps);
                    me.menuOriginalSize.setVisible(value.imgProps.isOnlyImg || !value.imgProps.isChart && !value.imgProps.isShape);

                    var in_control = me.api.asc_IsContentControl(),
                        control_props = in_control ? me.api.asc_GetContentControlProperties() : null,
                        lock_type = (control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                        content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked,
                        is_form = control_props && control_props.get_FormPr();

                    me.menuImgRemoveControl.setVisible(in_control);
                    me.menuImgControlSettings.setVisible(in_control && me.mode.canEditContentControl && !is_form);
                    menuImgControlSeparator.setVisible(in_control);
                    if (in_control) {
                        me.menuImgRemoveControl.setDisabled(lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked);
                        me.menuImgRemoveControl.setCaption(is_form ? me.getControlLabel(control_props) : me.textRemoveControl);
                    }

                    var islocked = value.imgProps.locked || (value.headerProps!==undefined && value.headerProps.locked) || content_locked;
                    var pluginGuid = value.imgProps.value.asc_getPluginGuid();
                    me.menuImgReplace.setVisible(value.imgProps.isOnlyImg && (pluginGuid===null || pluginGuid===undefined));
                    if (me.menuImgReplace.isVisible())
                        me.menuImgReplace.setDisabled(islocked || pluginGuid===null);

                    var pluginGuidAvailable = (pluginGuid !== null && pluginGuid !== undefined);
                    me.menuEditObject.setVisible(pluginGuidAvailable);
                    me.menuEditObjectSeparator.setVisible(pluginGuidAvailable);

                    if (pluginGuidAvailable) {
                        var plugin = DE.getCollection('Common.Collections.Plugins').findWhere({guid: pluginGuid});
                        me.menuEditObject.setDisabled(!me.api.asc_canEditTableOleObject() && (plugin === null || plugin === undefined) || islocked);
                    }

                    me.menuImgReplace.menu.items[2].setVisible(me.mode.canRequestInsertImage || me.mode.fileChoiceUrl && me.mode.fileChoiceUrl.indexOf("{documentType}")>-1);

                    me.menuImgRotate.setVisible(!value.imgProps.isChart && (pluginGuid===null || pluginGuid===undefined));
                    if (me.menuImgRotate.isVisible()) {
                        me.menuImgRotate.setDisabled(islocked || value.imgProps.isSmartArt);
                        me.menuImgRotate.menu.items[3].setDisabled(value.imgProps.isSmartArtInternal);
                        me.menuImgRotate.menu.items[4].setDisabled(value.imgProps.isSmartArtInternal);
                    }
                    me.menuImgCrop.setVisible(me.api.asc_canEditCrop());
                    if (me.menuImgCrop.isVisible())
                        me.menuImgCrop.setDisabled(islocked);

                    if (me.menuChartEdit.isVisible())
                        me.menuChartEdit.setDisabled(islocked || value.imgProps.value.get_SeveralCharts());

                    me.menuOriginalSize.setDisabled(islocked || value.imgProps.value.get_ImageUrl()===null || value.imgProps.value.get_ImageUrl()===undefined);
                    me.menuImageAdvanced.setDisabled(islocked);
                    me.menuImageAlign.setDisabled( islocked || (wrapping == Asc.c_oAscWrapStyle2.Inline) );
                    if (!(islocked || (wrapping == Asc.c_oAscWrapStyle2.Inline))) {
                        var objcount = me.api.asc_getSelectedDrawingObjectsCount(),
                            alignto = Common.Utils.InternalSettings.get("de-img-align-to"); // 1 - page, 2 - margin, 3 - selected
                        me.menuImageAlign.menu.items[7].setDisabled(objcount==2 && (!alignto || alignto==3));
                        me.menuImageAlign.menu.items[8].setDisabled(objcount==2 && (!alignto || alignto==3));
                    }
                    me.menuImageArrange.setDisabled( (wrapping == Asc.c_oAscWrapStyle2.Inline) && !value.imgProps.value.get_FromGroup() || content_locked ||
                        (me.api && !me.api.CanUnGroup() && !me.api.CanGroup() && value.imgProps.isSmartArtInternal));
                    me.menuImageArrange.menu.items[0].setDisabled(value.imgProps.isSmartArtInternal);
                    me.menuImageArrange.menu.items[1].setDisabled(value.imgProps.isSmartArtInternal);
                    me.menuImageArrange.menu.items[2].setDisabled(value.imgProps.isSmartArtInternal);
                    me.menuImageArrange.menu.items[3].setDisabled(value.imgProps.isSmartArtInternal);

                    if (me.api) {
                        me.mnuUnGroup.setDisabled(islocked || !me.api.CanUnGroup());
                        me.mnuGroup.setDisabled(islocked || !me.api.CanGroup());
                        me.menuWrapPolygon.setDisabled(islocked || !me.api.CanChangeWrapPolygon());
                    }

                    me.menuImageWrap.setDisabled(islocked || value.imgProps.value.get_FromGroup() || (notflow && me.menuWrapPolygon.isDisabled()) ||
                        (!!control_props && control_props.get_SpecificType()==Asc.c_oAscContentControlSpecificType.Picture && !control_props.get_FormPr()));

                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuImgCopy.setDisabled(!cancopy);
                    me.menuImgCut.setDisabled(islocked || !cancopy);
                    me.menuImgPaste.setDisabled(islocked);
                    me.menuImgPrint.setVisible(me.mode.canPrint);
                    me.menuImgPrint.setDisabled(!cancopy);

                    var lockreview = Common.Utils.InternalSettings.get("de-accept-reject-lock");
                    me.menuImgAccept.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);
                    me.menuImgReject.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);
                    menuImgReviewSeparator.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);

                    var signGuid = (value.imgProps && value.imgProps.value && me.mode.isSignatureSupport) ? value.imgProps.value.asc_getSignatureId() : undefined,
                        isInSign = !!signGuid;
                    me.menuSignatureEditSign.setVisible(isInSign);
                    me.menuSignatureEditSetup.setVisible(isInSign);
                    menuEditSignSeparator.setVisible(isInSign);

                    if (isInSign) {
                        me.menuSignatureEditSign.cmpEl.attr('data-value', signGuid); // sign
                        me.menuSignatureEditSetup.cmpEl.attr('data-value', signGuid); // edit signature settings
                    }

                    var canEditPoints = me.api && me.api.asc_canEditGeometry();
                    me.menuImgEditPoints.setVisible(canEditPoints);
                    canEditPoints && me.menuImgEditPoints.setDisabled(islocked);
                },
                items: [
                    me.menuImgCut,
                    me.menuImgCopy,
                    me.menuImgPaste,
                    me.menuImgPrint,
                    me.menuEditObjectSeparator,
                    me.menuEditObject,
                    { caption: '--' },
                    me.menuImgAccept,
                    me.menuImgReject,
                    menuImgReviewSeparator,
                    me.menuSignatureEditSign,
                    me.menuSignatureEditSetup,
                    menuEditSignSeparator,
                    me.menuImgRemoveControl,
                    me.menuImgControlSettings,
                    menuImgControlSeparator,
                    me.menuImageArrange,
                    me.menuImageAlign,
                    me.menuImageWrap,
                    me.menuImgRotate,
                    { caption: '--' },
                    me.menuInsertCaption,
                    menuInsertCaptionSeparator,
                    me.menuSaveAsPicture,
                    menuSaveAsPictureSeparator,
                    me.menuImgCrop,
                    me.menuOriginalSize,
                    me.menuImgReplace,
                    me.menuChartEdit,
                    me.menuImgEditPoints,
                    me.menuImageAdvanced
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            /* table menu*/

            me.menuTableInsertCaption = new Common.UI.MenuItem({
                caption : me.txtInsertCaption
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
                caption     : me.cellAlignText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuTableCellTop = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-top',
                            caption     : me.textShapeAlignTop,
                            toggleGroup : 'popuptablecellalign',
                            checkmark   : false,
                            checkable   : true,
                            checked     : false,
                            valign      : Asc.c_oAscVertAlignJc.Top
                        }),
                        me.menuTableCellCenter = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-middle',
                            caption     : me.textShapeAlignMiddle,
                            toggleGroup : 'popuptablecellalign',
                            checkmark   : false,
                            checkable   : true,
                            checked     : false,
                            valign      : Asc.c_oAscVertAlignJc.Center
                        }),
                        me.menuTableCellBottom = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-bottom',
                            caption     : me.textShapeAlignBottom,
                            toggleGroup : 'popuptablecellalign',
                            checkmark   : false,
                            checkable   : true,
                            checked     : false,
                            valign      : Asc.c_oAscVertAlignJc.Bottom
                        })
                    ]
                })
            });

            me.menuTableAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-menu-table',
                caption        : me.advancedTableText
            });

            me.menuParagraphAdvancedInTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paragraph',
                caption     : me.advancedParagraphText
            });

            var menuHyperlinkSeparator = new Common.UI.MenuItem({
                caption     : '--'
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
                    items   : [
                        me.menuEditHyperlinkTable,
                        me.menuRemoveHyperlinkTable
                    ]
                })
            });

            me.menuTableRemoveForm = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cc-remove',
                caption: me.textRemove,
                value: 'remove'
            });

            me.menuTableRemoveControl = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cc-remove',
                caption: me.textRemoveControl,
                value: 'remove'
            });

            me.menuTableControlSettings = new Common.UI.MenuItem({
                caption: me.textSettings,
                value: 'settings'
            });

            var menuTableControl = new Common.UI.MenuItem({
                caption: me.textContentControls,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuTableRemoveControl,
                        me.menuTableControlSettings
                    ]
                })
            });

            me.menuTableTOC = new Common.UI.MenuItem({
                caption     : me.textTOC,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        {
                            caption: me.textSettings,
                            value: 'settings'
                        },
                        {
                            caption: me.textUpdateAll,
                            value: 'all'
                        },
                        {
                            caption: me.textUpdatePages,
                            value: 'pages'
                        }
                    ]
                })
            });

            /** coauthoring begin **/
            me.menuAddCommentTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            /** coauthoring end **/

            me.menuAddHyperlinkTable = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.hyperlinkText
            });

            me.menuTableFollow = new Common.UI.MenuItem({
                caption: me.textFollow
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
                    items   : [
                    ]
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

            me.menuTableAccept = new Common.UI.MenuItem({
                caption : me.textAccept,
                value : 'accept'
            });

            me.menuTableReject = new Common.UI.MenuItem({
                caption : me.textReject,
                value : 'reject'
            });

            var menuTableReviewSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuTablePrint = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-print',
                caption : me.txtPrintSelection
            });


            var menuEquationSeparatorInTable = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuTableDistRows = new Common.UI.MenuItem({
                caption : me.textDistributeRows,
                value: false
            });

            me.menuTableDistCols = new Common.UI.MenuItem({
                caption : me.textDistributeCols,
                value: true
            });

            me.menuTableDirection = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-text-orient-hor',
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
                    cls: 'ppm-toolbar shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuTableDirectH = new Common.UI.MenuItem({
                            caption     : me.directHText,
                            iconCls     : 'menu__icon btn-text-orient-hor',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : Asc.c_oAscCellTextDirection.LRTB
                        }),
                        me.menuTableDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'menu__icon btn-text-orient-rdown',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : Asc.c_oAscCellTextDirection.TBRL
                        }),
                        me.menuTableDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'menu__icon btn-text-orient-rup',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : Asc.c_oAscCellTextDirection.BTLR
                        })
                    ]
                })
            });

            me.menuTableStartNewList = new Common.UI.MenuItem({
                caption: me.textStartNewList
            });

            me.menuTableStartNumberingFrom = new Common.UI.MenuItem({
                caption: me.textStartNumberingFrom
            });

            me.menuTableContinueNumbering = new Common.UI.MenuItem({
                caption: me.textContinueNumbering
            });

            me.menuTableListIndents = new Common.UI.MenuItem({
                caption: me.textIndents
            });

            var menuNumberingTable = new Common.UI.MenuItem({
                caption     : me.bulletsText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuTableStartNewList,
                        me.menuTableStartNumberingFrom,
                        me.menuTableContinueNumbering,
                        me.menuTableListIndents
                    ]
                })
            });

            me.menuTableRefreshField = new Common.UI.MenuItem({
                caption: me.textRefreshField
            });
            me.menuTableEditField = new Common.UI.MenuItem({
                caption: me.textEditField
            });

            var menuTableFieldSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuTableEquation = new Common.UI.MenuItem({
                caption     : me.advancedEquationText,
                iconCls     : 'menu__icon btn-equation',
                menu        : me.createEquationMenu('popuptableeqinput', 'tl-tr')
            });

            me.menuTableSelectText = new Common.UI.MenuItem({
                caption     : me.selectText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    style   : 'width: 100px',
                    items   : [
                        new Common.UI.MenuItem({
                            caption: me.rowText,
                            value: 0
                        }),
                        new Common.UI.MenuItem({
                            caption: me.columnText,
                            value: 1
                        }),
                        new Common.UI.MenuItem({
                            caption: me.cellText,
                            value: 2
                        }),
                        new Common.UI.MenuItem({
                            caption: me.tableText,
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
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textSeveral,
                            value: 4
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
                    style   : 'width: 100px',
                    items   : [
                        new Common.UI.MenuItem({
                            caption: me.rowText,
                            value: 0
                        }),
                        new Common.UI.MenuItem({
                            caption: me.columnText,
                            value: 1
                        }),
                        new Common.UI.MenuItem({
                            caption: me.tableText,
                            value: 2
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textCells,
                            value: 3
                        })
                    ]
                })
            });

            this.tableMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value){
                    // table properties
                    if (_.isUndefined(value.tableProps))
                        return;

                    var isEquation= (value.mathProps && value.mathProps.value);

                    for (var i = 11; i < 31; i++) { // from menuEquationSeparatorInTable to menuAddCommentTable (except menuAddCommentTable)
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

                    var dir = value.tableProps.value.get_CellsTextDirection();
                    cls = '';
                    switch (dir) {
                        case Asc.c_oAscCellTextDirection.LRTB:
                            cls = 'menu__icon btn-text-orient-hor';
                            break;
                        case Asc.c_oAscCellTextDirection.TBRL:
                            cls = 'menu__icon btn-text-orient-rdown';
                            break;
                        case Asc.c_oAscCellTextDirection.BTLR:
                            cls = 'menu__icon btn-text-orient-rup';
                            break;
                    }
                    me.menuTableDirection.setIconCls(cls);
                    me.menuTableDirectH.setChecked(dir == Asc.c_oAscCellTextDirection.LRTB);
                    me.menuTableDirect90.setChecked(dir == Asc.c_oAscCellTextDirection.TBRL);
                    me.menuTableDirect270.setChecked(dir == Asc.c_oAscCellTextDirection.BTLR);

                    var block_control_lock = (value.paraProps) ? !value.paraProps.value.can_EditBlockContentControl() : false,
                        disabled = value.tableProps.locked || (value.headerProps!==undefined && value.headerProps.locked);

                    me.menuTableInsertText.setDisabled(disabled);
                    me.menuTableDeleteText.setDisabled(disabled);

                    if (me.api) {
                        me.mnuTableMerge.setDisabled(disabled || !me.api.CheckBeforeMergeCells());
                        me.mnuTableSplit.setDisabled(disabled || !me.api.CheckBeforeSplitCells());
                    }

                    me.menuTableDistRows.setDisabled(disabled);
                    me.menuTableDistCols.setDisabled(disabled);
                    me.menuTableCellAlign.setDisabled(disabled);
                    me.menuTableDirection.setDisabled(disabled);
                    me.menuTableAdvanced.setDisabled(disabled);

                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuTableCopy.setDisabled(!cancopy);
                    me.menuTableCut.setDisabled(disabled || !cancopy);
                    me.menuTablePaste.setDisabled(disabled);
                    me.menuTablePrint.setVisible(me.mode.canPrint);
                    me.menuTablePrint.setDisabled(!cancopy);

                    var lockreview = Common.Utils.InternalSettings.get("de-accept-reject-lock");
                    me.menuTableAccept.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);
                    me.menuTableReject.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);
                    menuTableReviewSeparator.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);

                    // bullets & numbering
                    var listId = me.api.asc_GetCurrentNumberingId(),
                        in_list = (listId !== null);
                    menuNumberingTable.setVisible(in_list);
                    if (in_list) {
                        var numLvl = me.api.asc_GetNumberingPr(listId).get_Lvl(me.api.asc_GetCurrentNumberingLvl()),
                            format = numLvl.get_Format(),
                            start = me.api.asc_GetCalculatedNumberingValue();
                        me.menuTableStartNewList.setVisible(numLvl.get_Start()!=start);
                        me.menuTableStartNewList.value = {start: numLvl.get_Start()};
                        me.menuTableStartNumberingFrom.setVisible(format != Asc.c_oAscNumberingFormat.Bullet);
                        me.menuTableStartNumberingFrom.value = {format: format, start: start};
                        me.menuTableStartNewList.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textSeparateList : me.textStartNewList);
                        me.menuTableContinueNumbering.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textJoinList : me.textContinueNumbering);
                        me.menuTableListIndents.value = {format: format, props: numLvl};
                    }

                    // hyperlink properties
                    var text = null;
                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }
                    me.menuAddHyperlinkTable.setVisible(value.hyperProps===undefined && text!==false);
                    menuHyperlinkTable.setVisible(value.hyperProps!==undefined);

                    me.menuEditHyperlinkTable.hyperProps = value.hyperProps;
                    me.menuRemoveHyperlinkTable.hyperProps = value.hyperProps;

                    if (text!==false) {
                        me.menuAddHyperlinkTable.hyperProps = {};
                        me.menuAddHyperlinkTable.hyperProps.value = new Asc.CHyperlinkProperty();
                        me.menuAddHyperlinkTable.hyperProps.value.put_Text(text);
                    }

                    // review move
                    var data = me.api.asc_GetRevisionsChangesStack(),
                        move = false;
                    me.menuTableFollow.value = null;
                    _.each(data, function(item) {
                        if ((item.get_Type()==Asc.c_oAscRevisionsChangeType.TextAdd || item.get_Type() == Asc.c_oAscRevisionsChangeType.TextRem) &&
                            item.get_MoveType()!=Asc.c_oAscRevisionsMove.NoMove) {
                            me.menuTableFollow.value = item;
                            move = true;
                        }
                    });
                    me.menuTableFollow.setVisible(move);

                    menuHyperlinkSeparator.setVisible(me.menuAddHyperlinkTable.isVisible() || menuHyperlinkTable.isVisible() || menuNumberingTable.isVisible() || me.menuTableFollow.isVisible());

                    // paragraph properties
                    me.menuParagraphAdvancedInTable.setVisible(value.paraProps!==undefined);

                    me._currentParaObjDisabled = disabled = value.paraProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    me.menuAddHyperlinkTable.setDisabled(disabled);
                    menuHyperlinkTable.setDisabled(disabled || value.hyperProps!==undefined && value.hyperProps.isSeveralLinks===true);
                    me.menuParagraphAdvancedInTable.setDisabled(disabled || block_control_lock);

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
                        eqlen = me.addEquationMenu(me.tableMenu, 10);
                    } else
                        me.clearEquationMenu(me.tableMenu, 10);
                    menuEquationSeparatorInTable.setVisible(isEquation && eqlen>0);

                    me.menuTableEquation.setVisible(isEquation);
                    me.menuTableEquation.setDisabled(disabled);
                    if (isEquation) {
                        var eq = me.api.asc_GetMathInputType(),
                            isInlineMath = me.api.asc_IsInlineMath(),
                            isEqToolbarHide = Common.Utils.InternalSettings.get('de-equation-toolbar-hide');

                        me.menuTableEquation.menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                        me.menuTableEquation.menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                        me.menuTableEquation.menu.items[8].options.isEquationInline = isInlineMath;
                        me.menuTableEquation.menu.items[8].setCaption(isInlineMath ? me.eqToDisplayText : me.eqToInlineText);
                        me.menuTableEquation.menu.items[9].options.isToolbarHide = isEqToolbarHide;
                        me.menuTableEquation.menu.items[9].setCaption(isEqToolbarHide ? me.showEqToolbar : me.hideEqToolbar);
                    }

                    var control_lock = (value.paraProps) ? (!value.paraProps.value.can_DeleteBlockContentControl() || !value.paraProps.value.can_EditBlockContentControl() ||
                        !value.paraProps.value.can_DeleteInlineContentControl() || !value.paraProps.value.can_EditInlineContentControl()) : false;
                    var in_toc = me.api.asc_GetTableOfContentsPr(true),
                        in_control = !in_toc && me.api.asc_IsContentControl();
                    if (in_control) {
                        var control_props = me.api.asc_GetContentControlProperties(),
                            lock_type = (control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                            is_form = control_props && control_props.get_FormPr();
                        me.menuTableRemoveForm.setVisible(is_form);
                        menuTableControl.setVisible(!is_form);
                        if (is_form) {
                            me.menuTableRemoveForm.setDisabled(lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked);
                            me.menuTableRemoveForm.setCaption(me.getControlLabel(control_props));
                        } else {
                            me.menuTableRemoveControl.setDisabled(lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked);
                            me.menuTableControlSettings.setVisible(me.mode.canEditContentControl);
                        }
                        var spectype = control_props ? control_props.get_SpecificType() : Asc.c_oAscContentControlSpecificType.None;
                        control_lock = control_lock || spectype==Asc.c_oAscContentControlSpecificType.CheckBox || spectype==Asc.c_oAscContentControlSpecificType.Picture ||
                            spectype==Asc.c_oAscContentControlSpecificType.ComboBox || spectype==Asc.c_oAscContentControlSpecificType.DropDownList || spectype==Asc.c_oAscContentControlSpecificType.DateTime;
                    } else {
                        menuTableControl.setVisible(in_control);
                        me.menuTableRemoveForm.setVisible(in_control);
                    }
                    me.menuTableTOC.setVisible(in_toc);

                    /** coauthoring begin **/
                    // comments
                    me.menuAddCommentTable.setVisible(me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments && !control_lock);
                    me.menuAddCommentTable.setDisabled(value.paraProps!==undefined && value.paraProps.locked===true);
                    /** coauthoring end **/

                    var in_field = me.api.asc_HaveFields(true);
                    me.menuTableRefreshField.setVisible(!!in_field);
                    me.menuTableRefreshField.setDisabled(disabled);
                    me.menuTableEditField.setVisible(!!in_field);
                    me.menuTableEditField.setDisabled(disabled);
                    menuTableFieldSeparator.setVisible(!!in_field);
                },
                items: [
                    me.menuSpellCheckTable,
                    menuSpellcheckTableSeparator,
                    me.menuTableCut,
                    me.menuTableCopy,
                    me.menuTablePaste,
                    me.menuTablePrint,
                    { caption: '--' },
                    me.menuTableAccept,
                    me.menuTableReject,
                    menuTableReviewSeparator,
                    menuEquationSeparatorInTable,
                    me.menuTableRefreshField,
                    me.menuTableEditField,
                    menuTableFieldSeparator,
                    me.menuTableSelectText,
                    me.menuTableInsertText,
                    me.menuTableDeleteText,
                    { caption: '--' },
                    me.mnuTableMerge,
                    me.mnuTableSplit,
                    { caption: '--' },
                    me.menuTableDistRows,
                    me.menuTableDistCols,
                    { caption: '--' },
                    me.menuTableCellAlign,
                    me.menuTableDirection,
                    { caption: '--' },
                    me.menuTableInsertCaption,
                    { caption: '--' },
                    me.menuTableAdvanced,
                    { caption: '--' },
                    /** coauthoring begin **/
                    me.menuAddCommentTable,
                    /** coauthoring end **/
                    menuNumberingTable,
                    me.menuAddHyperlinkTable,
                    menuHyperlinkTable,
                    me.menuTableFollow,
                    menuHyperlinkSeparator,
                    me.menuTableRemoveForm,
                    menuTableControl,
                    me.menuTableTOC,
                    me.menuParagraphAdvancedInTable,
                    me.menuTableEquation
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

            /* text menu */

            me.menuParagraphBreakBefore = new Common.UI.MenuItem({
                caption     : me.breakBeforeText,
                checkable   : true
            });

            me.menuParagraphKeepLines = new Common.UI.MenuItem({
                caption     : me.keepLinesText,
                checkable   : true
            });

            me.menuParagraphVAlign = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-align-top',
                caption     : me.vertAlignText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuParagraphTop = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-top',
                            caption     : me.textShapeAlignTop,
                            checkmark   : false,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : Asc.c_oAscVAlign.Top
                        }),
                        me.menuParagraphCenter = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-middle',
                            caption     : me.textShapeAlignMiddle,
                            checkmark   : false,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : Asc.c_oAscVAlign.Center
                        }),
                        me.menuParagraphBottom = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-bottom',
                            caption     : me.textShapeAlignBottom,
                            checkmark   : false,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : Asc.c_oAscVAlign.Bottom
                        })
                    ]
                })
            });

            me.menuParagraphDirection = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-text-orient-hor',
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
                    cls: 'ppm-toolbar shifted-right',
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

            me.menuParagraphAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paragraph',
                caption     : me.advancedParagraphText
            });

            me.menuFrameAdvanced = new Common.UI.MenuItem({
                caption     : me.advancedFrameText
            });

            me.menuDropCapAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-dropcap-intext icon-rtl',
                caption     : me.advancedDropCapText
            });

            me.menuParagraphEquation = new Common.UI.MenuItem({
                caption     : me.advancedEquationText,
                iconCls     : 'menu__icon btn-equation',
                menu        : me.createEquationMenu('popupparaeqinput', 'tl-tr')
            });
            /** coauthoring begin **/
            var menuCommentSeparatorPara = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuAddCommentPara = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            /** coauthoring end **/

            var menuHyperlinkParaSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuAddHyperlinkPara = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.hyperlinkText
            });

            me.menuEditHyperlinkPara = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText
            });

            me.menuRemoveHyperlinkPara = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            });

            var menuHyperlinkPara = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.hyperlinkText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuEditHyperlinkPara,
                        me.menuRemoveHyperlinkPara
                    ]
                })
            });

            var menuStyleSeparator = new Common.UI.MenuItemSeparator();
            var menuStyle = new Common.UI.MenuItem({
                caption: me.styleText,
                menu: new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        me.menuStyleSave = new Common.UI.MenuItem({
                            caption: me.saveStyleText
                        }),
                        me.menuStyleUpdate = new Common.UI.MenuItem({
                            caption: me.updateStyleText.replace('%1', window.currentStyleName)
                        })
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

            me.menuParaAccept = new Common.UI.MenuItem({
                caption : me.textAccept,
                value : 'accept'
            });

            me.menuParaReject = new Common.UI.MenuItem({
                caption : me.textReject,
                value : 'reject'
            });

            var menuParaReviewSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParaPrint = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-print',
                caption : me.txtPrintSelection
            });

            var menuEquationSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParaRemoveControl = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cc-remove',
                caption: me.textRemoveControl,
                value: 'remove'
            });

            me.menuParaControlSettings = new Common.UI.MenuItem(
                {
                    caption: me.textEditControls,
                    value: 'settings'
                });

            var menuParaControlSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParaTOCSettings = new Common.UI.MenuItem({
                caption: me.textTOCSettings,
                value: 'settings'
            });

            me.menuParaTOCRefresh = new Common.UI.MenuItem({
                caption     : me.textUpdateTOC,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        {
                            caption: me.textUpdateAll,
                            value: 'all'
                        },
                        {
                            caption: me.textUpdatePages,
                            value: 'pages'
                        }
                    ]
                })
            });

            var menuParaTOCSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParaRefreshField = new Common.UI.MenuItem({
                caption: me.textRefreshField
            });
            me.menuParaEditField = new Common.UI.MenuItem({
                caption: me.textEditField
            });

            var menuParaFieldSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParaStartNewList = new Common.UI.MenuItem({
                caption: me.textStartNewList
            });

            me.menuParaStartNumberingFrom = new Common.UI.MenuItem({
                caption: me.textStartNumberingFrom
            });

            me.menuParaContinueNumbering = new Common.UI.MenuItem({
                caption: me.textContinueNumbering
            });

            me.menuParaListIndents = new Common.UI.MenuItem({
                caption: me.textIndents
            });

            var menuParaNumberingSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuParaFollow = new Common.UI.MenuItem({
                caption: me.textFollow
            });

            var menuParaFollowSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            this.textMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                initMenu: function(value){
                    var isInShape = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ShapeProperties()));
                    var isInChart = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ChartProperties()));
                    var isEquation= (value.mathProps && value.mathProps.value);
                    var in_toc = me.api.asc_GetTableOfContentsPr(true),
                        in_control = !in_toc && me.api.asc_IsContentControl(),
                        control_props = in_control ? me.api.asc_GetContentControlProperties() : null,
                        block_control_lock = (value.paraProps) ? !value.paraProps.value.can_EditBlockContentControl() : false,
                        is_form = control_props && control_props.get_FormPr();

                    me.menuParagraphVAlign.setVisible(isInShape && !isInChart && !isEquation && !(is_form && control_props.get_FormPr().get_Fixed())); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    me.menuParagraphDirection.setVisible(isInShape && !isInChart && !isEquation && !(is_form && control_props.get_FormPr().get_Fixed())); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    if ( isInShape || isInChart ) {
                        var align = value.imgProps.value.get_VerticalTextAlign();
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

                        var dir = value.imgProps.value.get_Vert();
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
                    }
                    me.menuParagraphAdvanced.isChart = (value.imgProps && value.imgProps.isChart);
                    me.menuParagraphAdvanced.isSmartArtInternal = (value.imgProps && value.imgProps.isSmartArtInternal);
                    me.menuParagraphBreakBefore.setVisible(!isInShape && !isInChart && !isEquation);
                    me.menuParagraphKeepLines.setVisible(!isInShape && !isInChart && !isEquation);
                    if (value.paraProps) {
                        me.menuParagraphBreakBefore.setChecked(value.paraProps.value.get_PageBreakBefore());
                        me.menuParagraphKeepLines.setChecked(value.paraProps.value.get_KeepLines());
                    }

                    var text = null;
                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }
                    me.menuAddHyperlinkPara.setVisible(value.hyperProps===undefined && text!==false);
                    menuHyperlinkPara.setVisible(value.hyperProps!==undefined);
                    menuHyperlinkParaSeparator.setVisible(me.menuAddHyperlinkPara.isVisible() || menuHyperlinkPara.isVisible());
                    me.menuEditHyperlinkPara.hyperProps = value.hyperProps;
                    me.menuRemoveHyperlinkPara.hyperProps = value.hyperProps;
                    if (text!==false) {
                        me.menuAddHyperlinkPara.hyperProps = {};
                        me.menuAddHyperlinkPara.hyperProps.value = new Asc.CHyperlinkProperty();
                        me.menuAddHyperlinkPara.hyperProps.value.put_Text(text);
                    }
                    var disabled = value.paraProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    me._currentParaObjDisabled = disabled;
                    me.menuAddHyperlinkPara.setDisabled(disabled);
                    menuHyperlinkPara.setDisabled(disabled || value.hyperProps!==undefined && value.hyperProps.isSeveralLinks===true);

                    // review move
                    var data = me.api.asc_GetRevisionsChangesStack(),
                        move = false;
                    me.menuParaFollow.value = null;
                    _.each(data, function(item) {
                        if ((item.get_Type()==Asc.c_oAscRevisionsChangeType.TextAdd || item.get_Type() == Asc.c_oAscRevisionsChangeType.TextRem) &&
                            item.get_MoveType()!=Asc.c_oAscRevisionsMove.NoMove) {
                            me.menuParaFollow.value = item;
                            move = true;
                        }
                    });
                    me.menuParaFollow.setVisible(move);
                    menuParaFollowSeparator.setVisible(move);

                    me.menuParagraphBreakBefore.setDisabled(disabled || block_control_lock || !_.isUndefined(value.headerProps) || !_.isUndefined(value.imgProps));
                    me.menuParagraphKeepLines.setDisabled(disabled || block_control_lock);
                    me.menuParagraphAdvanced.setDisabled(disabled || block_control_lock || (is_form && is_form.get_Fixed()));
                    me.menuFrameAdvanced.setDisabled(disabled);
                    me.menuDropCapAdvanced.setDisabled(disabled);
                    me.menuParagraphVAlign.setDisabled(disabled);
                    me.menuParagraphDirection.setDisabled(disabled);

                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuParaCopy.setDisabled(!cancopy);
                    me.menuParaCut.setDisabled(disabled || !cancopy);
                    me.menuParaPaste.setDisabled(disabled);
                    me.menuParaPrint.setVisible(me.mode.canPrint);
                    me.menuParaPrint.setDisabled(!cancopy);

                    var lockreview = Common.Utils.InternalSettings.get("de-accept-reject-lock");
                    me.menuParaAccept.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);
                    me.menuParaReject.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);
                    menuParaReviewSeparator.setVisible(me.mode.canReview && !me.mode.isReviewOnly && !lockreview);

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
                        eqlen = me.addEquationMenu(me.textMenu, 18);
                    } else
                        me.clearEquationMenu(me.textMenu, 18);
                    menuEquationSeparator.setVisible(isEquation && eqlen>0);
                    me.menuEquationInsertCaption.setVisible(isEquation);
                    menuEquationInsertCaptionSeparator.setVisible(isEquation);

                    me.menuParagraphEquation.setVisible(isEquation);
                    me.menuParagraphEquation.setDisabled(disabled);
                    if (isEquation) {
                        var eq = me.api.asc_GetMathInputType(),
                            isInlineMath = me.api.asc_IsInlineMath(),
                            isEqToolbarHide = Common.Utils.InternalSettings.get('de-equation-toolbar-hide');

                        me.menuParagraphEquation.menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                        me.menuParagraphEquation.menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                        me.menuParagraphEquation.menu.items[8].options.isEquationInline = isInlineMath;
                        me.menuParagraphEquation.menu.items[8].setCaption(isInlineMath ? me.eqToDisplayText : me.eqToInlineText);
                        me.menuParagraphEquation.menu.items[9].options.isToolbarHide = isEqToolbarHide;
                        me.menuParagraphEquation.menu.items[9].setCaption(isEqToolbarHide ? me.showEqToolbar : me.hideEqToolbar);
                    }

                    var frame_pr = value.paraProps.value.get_FramePr();
                    me.menuFrameAdvanced.setVisible(frame_pr !== undefined);
                    me.menuDropCapAdvanced.setVisible(frame_pr !== undefined);
                    if (frame_pr)
                        me.menuDropCapAdvanced.setIconCls((frame_pr.get_DropCap()===Asc.c_oAscDropCap.Drop ? 'menu__icon btn-dropcap-intext' : 'menu__icon btn-dropcap-inmargin') + ' icon-rtl');

                    var edit_style = me.mode.canEditStyles && !isInChart && !(value.imgProps && value.imgProps.isSmartArtInternal);
                    menuStyleSeparator.setVisible(edit_style);
                    menuStyle.setVisible(edit_style);
                    if (edit_style) {
                        me.menuStyleUpdate.setCaption(me.updateStyleText.replace('%1', DE.getController('Main').translationTable[window.currentStyleName] || window.currentStyleName));
                    }

                    var control_lock = (value.paraProps) ? (!value.paraProps.value.can_DeleteBlockContentControl() || !value.paraProps.value.can_EditBlockContentControl() ||
                        !value.paraProps.value.can_DeleteInlineContentControl() || !value.paraProps.value.can_EditInlineContentControl()) : false;

                    me.menuParaRemoveControl.setVisible(in_control);
                    me.menuParaControlSettings.setVisible(in_control && me.mode.canEditContentControl && !is_form);
                    menuParaControlSeparator.setVisible(in_control);
                    if (in_control) {
                        var lock_type = (control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;
                        me.menuParaRemoveControl.setDisabled(lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked);
                        me.menuParaRemoveControl.setCaption(is_form ? me.getControlLabel(control_props) : me.textRemoveControl);

                        var spectype = control_props ? control_props.get_SpecificType() : Asc.c_oAscContentControlSpecificType.None;
                        control_lock = control_lock || spectype==Asc.c_oAscContentControlSpecificType.CheckBox || spectype==Asc.c_oAscContentControlSpecificType.Picture ||
                            spectype==Asc.c_oAscContentControlSpecificType.ComboBox || spectype==Asc.c_oAscContentControlSpecificType.DropDownList || spectype==Asc.c_oAscContentControlSpecificType.DateTime;

                    }
                    me.menuParaTOCSettings.setVisible(in_toc);
                    me.menuParaTOCRefresh.setVisible(in_toc);
                    menuParaTOCSeparator.setVisible(in_toc);

                    /** coauthoring begin **/
                    var isVisible = !isInChart && me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments && !control_lock;
                    if (me.mode.compatibleFeatures)
                        isVisible = isVisible && !isInShape;
                    menuCommentSeparatorPara.setVisible(isVisible);
                    me.menuAddCommentPara.setVisible(isVisible);
                    me.menuAddCommentPara.setDisabled(value.paraProps && value.paraProps.locked === true);
                    /** coauthoring end **/

                    var in_field = me.api.asc_HaveFields(true);
                    me.menuParaRefreshField.setVisible(!!in_field);
                    me.menuParaRefreshField.setDisabled(disabled);
                    me.menuParaEditField.setVisible(!!in_field);
                    me.menuParaEditField.setDisabled(disabled);
                    menuParaFieldSeparator.setVisible(!!in_field);

                    var listId = me.api.asc_GetCurrentNumberingId(),
                        in_list = (listId !== null);
                    menuParaNumberingSeparator.setVisible(in_list); // hide when first item is selected
                    me.menuParaStartNewList.setVisible(in_list);
                    me.menuParaStartNumberingFrom.setVisible(in_list);
                    me.menuParaContinueNumbering.setVisible(in_list);
                    me.menuParaListIndents.setVisible(in_list);
                    if (in_list) {
                        var level = me.api.asc_GetCurrentNumberingLvl(),
                            numLvl = me.api.asc_GetNumberingPr(listId).get_Lvl(level),
                            format = numLvl.get_Format(),
                            start = me.api.asc_GetCalculatedNumberingValue();
                        me.menuParaStartNewList.setVisible(numLvl.get_Start()!=start);
                        me.menuParaStartNewList.value = {start: numLvl.get_Start()};
                        me.menuParaStartNumberingFrom.setVisible(format != Asc.c_oAscNumberingFormat.Bullet);
                        me.menuParaStartNumberingFrom.value = {format: format, start: start};
                        me.menuParaStartNewList.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textSeparateList : me.textStartNewList);
                        me.menuParaContinueNumbering.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textJoinList : me.textContinueNumbering);
                        me.menuParaListIndents.value = {listId: listId, level: level, format: format, props: numLvl};
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
                    me.menuParaPrint,
                    menuParaReviewSeparator,
                    me.menuParaAccept,
                    me.menuParaReject,
                    menuEquationInsertCaptionSeparator,
                    me.menuEquationInsertCaption,
                    { caption: '--' },
                    menuEquationSeparator,
                    me.menuParaRemoveControl,
                    me.menuParaControlSettings,
                    menuParaControlSeparator,
                    me.menuParaRefreshField,
                    me.menuParaEditField,
                    menuParaFieldSeparator,
                    me.menuParaTOCSettings,
                    me.menuParaTOCRefresh,
                    menuParaTOCSeparator,
                    me.menuParagraphBreakBefore,
                    me.menuParagraphKeepLines,
                    me.menuParagraphVAlign,
                    me.menuParagraphDirection,
                    me.menuParagraphAdvanced,
                    me.menuFrameAdvanced,
                    me.menuDropCapAdvanced,
                    me.menuParagraphEquation,
                    /** coauthoring begin **/
                    menuCommentSeparatorPara,
                    me.menuAddCommentPara,
                    /** coauthoring end **/
                    menuHyperlinkParaSeparator,
                    me.menuAddHyperlinkPara,
                    menuHyperlinkPara,
                    menuParaFollowSeparator,
                    me.menuParaFollow,
                    menuParaNumberingSeparator,
                    me.menuParaStartNewList,
                    me.menuParaStartNumberingFrom,
                    me.menuParaContinueNumbering,
                    me.menuParaListIndents,
                    menuStyleSeparator,
                    menuStyle
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

            /* header/footer menu */
            var menuEditHeaderFooter = new Common.UI.MenuItem({
                caption: me.editHeaderText
            });

            this.hdrMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function(value){
                    menuEditHeaderFooter.setCaption(value.Header ? me.editHeaderText : me.editFooterText);
                    menuEditHeaderFooter.off('click').on('click', function(item) {
                        if (me.api){
                            if (value.Header) {
                                me.api.GoToHeader(value.PageNum);
                            }
                            else
                                me.api.GoToFooter(value.PageNum);
                            me.fireEvent('editcomplete', me);
                        }
                    });
                },
                items: [
                    menuEditHeaderFooter
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            var nextpage = $('#id_buttonNextPage');
            nextpage.attr('data-toggle', 'tooltip');
            nextpage.tooltip({
                title       : me.textNextPage + Common.Utils.String.platformKey('Alt+PgDn'),
                placement   : 'top-right'
            });

            var prevpage = $('#id_buttonPrevPage');
            prevpage.attr('data-toggle', 'tooltip');
            prevpage.tooltip({
                title       : me.textPrevPage + Common.Utils.String.platformKey('Alt+PgUp'),
                placement   : 'top-right'
            });

            this.fireEvent('createdelayedelements', [this, 'edit']);
        };

        dh.createDelayedElementsViewer = function() {
            var me = this;

            if (me.menuViewCopy) return; // menu is already inited

            me.menuViewCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption: me.textCopy,
                value: 'copy'
            });

            me.menuViewPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption : me.textPaste,
                value : 'paste'
            });

            me.menuViewCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption : me.textCut,
                value : 'cut'
            });

            me.menuViewUndo = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-undo',
                caption: me.textUndo
            });

            me.menuViewCopySeparator = new Common.UI.MenuItem({
                caption: '--'
            });

            me.menuViewAddComment = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption: me.addCommentText
            });

            me.menuSignatureViewSign   = new Common.UI.MenuItem({caption: this.strSign,      value: 0 });
            me.menuSignatureDetails    = new Common.UI.MenuItem({caption: this.strDetails,   value: 1 });
            me.menuSignatureViewSetup  = new Common.UI.MenuItem({caption: this.strSetup,     value: 2 });
            me.menuSignatureRemove     = new Common.UI.MenuItem({caption: this.strDelete,    value: 3 });
            me.menuViewSignSeparator   = new Common.UI.MenuItem({caption: '--' });

            me.menuViewPrint = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-print',
                caption : me.txtPrintSelection
            });

            this.viewModeMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function (value) {
                    var isInChart = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ChartProperties())),
                        isInShape = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ShapeProperties())),
                        signGuid = (value.imgProps && value.imgProps.value && me.mode.isSignatureSupport) ? value.imgProps.value.asc_getSignatureId() : undefined,
                        signProps = (signGuid) ? me.api.asc_getSignatureSetup(signGuid) : null,
                        isInSign = !!signProps && me._canProtect,
                        control_lock = (value.paraProps) ? (!value.paraProps.value.can_DeleteBlockContentControl() || !value.paraProps.value.can_EditBlockContentControl() ||
                            !value.paraProps.value.can_DeleteInlineContentControl() || !value.paraProps.value.can_EditInlineContentControl()) : false,
                        canComment = !isInChart && me.api.can_AddQuotedComment() !== false && me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled && !control_lock,
                        canEditControl = false;

                    if (me.mode.compatibleFeatures)
                        canComment = canComment && !isInShape;
                    if (me.api.asc_IsContentControl()) {
                        var control_props = me.api.asc_GetContentControlProperties(),
                            spectype = control_props ? control_props.get_SpecificType() : Asc.c_oAscContentControlSpecificType.None;
                        canComment = canComment && !(spectype==Asc.c_oAscContentControlSpecificType.CheckBox || spectype==Asc.c_oAscContentControlSpecificType.Picture ||
                            spectype==Asc.c_oAscContentControlSpecificType.ComboBox || spectype==Asc.c_oAscContentControlSpecificType.DropDownList || spectype==Asc.c_oAscContentControlSpecificType.DateTime);

                        canEditControl = spectype !== undefined && (spectype === Asc.c_oAscContentControlSpecificType.None || spectype === Asc.c_oAscContentControlSpecificType.ComboBox || spectype === Asc.c_oAscContentControlSpecificType.Complex) && !control_lock;
                    }

                    me.menuViewUndo.setVisible(me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    me.menuViewUndo.setDisabled(!me.api.asc_getCanUndo() || me._docProtection.isReadOnly);
                    me.menuViewCopySeparator.setVisible(isInSign);

                    var isRequested = (signProps) ? signProps.asc_getRequested() : false;
                    me.menuSignatureViewSign.setVisible(isInSign && isRequested);
                    me.menuSignatureDetails.setVisible(isInSign && !isRequested);
                    me.menuSignatureViewSetup.setVisible(isInSign);
                    me.menuSignatureRemove.setVisible(isInSign && !isRequested);
                    me.menuViewSignSeparator.setVisible(canComment);

                    if (isInSign) {
                        me.menuSignatureViewSign.cmpEl.attr('data-value', signGuid); // sign
                        me.menuSignatureDetails.cmpEl.attr('data-value', signProps.asc_getId()); // view certificate
                        me.menuSignatureViewSetup.cmpEl.attr('data-value', signGuid); // view signature settings
                        me.menuSignatureRemove.cmpEl.attr('data-value', signGuid);
                    }

                    me.menuViewAddComment.setVisible(canComment);
                    me.menuViewAddComment.setDisabled(value.paraProps && value.paraProps.locked === true || me._docProtection.isReadOnly || me._docProtection.isFormsOnly);

                    var disabled = value.paraProps && value.paraProps.locked === true;
                    var cancopy = me.api && me.api.can_CopyCut();
                    me.menuViewCopy.setDisabled(!cancopy);
                    me.menuViewCut.setVisible(me._fillFormMode && canEditControl);
                    me.menuViewCut.setDisabled(disabled || !cancopy || me._docProtection.isReadOnly || me._docProtection.isCommentsOnly);
                    me.menuViewPaste.setVisible(me._fillFormMode && canEditControl);
                    me.menuViewPaste.setDisabled(disabled || me._docProtection.isReadOnly || me._docProtection.isCommentsOnly);
                    me.menuViewPrint.setVisible(me.mode.canPrint && !me._fillFormMode);
                    me.menuViewPrint.setDisabled(!cancopy);

                },
                items: [
                    me.menuViewCut,
                    me.menuViewCopy,
                    me.menuViewPaste,
                    me.menuViewUndo,
                    me.menuViewPrint,
                    me.menuViewCopySeparator,
                    me.menuSignatureViewSign,
                    me.menuSignatureDetails,
                    me.menuSignatureViewSetup,
                    me.menuSignatureRemove,
                    me.menuViewSignSeparator,
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

            this.fireEvent('createdelayedelements', [this, 'view']);
        };

        dh.createDelayedElementsPDFViewer = function() {
            var me = this;

            if (me.menuPDFViewCopy) return; // menu is already inited

            me.menuPDFViewCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption: me.textCopy,
                value: 'copy'
            });

            this.viewPDFModeMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                initMenu: function (value) {
                    me.menuPDFViewCopy.setDisabled(!(me.api && me.api.can_CopyCut()));
                },
                items: [
                    me.menuPDFViewCopy
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