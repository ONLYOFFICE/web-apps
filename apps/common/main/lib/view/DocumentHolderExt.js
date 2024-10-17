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

    let _editor = window.DE || window.PDFE ||window.PDFE || window.PE || window.SSE;
    if (_editor && _editor.Views && _editor.Views.DocumentHolder) {
        let dh = _editor.Views.DocumentHolder.prototype;

        dh.addEquationMenu = function(equationMenu, insertIdx) {
            if (!equationMenu) return;

            var me = this;
            me.clearEquationMenu(equationMenu, insertIdx);

            var menuItems = me.initEquationMenu();
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
        };

        dh.clearEquationMenu = function(equationMenu, insertIdx) {
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
        };

        dh.equationCallback = function(eqProps) {
            var eqObj;
            if (eqProps) {
                switch (eqProps.type) {
                    case Asc.c_oAscMathInterfaceType.Accent:
                        eqObj = new CMathMenuAccent();
                        break;
                    case Asc.c_oAscMathInterfaceType.BorderBox:
                        eqObj = new CMathMenuBorderBox();
                        break;
                    case Asc.c_oAscMathInterfaceType.Box:
                        eqObj = new CMathMenuBox();
                        break;
                    case Asc.c_oAscMathInterfaceType.Bar:
                        eqObj = new CMathMenuBar();
                        break;
                    case Asc.c_oAscMathInterfaceType.Script:
                        eqObj = new CMathMenuScript();
                        break;
                    case Asc.c_oAscMathInterfaceType.Fraction:
                        eqObj = new CMathMenuFraction();
                        break;
                    case Asc.c_oAscMathInterfaceType.Limit:
                        eqObj = new CMathMenuLimit();
                        break;
                    case Asc.c_oAscMathInterfaceType.Matrix:
                        eqObj = new CMathMenuMatrix();
                        break;
                    case Asc.c_oAscMathInterfaceType.EqArray:
                        eqObj = new CMathMenuEqArray();
                        break;
                    case Asc.c_oAscMathInterfaceType.LargeOperator:
                        eqObj = new CMathMenuNary();
                        break;
                    case Asc.c_oAscMathInterfaceType.Delimiter:
                        eqObj = new CMathMenuDelimiter();
                        break;
                    case Asc.c_oAscMathInterfaceType.GroupChar:
                        eqObj = new CMathMenuGroupCharacter();
                        break;
                    case Asc.c_oAscMathInterfaceType.Radical:
                        eqObj = new CMathMenuRadical();
                        break;
                    case Asc.c_oAscMathInterfaceType.Common:
                        eqObj = new CMathMenuBase();
                        break;
                }
                eqObj && eqObj[eqProps.callback](eqProps.value);
            }
            this.fireEvent('equation:callback', [eqObj]);
        };

        dh.initEquationMenu = function() {
            var me = this._currentTranslateObj; // in sse - controller, in other - view
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
        };

        dh.updateCustomItems = function(menu, data) {
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
        };

        dh.clearCustomItems = function(menu) {
            if (menu && menu.items.length>0) {
                for (var i = 0; i < menu.items.length; i++) {
                    if (menu.items[i].options.isCustomItem) {
                        menu.removeItem(menu.items[i]);
                        i--;
                    }
                }
            }
            this._hasCustomItems = false;
        };

        dh.parseIcons = function(icons) {
            var plugins = _editor.getController('Common.Controllers.Plugins').getView('Common.Views.Plugins');
            if (icons && icons.length && plugins && plugins.parseIcons) {
                icons = plugins.parseIcons(icons);
                return icons ? icons['normal'] : undefined;
            }
        };
    }

});





