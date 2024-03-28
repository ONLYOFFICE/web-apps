/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/util/utils',
    'common/main/lib/component/Menu',
    'common/main/lib/view/CopyWarningDialog',
    'presentationeditor/main/app/view/HyperlinkSettingsDialog',
//    'common/main/lib/view/InsertTableDialog',
    'presentationeditor/main/app/view/ParagraphSettingsAdvanced',
    'presentationeditor/main/app/view/ShapeSettingsAdvanced',
    'presentationeditor/main/app/view/TableSettingsAdvanced'
], function ($, _, Backbone, gateway) { 'use strict';

    PE.Views.DocumentHolder =  Backbone.View.extend(_.extend({
        el: '#editor_sdk',

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            var me = this;

            me.slidesCount = 0;
            me._currentMathObj = undefined;
            me._currentParaObjDisabled = false;
            me._currentSpellObj = undefined;
            me._currLang        = {};
            me._state = {unitsChanged: true};
            me._isDisabled = false;
            me._preventCustomClick = null;
            me._hasCustomItems = false;

            Common.NotificationCenter.on('settings:unitschanged', _.bind(this.unitsChanged, this));
        },

        render: function () {
            this.fireEvent('render:before', this);

            this.cmpEl = $(this.el);

            this.fireEvent('render:after', this);
            return this;
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        setMode: function(m) {
            this.mode = m;
            return this;
        },

        focus: function() {
            var me = this;
            _.defer(function(){  me.cmpEl.focus(); }, 50);
        },

        changeLanguageMenu: function(menu) {
            var me = this;
            if (me._currLang.id===null || me._currLang.id===undefined) {
                menu.clearAll();
            } else {
                var index = _.findIndex(menu.items, {langid: me._currLang.id});
                (index>-1) && !menu.items[index].checked && menu.setChecked(index, true);
            }
        },

        addWordVariants: function(isParagraph) {
            var me = this;
            if (!me.textMenu || !me.textMenu.isVisible() && !me.tableMenu.isVisible()) return;

            if (_.isUndefined(isParagraph)) {
                isParagraph = me.textMenu.isVisible();
            }

            me.clearWordVariants(isParagraph);

            var moreMenu  = (isParagraph) ? me.menuSpellMorePara : me.menuSpellMoreTable;
            var spellMenu = (isParagraph) ? me.menuSpellPara : me.menuSpellTable;
            var arr = [],
                arrMore = [];
            var variants = me._currentSpellObj.get_Variants();

            if (variants.length > 0) {
                moreMenu.setVisible(variants.length > 3);
                moreMenu.setDisabled(me._currentParaObjDisabled);

                _.each(variants, function(variant, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption     : variant,
                        spellword   : true,
                        disabled    : me._currentParaObjDisabled
                    }).on('click', function(item, e) {
                        if (me.api) {
                            me.api.asc_replaceMisspelledWord(item.caption, me._currentSpellObj);
                            me.fireEvent('editcomplete', me);
                        }
                    });

                    (index < 3) ? arr.push(mnu) : arrMore.push(mnu);
                });

                if (arr.length > 0) {
                    if (isParagraph) {
                        _.each(arr, function(variant, index){
                            me.textMenu.insertItem(index, variant);
                        })
                    } else {
                        _.each(arr, function(variant, index){
                            me.menuSpellCheckTable.menu.insertItem(index, variant);
                        })
                    }
                }

                if (arrMore.length > 0) {
                    _.each(arrMore, function(variant, index){
                        moreMenu.menu.addItem(variant);
                    });
                }

                spellMenu.setVisible(false);
            } else {
                moreMenu.setVisible(false);
                spellMenu.setVisible(true);
                spellMenu.setCaption(me.noSpellVariantsText);
            }
        },

        clearWordVariants: function(isParagraph) {
            var me = this;
            var spellMenu = (isParagraph) ? me.textMenu : me.menuSpellCheckTable.menu;

            for (var i = 0; i < spellMenu.items.length; i++) {
                if (spellMenu.items[i].options.spellword) {
                    if (spellMenu.checkeditem == spellMenu.items[i]) {
                        spellMenu.checkeditem = undefined;
                        spellMenu.activeItem  = undefined;
                    }

                    spellMenu.removeItem(spellMenu.items[i]);
                    i--;
                }
            }
            (isParagraph) ? me.menuSpellMorePara.menu.removeAll() : me.menuSpellMoreTable.menu.removeAll();

            me.menuSpellMorePara.menu.checkeditem   = undefined;
            me.menuSpellMorePara.menu.activeItem    = undefined;
            me.menuSpellMoreTable.menu.checkeditem  = undefined;
            me.menuSpellMoreTable.menu.activeItem   = undefined;
        },

        initEquationMenu: function() {
            var me = this;
            if (!me._currentMathObj) return;
            var type = me._currentMathObj.get_Type(),
                value = me._currentMathObj,
                mnu, arr = [];

            switch (type) {
                case Asc.c_oAscMathInterfaceType.Accent:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtRemoveAccentChar,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_AccentCharacter'}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.BorderBox:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtBorderProps,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            cls: 'shifted-right',
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: value.get_HideTop() ? me.txtAddTop : me.txtHideTop,
                                    equationProps: {type: type, callback: 'put_HideTop', value: !value.get_HideTop()}
                                },
                                {
                                    caption: value.get_HideBottom() ? me.txtAddBottom : me.txtHideBottom,
                                    equationProps: {type: type, callback: 'put_HideBottom', value: !value.get_HideBottom()}
                                },
                                {
                                    caption: value.get_HideLeft() ? me.txtAddLeft : me.txtHideLeft,
                                    equationProps: {type: type, callback: 'put_HideLeft', value: !value.get_HideLeft()}
                                },
                                {
                                    caption: value.get_HideRight() ? me.txtAddRight : me.txtHideRight,
                                    equationProps: {type: type, callback: 'put_HideRight', value: !value.get_HideRight()}
                                },
                                {
                                    caption: value.get_HideHor() ? me.txtAddHor : me.txtHideHor,
                                    equationProps: {type: type, callback: 'put_HideHor', value: !value.get_HideHor()}
                                },
                                {
                                    caption: value.get_HideVer() ? me.txtAddVer : me.txtHideVer,
                                    equationProps: {type: type, callback: 'put_HideVer', value: !value.get_HideVer()}
                                },
                                {
                                    caption: value.get_HideTopLTR() ? me.txtAddLT : me.txtHideLT,
                                    equationProps: {type: type, callback: 'put_HideTopLTR', value: !value.get_HideTopLTR()}
                                },
                                {
                                    caption: value.get_HideTopRTL() ? me.txtAddLB : me.txtHideLB,
                                    equationProps: {type: type, callback: 'put_HideTopRTL', value: !value.get_HideTopRTL()}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.Bar:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtRemoveBar,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_Bar'}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceBarPos.Top) ? me.txtUnderbar : me.txtOverbar,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceBarPos.Top) ? Asc.c_oAscMathInterfaceBarPos.Bottom : Asc.c_oAscMathInterfaceBarPos.Top}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.Script:
                    var scripttype = value.get_ScriptType();
                    if (scripttype == Asc.c_oAscMathInterfaceScript.PreSubSup) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtScriptsAfter,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.SubSup}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemScripts,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.None}
                        });
                        arr.push(mnu);
                    } else {
                        if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtScriptsBefore,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.PreSubSup}
                            });
                            arr.push(mnu);
                        }
                        if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup || scripttype == Asc.c_oAscMathInterfaceScript.Sub ) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtRemSubscript,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) ? Asc.c_oAscMathInterfaceScript.Sup : Asc.c_oAscMathInterfaceScript.None }
                            });
                            arr.push(mnu);
                        }
                        if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup || scripttype == Asc.c_oAscMathInterfaceScript.Sup ) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtRemSuperscript,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) ? Asc.c_oAscMathInterfaceScript.Sub : Asc.c_oAscMathInterfaceScript.None }
                            });
                            arr.push(mnu);
                        }
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Fraction:
                    var fraction = value.get_FractionType();
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Skewed || fraction==Asc.c_oAscMathInterfaceFraction.Linear) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtFractionStacked,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Bar}
                        });
                        arr.push(mnu);
                    }
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.Linear) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtFractionSkewed,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Skewed}
                        });
                        arr.push(mnu);
                    }
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.Skewed) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtFractionLinear,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Linear}
                        });
                        arr.push(mnu);
                    }
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.NoBar) {
                        mnu = new Common.UI.MenuItem({
                            caption     : (fraction==Asc.c_oAscMathInterfaceFraction.Bar) ? me.txtRemFractionBar : me.txtAddFractionBar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: (fraction==Asc.c_oAscMathInterfaceFraction.Bar) ? Asc.c_oAscMathInterfaceFraction.NoBar : Asc.c_oAscMathInterfaceFraction.Bar}
                        });
                        arr.push(mnu);
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Limit:
                    mnu = new Common.UI.MenuItem({
                        caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceLimitPos.Top) ? me.txtLimitUnder : me.txtLimitOver,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceLimitPos.Top) ? Asc.c_oAscMathInterfaceLimitPos.Bottom : Asc.c_oAscMathInterfaceLimitPos.Top}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtRemLimit,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_Pos', value: Asc.c_oAscMathInterfaceLimitPos.None}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.Matrix:
                    mnu = new Common.UI.MenuItem({
                        caption     : value.get_HidePlaceholder() ? me.txtShowPlaceholder : me.txtHidePlaceholder,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_HidePlaceholder', value: !value.get_HidePlaceholder()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.insertText,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            cls: 'shifted-right',
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.insertRowAboveText,
                                    equationProps: {type: type, callback: 'insert_MatrixRow', value: true}
                                },
                                {
                                    caption: me.insertRowBelowText,
                                    equationProps: {type: type, callback: 'insert_MatrixRow', value: false}
                                },
                                {
                                    caption: me.insertColumnLeftText,
                                    equationProps: {type: type, callback: 'insert_MatrixColumn', value: true}
                                },
                                {
                                    caption: me.insertColumnRightText,
                                    equationProps: {type: type, callback: 'insert_MatrixColumn', value: false}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.deleteText,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            cls: 'shifted-right',
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.deleteRowText,
                                    equationProps: {type: type, callback: 'delete_MatrixRow'}
                                },
                                {
                                    caption: me.deleteColumnText,
                                    equationProps: {type: type, callback: 'delete_MatrixColumn'}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtMatrixAlign,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            cls: 'shifted-right',
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.txtTop,
                                    checkable   : true,
                                    checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Top),
                                    equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Top}
                                },
                                {
                                    caption: me.centerText,
                                    checkable   : true,
                                    checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Center),
                                    equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Center}
                                },
                                {
                                    caption: me.txtBottom,
                                    checkable   : true,
                                    checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Bottom),
                                    equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Bottom}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtColumnAlign,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            cls: 'shifted-right',
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.leftText,
                                    checkable   : true,
                                    checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Left),
                                    equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Left}
                                },
                                {
                                    caption: me.centerText,
                                    checkable   : true,
                                    checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Center),
                                    equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Center}
                                },
                                {
                                    caption: me.rightText,
                                    checkable   : true,
                                    checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Right),
                                    equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Right}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.EqArray:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertEqBefore,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_Equation', value: true}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertEqAfter,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_Equation', value: false}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtDeleteEq,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'delete_Equation'}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.alignmentText,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            cls: 'shifted-right',
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.txtTop,
                                    checkable   : true,
                                    checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Top),
                                    equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Top}
                                },
                                {
                                    caption: me.centerText,
                                    checkable   : true,
                                    checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Center),
                                    equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Center}
                                },
                                {
                                    caption: me.txtBottom,
                                    checkable   : true,
                                    checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Bottom),
                                    equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Bottom}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.LargeOperator:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtLimitChange,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_LimitLocation', value: (value.get_LimitLocation() == Asc.c_oAscMathInterfaceNaryLimitLocation.UndOvr) ? Asc.c_oAscMathInterfaceNaryLimitLocation.SubSup : Asc.c_oAscMathInterfaceNaryLimitLocation.UndOvr}
                    });
                    arr.push(mnu);
                    if (value.get_HideUpper() !== undefined) {
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideUpper() ? me.txtShowTopLimit : me.txtHideTopLimit,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideUpper', value: !value.get_HideUpper()}
                        });
                        arr.push(mnu);
                    }
                    if (value.get_HideLower() !== undefined) {
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideLower() ? me.txtShowBottomLimit : me.txtHideBottomLimit,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideLower', value: !value.get_HideLower()}
                        });
                        arr.push(mnu);
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Delimiter:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertArgBefore,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_DelimiterArgument', value: true}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertArgAfter,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_DelimiterArgument', value: false}
                    });
                    arr.push(mnu);
                    if (value.can_DeleteArgument()) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtDeleteArg,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'delete_DelimiterArgument'}
                        });
                        arr.push(mnu);
                    }
                    mnu = new Common.UI.MenuItem({
                        caption     : value.has_Separators() ? me.txtDeleteCharsAndSeparators : me.txtDeleteChars,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_DelimiterCharacters'}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : value.get_HideOpeningBracket() ? me.txtShowOpenBracket : me.txtHideOpenBracket,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_HideOpeningBracket', value: !value.get_HideOpeningBracket()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : value.get_HideClosingBracket() ? me.txtShowCloseBracket : me.txtHideCloseBracket,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_HideClosingBracket', value: !value.get_HideClosingBracket()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtStretchBrackets,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        checkable   : true,
                        checked     : value.get_StretchBrackets(),
                        equationProps: {type: type, callback: 'put_StretchBrackets', value: !value.get_StretchBrackets()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtMatchBrackets,
                        equation    : true,
                        disabled    : (!value.get_StretchBrackets() || me._currentParaObjDisabled),
                        checkable   : true,
                        checked     : value.get_StretchBrackets() && value.get_MatchBrackets(),
                        equationProps: {type: type, callback: 'put_MatchBrackets', value: !value.get_MatchBrackets()}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.GroupChar:
                    if (value.can_ChangePos()) {
                        mnu = new Common.UI.MenuItem({
                            caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceGroupCharPos.Top) ? me.txtGroupCharUnder : me.txtGroupCharOver,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceGroupCharPos.Top) ? Asc.c_oAscMathInterfaceGroupCharPos.Bottom : Asc.c_oAscMathInterfaceGroupCharPos.Top}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtDeleteGroupChar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: Asc.c_oAscMathInterfaceGroupCharPos.None}
                        });
                        arr.push(mnu);
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Radical:
                    if (value.get_HideDegree() !== undefined) {
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideDegree() ? me.txtShowDegree : me.txtHideDegree,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideDegree', value: !value.get_HideDegree()}
                        });
                        arr.push(mnu);
                    }
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtDeleteRadical,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_Radical'}
                    });
                    arr.push(mnu);
                    break;
            }
            if (value.can_IncreaseArgumentSize()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtIncreaseArg,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'increase_ArgumentSize'}
                });
                arr.push(mnu);
            }
            if (value.can_DecreaseArgumentSize()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtDecreaseArg,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'decrease_ArgumentSize'}
                });
                arr.push(mnu);
            }
            if (value.can_InsertManualBreak()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtInsertBreak,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'insert_ManualBreak'}
                });
                arr.push(mnu);
            }
            if (value.can_DeleteManualBreak()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtDeleteBreak,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'delete_ManualBreak'}
                });
                arr.push(mnu);
            }
            if (value.can_AlignToCharacter()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtAlignToChar,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'align_ToCharacter'}
                });
                arr.push(mnu);
            }
            return arr;
        },

        addEquationMenu: function(isParagraph, insertIdx) {
            var me = this;
            if (_.isUndefined(isParagraph)) {
                isParagraph = me.textMenu.isVisible();
            }

            me.clearEquationMenu(isParagraph, insertIdx);

            var equationMenu = (isParagraph) ? me.textMenu : me.tableMenu,
                menuItems = me.initEquationMenu();

            if (menuItems.length > 0) {
                _.each(menuItems, function(menuItem, index) {
                    if (menuItem.menu) {
                        _.each(menuItem.menu.items, function(item) {
                            item.on('click', _.bind(me.equationCallback, me, item.options.equationProps));
                        });
                    } else
                        menuItem.on('click', _.bind(me.equationCallback, me, menuItem.options.equationProps));
                    equationMenu.insertItem(insertIdx, menuItem);
                    insertIdx++;
                });
            }
            return menuItems.length;
        },

        equationCallback: function(eqProps) {
            this.fireEvent('equation:callback', [eqProps]);
        },

        clearEquationMenu: function(isParagraph, insertIdx) {
            var me = this;
            var equationMenu = (isParagraph) ? me.textMenu : me.tableMenu;
            for (var i = insertIdx; i < equationMenu.items.length; i++) {
                if (equationMenu.items[i].options.equation) {
                    if (equationMenu.items[i].menu) {
                        _.each(equationMenu.items[i].menu.items, function(item) {
                            item.off('click');
                        });
                    } else
                        equationMenu.items[i].off('click');
                    equationMenu.removeItem(equationMenu.items[i]);
                    i--;
                } else
                    break;
            }
        },

        onSlidePickerShowAfter: function(picker) {
            if (!picker._needRecalcSlideLayout) return;

            if (picker.cmpEl && picker.dataViewItems.length>0) {
                var dataViewItems = picker.dataViewItems,
                    el = $(dataViewItems[0].el),
                    itemW = el.outerWidth() + parseInt(el.css('margin-left')) + parseInt(el.css('margin-right')),
                    columnCount = Math.floor(picker.options.restoreWidth / itemW + 0.5) || 1, // try to use restore width
                    col = 0, maxHeight = 0;

                picker.cmpEl.width(itemW * columnCount + 11);

                for (var i=0; i<dataViewItems.length; i++) {
                    var div = $(dataViewItems[i].el).find('.title'),
                        height = div.height();

                    if (height>maxHeight)
                        maxHeight = height;
                    else
                       div.css({'height' : maxHeight });

                    col++;
                    if (col>columnCount-1) { col = 0; maxHeight = 0;}
                }
                picker._needRecalcSlideLayout = false;
            }
        },

        createDelayedElementsViewer: function() {
            var me = this;

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
        },

        createDelayedElements: function(){
            var me = this;

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
                    me.mnuChangeSlide.setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    me.mnuResetSlide.setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
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

            var menuHyperlinkSeparator = new Common.UI.MenuItem({
                caption     : '--'
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

            var menuCommentSeparatorImg = new Common.UI.MenuItem({
                caption     : '--'
            });
            menuCommentSeparatorImg.hide();

            me.menuAddCommentImg = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                caption     : me.addCommentText
            });
            me.menuAddCommentImg.hide();
            /** coauthoring end **/

            me.menuAddToLayoutImg = new Common.UI.MenuItem({
                caption     : me.addToLayoutText
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

            me.menuAddToLayoutTable = new Common.UI.MenuItem({
                caption     : me.addToLayoutText
            });

            me.menuImgEditPoints = new Common.UI.MenuItem({
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
                        eqlen = me.addEquationMenu(true, 12);
                    } else
                        me.clearEquationMenu(true, 12);
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
                    menuHyperlinkSeparator.setVisible(me.menuAddHyperlinkTable.isVisible() || menuHyperlinkTable.isVisible());

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
                    menuHyperlinkSeparator.setVisible(menuHyperlinkSeparator.isVisible() || me.menuAddCommentTable.isVisible());
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
                        eqlen = me.addEquationMenu(false, 6);
                    } else
                        me.clearEquationMenu(false, 6);
                    
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
                    menuHyperlinkTable,             //27
                    menuHyperlinkSeparator,         //28
                    me.menuAddToLayoutTable         //29
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
                    menuCommentSeparatorImg.setVisible(me.menuAddCommentImg.isVisible());
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
                    me.menuAddToLayoutImg.setDisabled(disabled);
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
                    me.menuChartEdit,
                    me.menuChartAdvanced,
                    menuAdvancedSettingsSeparator,  //Separator
                /** coauthoring begin **/
                    me.menuAddCommentImg,
                    menuCommentSeparatorImg,        //Separator
                /** coauthoring end **/
                    me.menuAddToLayoutImg
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
        },

        setLanguages: function(langs){
            var me = this;
            if (langs && langs.length > 0 && me.langParaMenu && me.langTableMenu) {
                var arrPara = [], arrTable = [];
                _.each(langs, function(lang) {
                    var item = {
                        caption     : lang.displayValue,
                        value       : lang.value,
                        checkable   : true,
                        langid      : lang.code,
                        spellcheck   : lang.spellcheck
                    };
                    arrPara.push(item);
                    arrTable.push(_.clone(item));
                });
                me.langParaMenu.menu.resetItems(arrPara);
                me.langTableMenu.menu.resetItems(arrTable);
            }
        },

        createEquationMenu: function(toggleGroup, menuAlign) {
            return new Common.UI.Menu({
                cls: 'ppm-toolbar shifted-right',
                menuAlign: menuAlign,
                items   : [
                    new Common.UI.MenuItem({
                        caption     : this.currProfText,
                        iconCls     : 'menu__icon btn-professional-equation',
                        type        : 'view',
                        value       : {all: false, linear: false}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.currLinearText,
                        iconCls     : 'menu__icon btn-linear-equation',
                        type        : 'view',
                        value       : {all: false, linear: true}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.allProfText,
                        iconCls     : 'menu__icon btn-professional-equation',
                        type        : 'view',
                        value       : {all: true, linear: false}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.allLinearText,
                        iconCls     : 'menu__icon btn-linear-equation',
                        type        : 'view',
                        value       : {all: true, linear: true}
                    }),
                    { caption     : '--' },
                    new Common.UI.MenuItem({
                        caption     : this.unicodeText,
                        checkable   : true,
                        checked     : false,
                        toggleGroup : toggleGroup,
                        type        : 'input',
                        value       : Asc.c_oAscMathInputType.Unicode
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.latexText,
                        checkable   : true,
                        checked     : false,
                        toggleGroup : toggleGroup,
                        type        : 'input',
                        value       : Asc.c_oAscMathInputType.LaTeX
                    }),
                    { caption     : '--' },
                    new Common.UI.MenuItem({
                        caption     : this.hideEqToolbar,
                        isToolbarHide: false,
                        type        : 'hide',
                    })
                ]
            });
        },

        updateCustomItems: function(menu, data) {
            if (!menu || !data || data.length<1) return;

            var me = this,
                lang = me.mode && me.mode.lang ? me.mode.lang.split(/[\-_]/)[0] : 'en';

            me._preventCustomClick && clearTimeout(me._preventCustomClick);
            me._hasCustomItems && (me._preventCustomClick = setTimeout(function () {
                me._preventCustomClick = null;
            },500)); // set delay only on update existing items
            me._hasCustomItems = true;

            var findCustomItem = function(guid, id) {
                if (menu && menu.items.length>0) {
                    for (var i = menu.items.length-1; i >=0 ; i--) {
                        if (menu.items[i].options.isCustomItem && (id===undefined && menu.items[i].options.guid === guid || menu.items[i].options.guid === guid && menu.items[i].value === id)) {
                            return menu.items[i];
                        }
                    }
                }
            }

            var getMenu = function(items, guid, toMenu) {
                if (toMenu)
                    toMenu.removeAll();
                else {
                    toMenu = new Common.UI.Menu({
                        cls: 'shifted-right',
                        menuAlign: 'tl-tr',
                        items: []
                    });
                    toMenu.on('item:click', function(menu, item, e) {
                        !me._preventCustomClick && me.api && me.api.onPluginContextMenuItemClick && me.api.onPluginContextMenuItemClick(item.options.guid, item.value);
                    });
                    toMenu.on('menu:click', function(menu, e) {
                        me._preventCustomClick && e.stopPropagation();
                    });
                }
                items.forEach(function(item) {
                    item.separator && toMenu.addItem({
                        caption: '--',
                        isCustomItem: true,
                        guid: guid
                    });
                    item.text && toMenu.addItem({
                        caption: ((typeof item.text == 'object') ? item.text[lang] || item.text['en'] : item.text) || '',
                        isCustomItem: true,
                        value: item.id,
                        guid: guid,
                        menu: item.items ? getMenu(item.items, guid) : false,
                        iconImg: me.parseIcons(item.icons),
                        disabled: !!item.disabled
                    });
                });
                return toMenu;
            }

            var focused;
            data.forEach(function(plugin) {
                var isnew = !findCustomItem(plugin.guid);
                if (plugin && plugin.items && plugin.items.length>0) {
                    plugin.items.forEach(function(item) {
                        if (item.separator && isnew) {// add separator only to new plugins menu
                            menu.addItem({
                                caption: '--',
                                isCustomItem: true,
                                guid: plugin.guid
                            });
                        }

                        if (!item.text) return;
                        var mnu = findCustomItem(plugin.guid, item.id),
                            caption = ((typeof item.text == 'object') ? item.text[lang] || item.text['en'] : item.text) || '';
                        if (mnu) {
                            mnu.setCaption(caption);
                            mnu.setDisabled(!!item.disabled);
                            if (item.items) {
                                if (mnu.menu) {
                                    if (mnu.menu.isVisible() && mnu.menu.cmpEl.find(' > li:not(.divider):not(.disabled):visible').find('> a').filter(':focus').length>0) {
                                        mnu.menu.isOver = true;
                                        focused = mnu.cmpEl;
                                    }
                                    getMenu(item.items, plugin.guid, mnu.menu);
                                } else
                                    mnu.setMenu(getMenu(item.items, plugin.guid));
                            }
                        } else {
                            var mnu = new Common.UI.MenuItem({
                                caption     : caption,
                                isCustomItem: true,
                                value: item.id,
                                guid: plugin.guid,
                                menu: item.items && item.items.length>=0 ? getMenu(item.items, plugin.guid) : false,
                                iconImg: me.parseIcons(item.icons),
                                disabled: !!item.disabled
                            }).on('click', function(item, e) {
                                !me._preventCustomClick && me.api && me.api.onPluginContextMenuItemClick && me.api.onPluginContextMenuItemClick(item.options.guid, item.value);
                            });
                            menu.addItem(mnu);
                        }
                    });
                }
            });

            if (focused) {
                var $subitems = $('> [role=menu]', focused).find('> li:not(.divider):not(.disabled):visible > a');
                ($subitems.length>0) && $subitems.eq(0).focus();
            }
            menu.alignPosition();
        },

        clearCustomItems: function(menu) {
            if (menu && menu.items.length>0) {
                for (var i = 0; i < menu.items.length; i++) {
                    if (menu.items[i].options.isCustomItem) {
                        menu.removeItem(menu.items[i]);
                        i--;
                    }
                }
            }
            this._hasCustomItems = false;
        },

        parseIcons: function(icons) {
            var plugins = PE.getController('Common.Controllers.Plugins').getView('Common.Views.Plugins');
            if (icons && icons.length && plugins && plugins.parseIcons) {
                icons = plugins.parseIcons(icons);
                return icons ? icons['normal'] : undefined;
            }
        },

        unitsChanged: function(m) {
            this._state.unitsChanged = true;
        },

        SetDisabled: function(state) {
            this._isDisabled = state;
        },

        insertRowAboveText      : 'Row Above',
        insertRowBelowText      : 'Row Below',
        insertColumnLeftText    : 'Column Left',
        insertColumnRightText   : 'Column Right',
        deleteText              : 'Delete',
        deleteRowText           : 'Delete Row',
        deleteColumnText        : 'Delete Column',
        deleteTableText         : 'Delete Table',
        mergeCellsText          : 'Merge Cells',
        splitCellsText          : 'Split Cell...',
        splitCellTitleText      : 'Split Cell',
        originalSizeText        : 'Actual Size',
        advancedImageText       : 'Image Advanced Settings',
        hyperlinkText           : 'Hyperlink',
        editHyperlinkText       : 'Edit Hyperlink',
        removeHyperlinkText     : 'Remove Hyperlink',
        txtPressLink            : 'Press {0} and click link',
        selectText              : 'Select',
        insertRowText           : 'Insert Row',
        insertColumnText        : 'Insert Column',
        rowText                 : 'Row',
        columnText              : 'Column',
        cellText                : 'Cell',
        tableText               : 'Table',
        aboveText               : 'Above',
        belowText               : 'Below',
        advancedTableText       : 'Table Advanced Settings',
        txtSelectAll            : 'Select All',
        txtNewSlide             : 'New Slide',
        txtDuplicateSlide       : 'Duplicate Slide',
        txtDeleteSlide          : 'Delete Slide',
        txtBackground           : 'Background',
        txtChangeLayout         : 'Change Layout',
        txtPreview              : 'Start slideshow',
        textShapeAlignLeft      : 'Align Left',
        textShapeAlignRight     : 'Align Right',
        textShapeAlignCenter    : 'Align Center',
        textShapeAlignTop       : 'Align Top',
        textShapeAlignBottom    : 'Align Bottom',
        textShapeAlignMiddle    : 'Align Middle',
        textArrangeFront        : 'Bring To Front',
        textArrangeBack         : 'Send To Back',
        textArrangeForward      : 'Bring Forward',
        textArrangeBackward     : 'Send Backward',
        txtGroup                : 'Group',
        txtUngroup              : 'Ungroup',
        txtArrange              : 'Arrange',
        txtAlign                : 'Align',
        txtDistribHor           : 'Distribute Horizontally',
        txtDistribVert          : 'Distribute Vertically',
        txtSlide                : 'Slide',
        cellAlignText           : 'Cell Vertical Alignment',
        advancedShapeText       : 'Shape Advanced Settings',
        textSaveAsPicture       : 'Save as picture',
        /** coauthoring begin **/
        addCommentText          : 'Add Comment',
        /** coauthoring end **/
        editChartText           : 'Edit Data',
        vertAlignText           : 'Vertical Alignment',
        advancedParagraphText   : 'Text Advanced Settings',
        tipIsLocked             : "This element is currently being edited by another user.",
        textNextPage            : 'Next Slide',
        textPrevPage            : 'Previous Slide',
        insertText: 'Insert',
        textCopy: 'Copy',
        textPaste: 'Paste',
        textCut: 'Cut',
        textSlideSettings: 'Slide Settings',
        directionText: 'Text Direction',
        directHText: 'Horizontal',
        direct90Text: 'Rotate Text Down',
        direct270Text: 'Rotate Text Up',
        txtRemoveAccentChar: 'Remove accent character',
        txtBorderProps: 'Borders property',
        txtHideTop: 'Hide top border',
        txtHideBottom: 'Hide bottom border',
        txtHideLeft: 'Hide left border',
        txtHideRight: 'Hide right border',
        txtHideHor: 'Hide horizontal line',
        txtHideVer: 'Hide vertical line',
        txtHideLT: 'Hide left top line',
        txtHideLB: 'Hide left bottom line',
        txtAddTop: 'Add top border',
        txtAddBottom: 'Add bottom border',
        txtAddLeft: 'Add left border',
        txtAddRight: 'Add right border',
        txtAddHor: 'Add horizontal line',
        txtAddVer: 'Add vertical line',
        txtAddLT: 'Add left top line',
        txtAddLB: 'Add left bottom line',
        txtRemoveBar: 'Remove bar',
        txtOverbar: 'Bar over text',
        txtUnderbar: 'Bar under text',
        txtRemScripts: 'Remove scripts',
        txtRemSubscript: 'Remove subscript',
        txtRemSuperscript: 'Remove superscript',
        txtScriptsAfter: 'Scripts after text',
        txtScriptsBefore: 'Scripts before text',
        txtFractionStacked: 'Change to stacked fraction',
        txtFractionSkewed: 'Change to skewed fraction',
        txtFractionLinear: 'Change to linear fraction',
        txtRemFractionBar: 'Remove fraction bar',
        txtAddFractionBar: 'Add fraction bar',
        txtRemLimit: 'Remove limit',
        txtLimitOver: 'Limit over text',
        txtLimitUnder: 'Limit under text',
        txtHidePlaceholder: 'Hide placeholder',
        txtShowPlaceholder: 'Show placeholder',
        txtMatrixAlign: 'Matrix alignment',
        txtColumnAlign: 'Column alignment',
        txtTop: 'Top',
        txtBottom: 'Bottom',
        txtInsertEqBefore: 'Insert equation before',
        txtInsertEqAfter: 'Insert equation after',
        txtDeleteEq: 'Delete equation',
        txtLimitChange: 'Change limits location',
        txtHideTopLimit: 'Hide top limit',
        txtShowTopLimit: 'Show top limit',
        txtHideBottomLimit: 'Hide bottom limit',
        txtShowBottomLimit: 'Show bottom limit',
        txtInsertArgBefore: 'Insert argument before',
        txtInsertArgAfter: 'Insert argument after',
        txtDeleteArg: 'Delete argument',
        txtHideOpenBracket: 'Hide opening bracket',
        txtShowOpenBracket: 'Show opening bracket',
        txtHideCloseBracket: 'Hide closing bracket',
        txtShowCloseBracket: 'Show closing bracket',
        txtStretchBrackets: 'Stretch brackets',
        txtMatchBrackets: 'Match brackets to argument height',
        txtGroupCharOver: 'Char over text',
        txtGroupCharUnder: 'Char under text',
        txtDeleteGroupChar: 'Delete char',
        txtHideDegree: 'Hide degree',
        txtShowDegree: 'Show degree',
        txtIncreaseArg: 'Increase argument size',
        txtDecreaseArg: 'Decrease argument size',
        txtInsertBreak: 'Insert manual break',
        txtDeleteBreak: 'Delete manual break',
        txtAlignToChar: 'Align to character',
        txtDeleteRadical: 'Delete radical',
        txtDeleteChars: 'Delete enclosing characters',
        txtDeleteCharsAndSeparators: 'Delete enclosing characters and separators',
        alignmentText: 'Alignment',
        leftText: 'Left',
        rightText: 'Right',
        centerText: 'Center',
        loadSpellText: 'Loading variants...',
        ignoreAllSpellText: 'Ignore All',
        ignoreSpellText: 'Ignore',
        noSpellVariantsText: 'No variants',
        moreText: 'More variants...',
        spellcheckText: 'Spellcheck',
        langText: 'Select Language',
        textUndo: 'Undo',
        txtSlideHide: 'Hide Slide',
        txtChangeTheme: 'Change Theme',
        txtKeepTextOnly: 'Keep text only',
        txtPastePicture: 'Picture',
        txtPasteSourceFormat: 'Keep source formatting',
        txtPasteDestFormat: 'Use destination theme',
        textDistributeRows: 'Distribute rows',
        textDistributeCols: 'Distribute columns',
        textReplace:    'Replace image',
        textFromUrl:    'From URL',
        textFromFile:   'From File',
        textRotate270: 'Rotate 90° Counterclockwise',
        textRotate90: 'Rotate 90° Clockwise',
        textFlipV: 'Flip Vertically',
        textFlipH: 'Flip Horizontally',
        textRotate: 'Rotate',
        textCrop: 'Crop',
        textCropFill: 'Fill',
        textCropFit: 'Fit',
        toDictionaryText: 'Add to Dictionary',
        txtPrintSelection: 'Print Selection',
        addToLayoutText: 'Add to Layout',
        txtResetLayout: 'Reset Slide',
        mniCustomTable: 'Insert Custom Table',
        textFromStorage: 'From Storage',
        txtWarnUrl: 'Clicking this link can be harmful to your device and data.<br>Are you sure you want to continue?',
        textEditPoints: 'Edit Points',
        txtMoveSlidesToEnd: 'Move Slide to End',
        txtMoveSlidesToStart: 'Move Slide to Beginning',
        advancedChartText   : 'Chart Advanced Settings',
        textGuides: 'Guides',
        tipGuides: 'Show guides',
        textShowGuides: 'Show Guides',
        textAddVGuides: 'Add Vertical Guide',
        textAddHGuides: 'Add Horizontal Guide',
        textSmartGuides: 'Smart Guides',
        textClearGuides: 'Clear Guides',
        textGridlines: 'Gridlines',
        textShowGridlines: 'Show Gridlines',
        textSnapObjects: 'Snap Object to Grid',
        textCm: 'cm',
        textCustom: 'Custom',
        textRulers: 'Rulers',
        textDeleteGuide: 'Delete Guide',
        advancedEquationText: 'Equation Settings',
        unicodeText: 'Unicode',
        latexText: 'LaTeX',
        currProfText: 'Current - Professional',
        currLinearText: 'Current - Linear',
        allProfText: 'All - Professional',
        allLinearText: 'All - Linear',
        hideEqToolbar: 'Hide Equation Toolbar',
        showEqToolbar: 'Show Equation Toolbar',
        txtInsImage: 'Insert image from File',
        txtInsImageUrl: 'Insert image from URL',
        txtInsChart: 'Insert chart',
        txtInsTable: 'Insert table',
        txtInsVideo: 'Insert video',
        txtInsAudio: 'Insert audio',
        txtInsSmartArt: 'Insert SmartArt'

    }, PE.Views.DocumentHolder || {}));
});