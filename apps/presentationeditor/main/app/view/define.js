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
if (Common === undefined) {
    var Common = {};
}

if (Common.define === undefined) {
    Common.define = {};
}

define(function(){ 'use strict';

    Common.define.effectData = _.extend(new (function () {
        return {
            textEntrance: 'Entrance Effect',
            textEmphasis: 'Emphasis Effect',
            textExit: 'Exit Effect',
            textPath: 'Motion Path',
            textAppear: 'Appear',
            textFade: 'Fade',
            textFlyIn: 'Fly in',
            textFloatIn: 'Float In',
            textSplit: 'Split',
            textWipe: 'Wipe',
            textShape: 'Shape',
            textWheel: 'Wheel',
            textRandomBars: 'Random Bars ',
            textGrowTurn: 'Grow & Turn',
            textZoom: 'Zoom',
            textSwivel: 'Swivel',
            textBounce: 'Bounce',
            textPulse: 'Pulse',
            textColorPulse: 'Color Pulse',
            textTeeter: 'Teeter',
            textSpin: 'Spin',
            textGrowShrink: 'Grow/Shrink',
            textShrinkTurn: 'Shrink & Turn',
            textDesaturate: 'Desaturate',
            textDarken: 'Darken',
            textLighten: 'Lighten',
            textTransparency: 'Transparency',
            textObjectColor: 'Object Color',
            textComplementaryColor: 'Complementary Color',
            textComplementaryColor2: 'Complementary Color 2',
            textLineColor: 'Line Color',
            textFillColor: 'Fill Color',
            textBrushColor: 'Brush Color',
            textFontColor: 'Font Color',
            textUnderline: 'Underline',
            textBoldFlash: 'Bold Flash',
            textBoldReveal: 'Bold Reveal',
            textWave: 'Wave',
            textDisappear: 'Disappear',
            textFlyOut: 'Fly Out',
            textFloatOut: 'Float Out',
            textBasic: 'Basic',
            textSubtle: 'Subtle',
            textModerate: 'Moderate',
            textExciting: 'Exciting',
            textLinesCurves: 'Lines Curves',
            textSpecial: 'Special',
            textBox: 'Box',
            textCircle: 'Circle',
            textPlus: 'Plus',
            textDiamond: 'Diamond',
            textDissolveIn: 'Dissolve In',
            textBlinds: 'Blinds',
            textCheckerboard: 'Checkerboard',
            textPeekIn: 'Peek In',
            textStrips: 'Strips',
            textExpand: 'Expand',
            textBasicZoom: 'Basic Zoom',
            textCompress: 'Compress',
            textFloatUp: 'Float Up',
            textRiseUp: 'Rise Up',
            textStretch: 'Stretch',
            textCenterRevolve: 'Center Revolve',
            textFloatDown: 'Float Down',
            textSpinner: 'Spinner',
            textBasicSwivel: 'Basic Swivel',
            textBoomerang: 'Boomerang',
            textCredits: 'Credits',
            textCuverUp: 'Cuver Up',
            textDrop: 'Drop',
            textFloat: 'Float',
            textPinwheel: 'Pinwheel',
            textSpiralIn: 'Spiral In',
            textWhip: 'Whip',
            textGrowWithColor: 'Grow With Color',
            textShimmer: 'Shimmer',
            textBlink: 'Blink',
            textDissolveOut: 'Dissolve Out',
            textPeekOut: 'Peek Out',
            textContrast: 'Contrast',
            textCollapse: 'Collapse',
            textSinkDown: 'Sink Down',
            textCurveDown: 'CurveDown',
            textSpiralOut: 'Spiral Out',
            textContrastingColor: 'Contrasting Color',
            textPointStar4: '4 Point Star',
            textPointStar5: '5 Point Star',
            textPointStar6: '6 Point Star',
            textPointStar8: '8 Point Star',
            textCrescentMoon: 'Crescent Moon',
            textEqualTriangle: 'Equal Triangle',
            textFootball: 'Football',
            textHeart: 'Heart',
            textHexagon: 'Hexagon',
            textOctagon: 'Octagon',
            textParallelogram: 'Parallelogram',
            textPentagon: 'Pentagon',
            textSquare: 'Square',
            textTeardrop: 'Teardrop',
            textTrapezoid: 'Trapezoid',
            textArcDown: 'Arc Down',
            textArcLeft: 'Arc Left',
            textArcRight: 'Arc Right',
            textArcUp: 'Arc Up',
            textBounceLeft: 'Bounce Left',
            textBounceRight: 'Bounce Right',
            textCurvyLeft: 'Curvy Left',
            textCurvyRight: 'Curvy Right',
            textDecayingWave: 'Decaying Wave',
            textDiagonalDownRight: 'Diagonal Down Right',
            textDiagonalUpRight: 'Diagonal Up Right',
            textDown: 'Down',
            textFunnel: 'Funnel',
            textHeartbeat: 'Heartbeat',
            textLeft: 'Left',
            textRight: 'Right',
            textSCurve1: 'S Curve 1',
            textSCurve2: 'S Curve 2',
            textSineWave: 'Sine Wave',
            textSpiralLeft: 'Spiral Left',
            textSpiralRight: 'Spiral Right',
            textSpring: 'Spring:',
            textStairsDown: 'Stairs Down',
            textTurnDown: 'Turn Down',
            textTurnDownRight: 'Turn Down Right',
            textTurnUp: 'Turn Up',
            textTurnUpRight: 'Turn Up Right',
            textUp: 'Up',
            textZigzag: 'Zigzag',
            textBean: 'Bean',
            textCurvedSquare: 'CurvedSquare',
            textCurvedX: 'Curved X',
            textCurvyStar: 'Curvy Star',
            textFigureFour: 'Figure 8 Four',
            textHorizontalFigure: 'Horizontal Figure 8',
            textInvertedSquare: 'Inverted Square',
            textInvertedTriangle: 'Inverted Triangle',
            textLoopDeLoop: 'Loop de Loop',
            textNeutron: 'Neutron',
            textPeanut: 'Peanut',
            textPointStar: 'Point Star',
            textSwoosh: 'Swoosh',
            textVerticalFigure: 'Vertical Figure 8',
            textRightTriangle: 'Right Triangle',
            textAcross: 'Across',
            textFromBottom: 'From Bottom',
            textFromBottomLeft: 'From Bottom-Left',
            textFromLeft: 'From Left',
            textFromTopLeft: 'From Top-Left',
            textFromTop: 'From Top',
            textFromTopRight: 'From Top-Right',
            textFromRight: 'From Right',
            textFromBottomRight: 'From Bottom-Right',
            textLeftDown: ' Left Down',
            textLeftUp: ' Left Up',
            textRightDown: ' Right Down',
            textRightUp: ' Right Up',
            textObjectCenter: 'Object Center',
            textSlideCenter: 'Slide Center',
            textInFromScreenCenter: 'In From Screen Center',
            textOutFromScreenBottom: 'Out From Screen Bottom',
            textInSlightly: 'In Slightly',
            textInToScreenBottom: 'In To Screen Bottom',
            textOutToScreenCenter: 'Out To Screen Center',
            textOutSlightly: 'Out Slightly',
            textToBottom: 'To Bottom',
            textToBottomLeft: 'To Bottom-Left',
            textToLeft: 'To Left',
            textToTopLeft: 'To Top-Left',
            textToTop: 'To Top',
            textToTopRight: 'To Top-Right',
            textToRight: 'To Right',
            textToBottomRight: 'To Bottom-Right',
            textSpoke1: '1 Spoke',
            textSpoke2: '2 Spokes',
            textSpoke3: '3 Spokes',
            textSpoke4: '4 Spokes',
            textSpoke8: '8 Spokes',
            textCustomPath: 'Custom Path',
            textHorizontalIn: 'Horizontal In',
            textHorizontalOut: 'Horizontal Out',
            textVerticalIn: 'Vertical In',
            textVerticalOut: 'Vertical Out',
            textVertical: 'Vertical',
            textHorizontal: 'Horizontal',
            textIn: 'In',
            textOut: 'Out',
            textWedge: 'Wedge',
            textFlip: 'Flip',
            textLines: 'Lines',
            textArcs: 'Arcs',
            textTurns: 'Turns',
            textShapes: 'Shapes',
            textLoops: 'Loops',
            textPathCurve: 'Curve',
            textPathLine: 'Line',
            textPathScribble: 'Scribble',

            getEffectGroupData: function () {
                return [
                    {id: 'menu-effect-group-entrance',  value: AscFormat.PRESET_CLASS_ENTR,     caption: this.textEntrance,     iconClsCustom: 'animation-entrance-custom'},
                    {id: 'menu-effect-group-emphasis',  value: AscFormat.PRESET_CLASS_EMPH,     caption: this.textEmphasis,     iconClsCustom: 'animation-emphasis-custom'},
                    {id: 'menu-effect-group-exit',      value: AscFormat.PRESET_CLASS_EXIT,     caption: this.textExit,         iconClsCustom: 'animation-exit-custom'},
                    {id: 'menu-effect-group-path',      value: AscFormat.PRESET_CLASS_PATH,     caption: this.textPath,         iconClsCustom: 'animation-motion-paths-custom'}
                ];
            },

            getEffectData: function () {
                return [
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_APPEAR,                   iconCls: 'animation-entrance-appear',               displayValue: this.textAppear},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_FADE,                     iconCls: 'animation-entrance-fade',                 displayValue: this.textFade},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_FLY_IN_FROM,              iconCls: 'animation-entrance-fly-in',               displayValue: this.textFlyIn},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_FLOAT_UP,                 iconCls: 'animation-entrance-float-in',             displayValue: this.textFloatIn,     familyEffect: 'entrfloat'},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_SPLIT,                    iconCls: 'animation-entrance-split',                displayValue: this.textSplit},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_WIPE_FROM,                iconCls: 'animation-entrance-wipe',                 displayValue: this.textWipe},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_CIRCLE,                   iconCls: 'animation-entrance-shape',                displayValue: this.textShape,       familyEffect: 'entrshape'},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_WHEEL,                    iconCls: 'animation-entrance-wheel',                displayValue: this.textWheel},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_RANDOM_BARS,              iconCls: 'animation-entrance-random-bars',          displayValue: this.textRandomBars},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_GROW_AND_TURN,            iconCls: 'animation-entrance-grow-turn',            displayValue: this.textGrowTurn},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_ZOOM,                     iconCls: 'animation-entrance-zoom',                 displayValue: this.textZoom},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_SWIVEL,                   iconCls: 'animation-entrance-swivel',               displayValue: this.textSwivel},
                    {group: 'menu-effect-group-entrance',   value: AscFormat.ENTRANCE_BOUNCE,                   iconCls: 'animation-entrance-bounce',               displayValue: this.textBounce},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_PULSE,                    iconCls: 'animation-emphasis-pulse',                displayValue: this.textPulse},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_COLOR_PULSE,              iconCls: 'animation-emphasis-color-pulse',          displayValue: this.textColorPulse,          color: true},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_TEETER,                   iconCls: 'animation-emphasis-teeter',               displayValue: this.textTeeter},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_SPIN,                     iconCls: 'animation-emphasis-spin',                 displayValue: this.textSpin},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_GROW_SHRINK,              iconCls: 'animation-emphasis-grow-or-shrink',       displayValue: this.textGrowShrink},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_DESATURATE,               iconCls: 'animation-emphasis-desaturate',           displayValue: this.textDesaturate},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_CONTRASTING_DARKEN,       iconCls: 'animation-emphasis-darken',               displayValue: this.textDarken},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_LIGHTEN,                  iconCls: 'animation-emphasis-lighten',              displayValue: this.textLighten},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_TRANSPARENCY,             iconCls: 'animation-emphasis-transparency',         displayValue: this.textTransparency},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_OBJECT_COLOR,             iconCls: 'animation-emphasis-object-color',         displayValue: this.textObjectColor,         color: true},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_COMPLEMENTARY_COLOR,      iconCls: 'animation-emphasis-complementary-color',  displayValue: this.textComplementaryColor},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_LINE_COLOR,               iconCls: 'animation-emphasis-line-color',           displayValue: this.textLineColor,           color: true},
                    {group: 'menu-effect-group-emphasis',   value: AscFormat.EMPHASIS_FILL_COLOR,               iconCls: 'animation-emphasis-fill-color',           displayValue: this.textFillColor,           color: true},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_DISAPPEAR,                    iconCls: 'animation-exit-disappear',                displayValue: this.textDisappear},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_FADE,                         iconCls: 'animation-exit-fade',                     displayValue: this.textFade},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_FLY_OUT_TO,                   iconCls: 'animation-exit-fly-out',                  displayValue: this.textFlyOut},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_FLOAT_DOWN,                   iconCls: 'animation-exit-float-out',                displayValue: this.textFloatOut,    familyEffect: 'exitfloat'},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_SPLIT,                        iconCls: 'animation-exit-split',                    displayValue: this.textSplit},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_WIPE_FROM,                    iconCls: 'animation-exit-wipe',                     displayValue: this.textWipe},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_CIRCLE,                       iconCls: 'animation-exit-shape',                    displayValue: this.textShape,       familyEffect: 'shape'},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_WHEEL,                        iconCls: 'animation-exit-wheel',                    displayValue: this.textWheel},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_RANDOM_BARS,                  iconCls: 'animation-exit-random-bars',              displayValue: this.textRandomBars},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_SHRINK_AND_TURN,              iconCls: 'animation-exit-shrink-turn',              displayValue: this.textShrinkTurn},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_ZOOM,                         iconCls: 'animation-exit-zoom',                     displayValue: this.textZoom},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_SWIVEL,                       iconCls: 'animation-exit-swivel',                   displayValue: this.textSwivel},
                    {group: 'menu-effect-group-exit',       value: AscFormat.EXIT_BOUNCE,                       iconCls: 'animation-exit-bounce',                   displayValue: this.textBounce},
                    {group: 'menu-effect-group-path',       value: AscFormat.MOTION_DOWN,                       iconCls: 'animation-motion-paths-lines',            displayValue: this.textLines,       familyEffect: 'pathlines'},
                    {group: 'menu-effect-group-path',       value: AscFormat.MOTION_ARC_DOWN,                   iconCls: 'animation-motion-paths-arcs',             displayValue: this.textArcs,        familyEffect: 'patharcs'},
                    {group: 'menu-effect-group-path',       value: AscFormat.MOTION_TURN_DOWN,                  iconCls: 'animation-motion-paths-turns',            displayValue: this.textTurns,       familyEffect: 'pathturns'},
                    {group: 'menu-effect-group-path',       value: AscFormat.MOTION_CIRCLE,                     iconCls: 'animation-motion-paths-shapes',           displayValue: this.textShapes,      familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       value: AscFormat.MOTION_HORIZONTAL_FIGURE_8_FOUR,   iconCls: 'animation-motion-paths-loops',            displayValue: this.textLoops,       familyEffect: 'pathloops'},
                    {group: 'menu-effect-group-path',       value: AscFormat.MOTION_CUSTOM_PATH,                iconCls: 'animation-motion-paths-custom-path',      displayValue: this.textCustomPath}
                ];
            },

            getLevelEffect: function (isPath) {

                if (!isPath)
                    return [
                        {id: 'menu-effect-level-basic',         displayValue: this.textBasic},
                        {id: 'menu-effect-level-subtle',        displayValue: this.textSubtle},
                        {id: 'menu-effect-level-moderate',      displayValue: this.textModerate},
                        {id: 'menu-effect-level-exciting',      displayValue: this.textExciting}
                    ];
                else
                    return [
                        {id: 'menu-effect-level-basic',         displayValue: this.textBasic},
                        {id: 'menu-effect-level-lines_curves',  displayValue: this.textSubtle},
                        {id: 'menu-effect-level-special',       displayValue: this.textModerate}
                    ];
            },

            getEffectFullData: function () {
                return [
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_APPEAR,                   displayValue: this.textAppear},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_BLINDS,                   displayValue: this.textBlinds},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_BOX,                      displayValue: this.textBox,                 familyEffect: 'entrshape'},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_CHECKERBOARD,             displayValue: this.textCheckerboard},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_CIRCLE,                   displayValue: this.textCircle,              familyEffect: 'entrshape'},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_DIAMOND,                  displayValue: this.textDiamond,             familyEffect: 'entrshape'},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_DISSOLVE_IN,              displayValue: this.textDissolveIn},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_FLY_IN_FROM,              displayValue: this.textFlyIn},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_PEEK_IN_FROM,             displayValue: this.textPeekIn},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_PLUS,                     displayValue: this.textPlus,                familyEffect: 'entrshape'},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_RANDOM_BARS,              displayValue: this.textRandomBars},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_SPLIT,                    displayValue: this.textSplit},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_STRIPS,                   displayValue: this.textStrips},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_WEDGE,                    displayValue: this.textWedge},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_WHEEL,                    displayValue: this.textWheel},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-basic',           value: AscFormat.ENTRANCE_WIPE_FROM,                displayValue: this.textWipe},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-subtle',          value: AscFormat.ENTRANCE_EXPAND,                   displayValue: this.textExpand},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-subtle',          value: AscFormat.ENTRANCE_FADE,                     displayValue: this.textFade},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-subtle',          value: AscFormat.ENTRANCE_SWIVEL,                   displayValue: this.textSwivel},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-subtle',          value: AscFormat.ENTRANCE_ZOOM,                     displayValue: this.textZoom},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_BASIC_ZOOM,               displayValue: this.textBasicZoom},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_CENTER_REVOLVE,           displayValue: this.textCenterRevolve},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_CENTER_COMPRESS,          displayValue: this.textCompress},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_FLOAT_DOWN,               displayValue: this.textFloatDown,           familyEffect: 'entrfloat'},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_FLOAT_UP,                 displayValue: this.textFloatUp,             familyEffect: 'entrfloat'},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_GROW_AND_TURN,            displayValue: this.textGrowTurn},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_RISE_UP,                  displayValue: this.textRiseUp},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_SPINNER,                  displayValue: this.textSpinner},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-moderate',        value: AscFormat.ENTRANCE_STRETCH,                  displayValue: this.textStretch},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_BASIC_SWIVEL,             displayValue: this.textBasicSwivel},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_BOOMERANG,                displayValue: this.textBoomerang},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_BOUNCE,                   displayValue: this.textBounce},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_CREDITS,                  displayValue: this.textCredits},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_CURVE_UP,                 displayValue: this.textCuverUp},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_DROP,                     displayValue: this.textDrop},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_FLIP,                     displayValue: this.textFlip},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_FLOAT,                    displayValue: this.textFloat},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_PINWHEEL,                 displayValue: this.textPinwheel},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_SPIRAL_IN,                displayValue: this.textSpiralIn},
                    {group: 'menu-effect-group-entrance',   level: 'menu-effect-level-exciting',        value: AscFormat.ENTRANCE_WHIP,                     displayValue: this.textWhip},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-basic',           value: AscFormat.EMPHASIS_FILL_COLOR,               displayValue: this.textFillColor,   color: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-basic',           value: AscFormat.EMPHASIS_GROW_SHRINK,              displayValue: this.textGrowShrink},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-basic',           value: AscFormat.EMPHASIS_FONT_COLOR,               displayValue: this.textFontColor,   color: true, notsupported: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-basic',           value: AscFormat.EMPHASIS_LINE_COLOR,               displayValue: this.textLineColor,   color: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-basic',           value: AscFormat.EMPHASIS_SPIN,                     displayValue: this.textSpin},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-basic',           value: AscFormat.EMPHASIS_TRANSPARENCY,             displayValue: this.textTransparency},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_BOLD_FLASH,               displayValue: this.textBoldFlash, notsupported: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_COMPLEMENTARY_COLOR,      displayValue: this.textComplementaryColor},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_COMPLEMENTARY_COLOR_2,    displayValue: this.textComplementaryColor2},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_CONTRASTING_COLOR,        displayValue: this.textContrastingColor},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_CONTRASTING_DARKEN,       displayValue: this.textDarken},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_DESATURATE,                displayValue: this.textDesaturate},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_LIGHTEN,                  displayValue: this.textLighten},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_OBJECT_COLOR,             displayValue: this.textObjectColor,         color: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_PULSE,                    displayValue: this.textPulse},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_UNDERLINE,                displayValue: this.textUnderline, notsupported: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-subtle',          value: AscFormat.EMPHASIS_BRUSH_COLOR,              displayValue: this.textBrushColor, color:true , notsupported: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-moderate',        value: AscFormat.EMPHASIS_COLOR_PULSE,              displayValue: this.textColorPulse,          color: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-moderate',        value: AscFormat.EMPHASIS_GROW_WITH_COLOR,          displayValue: this.textGrowWithColor,       color: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-moderate',        value: AscFormat.EMPHASIS_SHIMMER,                  displayValue: this.textShimmer},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-moderate',        value: AscFormat.EMPHASIS_TEETER,                   displayValue: this.textTeeter},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-exciting',        value: AscFormat.EMPHASIS_BLINK,                    displayValue: this.textBlink},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-exciting',        value: AscFormat.EMPHASIS_BOLD_REVEAL,              displayValue: this.textBoldReveal, notsupported: true},
                    {group: 'menu-effect-group-emphasis',   level: 'menu-effect-level-exciting',        value: AscFormat.EMPHASIS_WAVE,                     displayValue: this.textWave, notsupported: true},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_BLINDS,                       displayValue: this.textBlinds},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_BOX,                          displayValue: this.textBox,                 familyEffect: 'shape'},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_CHECKERBOARD,                 displayValue: this.textCheckerboard},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_CIRCLE,                       displayValue: this.textCircle,              familyEffect: 'shape'},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_DIAMOND,                      displayValue: this.textDiamond,             familyEffect: 'shape'},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_DISAPPEAR,                    displayValue: this.textDisappear},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_DISSOLVE_OUT,                 displayValue: this.textDissolveOut},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_FLY_OUT_TO,                   displayValue: this.textFlyOut},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_PEEK_OUT_TO,                  displayValue: this.textPeekOut},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_PLUS,                         displayValue: this.textPlus,                familyEffect: 'shape'},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_RANDOM_BARS,                  displayValue: this.textRandomBars},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_SPLIT,                        displayValue: this.textSplit},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_STRIPS,                       displayValue: this.textStrips},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_WEDGE,                        displayValue: this.textWedge},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_WHEEL,                        displayValue: this.textWheel},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-basic',           value: AscFormat.EXIT_WIPE_FROM,                    displayValue: this.textWipe},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-subtle',          value: AscFormat.EXIT_CONTRACT,                     displayValue: this.textContrast},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-subtle',          value: AscFormat.EXIT_FADE,                         displayValue: this.textFade},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-subtle',          value: AscFormat.EXIT_SWIVEL,                       displayValue: this.textSwivel},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-subtle',          value: AscFormat.EXIT_ZOOM,                         displayValue: this.textZoom},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_BASIC_ZOOM,                   displayValue: this.textBasicZoom},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_CENTER_REVOLVE,               displayValue: this.textCenterRevolve},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_COLLAPSE,                     displayValue: this.textCollapse},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_FLOAT_DOWN,                   displayValue: this.textFloatDown,    familyEffect: 'exitfloat'},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_FLOAT_UP,                     displayValue: this.textFloatUp,      familyEffect: 'exitfloat'},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_SHRINK_AND_TURN,              displayValue: this.textShrinkTurn},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_SINK_DOWN,                    displayValue: this.textSinkDown},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_SPINNER,                      displayValue: this.textSpinner},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-moderate',        value: AscFormat.EXIT_STRETCHY,                     displayValue: this.textStretch},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_BASIC_SWIVEL,                 displayValue: this.textBasicSwivel},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_BOOMERANG,                    displayValue: this.textBoomerang},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_BOUNCE,                       displayValue: this.textBounce},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_CREDITS,                      displayValue: this.textCredits},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_CURVE_DOWN,                   displayValue: this.textCurveDown},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_DROP,                         displayValue: this.textDrop},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_FLIP,                         displayValue: this.textFlip},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_FLOAT,                        displayValue: this.textFloat},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_PINWHEEL,                     displayValue: this.textPinwheel},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_SPIRAL_OUT,                   displayValue: this.textSpiralOut},
                    {group: 'menu-effect-group-exit',       level: 'menu-effect-level-exciting',        value: AscFormat.EXIT_WHIP,                         displayValue: this.textWhip},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_PATH_4_POINT_STAR,          displayValue: this.textPointStar4},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_PATH_5_POINT_STAR,          displayValue: this.textPointStar5},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_PATH_6_POINT_STAR,          displayValue: this.textPointStar6},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_PATH_8_POINT_STAR,          displayValue: this.textPointStar8},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_CIRCLE,                     displayValue: this.textCircle,              familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_CRESCENT_MOON,              displayValue: this.textCrescentMoon},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_DIAMOND,                    displayValue: this.textDiamond,             familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_EQUAL_TRIANGLE,             displayValue: this.textEqualTriangle,       familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_FOOTBALL,                   displayValue: this.textFootball},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_HEART,                      displayValue: this.textHeart},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_HEXAGON,                    displayValue: this.textHexagon,             familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_OCTAGON,                    displayValue: this.textOctagon,             familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_PARALLELOGRAM,              displayValue: this.textParallelogram,       familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_PENTAGON,                   displayValue: this.textPentagon,            familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_RIGHT_TRIANGLE,             displayValue: this.textRightTriangle,       familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_SQUARE,                     displayValue: this.textSquare,              familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_TEARDROP,                   displayValue: this.textTeardrop},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-basic',           value: AscFormat.MOTION_TRAPEZOID,                  displayValue: this.textTrapezoid,           familyEffect: 'pathshapes'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_ARC_DOWN,                   displayValue: this.textArcDown,             familyEffect: 'patharcs'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_ARC_LEFT,                   displayValue: this.textArcLeft,             familyEffect: 'patharcs'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_ARC_RIGHT,                  displayValue: this.textArcRight,            familyEffect: 'patharcs'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_ARC_UP,                     displayValue: this.textArcUp,               familyEffect: 'patharcs'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_BOUNCE_LEFT,                displayValue: this.textBounceLeft},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_BOUNCE_RIGHT,               displayValue: this.textBounceRight},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_CURVY_LEFT,                 displayValue: this.textCurvyLeft},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_CURVY_RIGHT,                displayValue: this.textCurvyRight},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_DECAYING_WAVE,              displayValue: this.textDecayingWave},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_DIAGONAL_DOWN_RIGHT,        displayValue: this.textDiagonalDownRight},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_DIAGONAL_UP_RIGHT,          displayValue: this.textDiagonalUpRight},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_DOWN,                       displayValue: this.textDown,                familyEffect: 'pathlines'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_FUNNEL,                     displayValue: this.textFunnel},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_HEARTBEAT,                  displayValue: this.textHeartbeat},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_LEFT,                       displayValue: this.textLeft,                familyEffect: 'pathlines'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_RIGHT,                      displayValue: this.textRight,               familyEffect: 'pathlines'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_S_CURVE_1,                  displayValue: this.textSCurve1},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_S_CURVE_2,                  displayValue: this.textSCurve2},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_SINE_WAVE,                  displayValue: this.textSineWave},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_SINE_SPIRAL_LEFT,           displayValue: this.textSpiralLeft},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_SINE_SPIRAL_RIGHT,          displayValue: this.textSpiralRight},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_SPRING,                     displayValue: this.textSpring},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_STAIRS_DOWN,                displayValue: this.textStairsDown},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_TURN_DOWN,                  displayValue: this.textTurnDown,            familyEffect: 'pathturns'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_TURN_DOWN_RIGHT,            displayValue: this.textTurnDownRight,       familyEffect: 'pathturns'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_TURN_UP,                    displayValue: this.textTurnUp,              familyEffect: 'pathturns'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_TURN_UP_RIGHT,              displayValue: this.textTurnUpRight,         familyEffect: 'pathturns'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_UP,                         displayValue: this.textUp,                  familyEffect: 'pathlines'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_WAVE,                       displayValue: this.textWave},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-lines_curves',    value: AscFormat.MOTION_ZIGZAG,                     displayValue: this.textZigzag},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_BEAN,                       displayValue: this.textBean},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_CURVED_SQUARE,              displayValue: this.textCurvedSquare},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_CURVED_X,                   displayValue: this.textCurvedX},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_CURVY_STAR,                 displayValue: this.textCurvyStar},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_FIGURE_8_FOUR,              displayValue: this.textFigureFour},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_HORIZONTAL_FIGURE_8_FOUR,   displayValue: this.textHorizontalFigure,    familyEffect: 'pathloops'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_INVERTED_SQUARE,            displayValue: this.textInvertedSquare},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_INVERTED_TRIANGLE,          displayValue: this.textInvertedTriangle},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_LOOP_DE_LOOP,               displayValue: this.textLoopDeLoop,          familyEffect: 'pathloops'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_NEUTRON,                    displayValue: this.textNeutron},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_PEANUT,                     displayValue: this.textPeanut},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_POINTY_STAR,                displayValue: this.textPointStar},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_SWOOSH,                     displayValue: this.textSwoosh},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_VERTICAL_FIGURE_8,          displayValue: this.textVerticalFigure,      familyEffect: 'pathloops'},
                    {group: 'menu-effect-group-path',       level: 'menu-effect-level-special',         value: AscFormat.MOTION_CUSTOM_PATH,                displayValue: this.textCustomPath,  notsupported: true}

                ];
            },

            getEffectOptionsData: function (group, type) {
                switch (group) {
                    case 'menu-effect-group-entrance':
                        switch (type) {
                            case AscFormat.ENTRANCE_BLINDS:
                                return [
                                    {value: AscFormat.ENTRANCE_BLINDS_HORIZONTAL,       caption: this.textHorizontal, defvalue: true},
                                    {value: AscFormat.ENTRANCE_BLINDS_VERTICAL,         caption: this.textVertical}
                                ];
                            case AscFormat.ENTRANCE_BOX:
                                return [
                                    {value: AscFormat.ENTRANCE_BOX_IN,                  caption: this.textIn, defvalue: true},
                                    {value: AscFormat.ENTRANCE_BOX_OUT,                 caption: this.textOut}
                                ];
                            case AscFormat.ENTRANCE_CHECKERBOARD:
                                return [
                                    {value: AscFormat.ENTRANCE_CHECKERBOARD_ACROSS,     caption: this.textAcross, defvalue: true},
                                    {value: AscFormat.ENTRANCE_CHECKERBOARD_DOWN,       caption: this.textDown}
                                ];
                            case AscFormat.ENTRANCE_CIRCLE:
                                return [
                                    {value: AscFormat.ENTRANCE_CIRCLE_IN,               caption: this.textIn, defvalue: true},
                                    {value: AscFormat.ENTRANCE_CIRCLE_OUT,              caption: this.textOut}
                                ];
                            case AscFormat.ENTRANCE_DIAMOND:
                                return [
                                    {value: AscFormat.ENTRANCE_DIAMOND_IN,              caption: this.textIn, defvalue: true},
                                    {value: AscFormat.ENTRANCE_DIAMOND_OUT,             caption: this.textOut}
                                ];

                            case AscFormat.ENTRANCE_FLY_IN_FROM:
                                return [
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_BOTTOM,      caption: this.textFromBottom, defvalue: true},
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_BOTTOM_LEFT, caption: this.textFromBottomLeft},
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_LEFT,        caption: this.textFromLeft},
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_TOP_LEFT,    caption: this.textFromTopLeft},
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_TOP,         caption: this.textFromTop},
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_TOP_RIGHT,   caption: this.textFromTopRight},
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_RIGHT,       caption: this.textFromRight},
                                    {value: AscFormat.ENTRANCE_FLY_IN_FROM_BOTTOM_RIGHT, caption: this.textFromBottomRight}
                                ];
                            case AscFormat.ENTRANCE_PEEK_IN_FROM:
                                return [
                                    {value: AscFormat.ENTRANCE_PEEK_IN_FROM_BOTTOM,     caption: this.textFromBottom, defvalue: true},
                                    {value: AscFormat.ENTRANCE_PEEK_IN_FROM_LEFT,       caption: this.textFromLeft},
                                    {value: AscFormat.ENTRANCE_PEEK_IN_FROM_RIGHT,      caption: this.textFromRight},
                                    {value: AscFormat.ENTRANCE_PEEK_IN_FROM_TOP,        caption: this.textFromTop}
                                ];
                            case AscFormat.ENTRANCE_PLUS:
                                return [
                                    {value: AscFormat.ENTRANCE_PLUS_IN,                 caption: this.textIn, defvalue: true},
                                    {value: AscFormat.ENTRANCE_PLUS_OUT,                caption: this.textOut}
                                ];
                            case AscFormat.ENTRANCE_RANDOM_BARS:
                                return [
                                    {value: AscFormat.ENTRANCE_RANDOM_BARS_HORIZONTAL,  caption: this.textHorizontal, defvalue: true},
                                    {value: AscFormat.ENTRANCE_RANDOM_BARS_VERTICAL,    caption: this.textVertical}
                                ];
                            case AscFormat.ENTRANCE_SPLIT:
                                return [
                                    {value: AscFormat.ENTRANCE_SPLIT_HORIZONTAL_IN,     caption: this.textHorizontalIn},
                                    {value: AscFormat.ENTRANCE_SPLIT_HORIZONTAL_OUT,    caption: this.textHorizontalOut},
                                    {value: AscFormat.ENTRANCE_SPLIT_VERTICAL_IN,       caption: this.textVerticalIn, defvalue: true},
                                    {value: AscFormat.ENTRANCE_SPLIT_VERTICAL_OUT,      caption: this.textVerticalOut}
                                ];
                            case AscFormat.ENTRANCE_STRIPS:
                                return [
                                    {value: AscFormat.ENTRANCE_STRIPS_LEFT_DOWN,        caption: this.textLeftDown, defvalue: true},
                                    {value: AscFormat.ENTRANCE_STRIPS_LEFT_UP,          caption: this.textLeftUp},
                                    {value: AscFormat.ENTRANCE_STRIPS_RIGHT_DOWN,       caption: this.textRightDown},
                                    {value: AscFormat.ENTRANCE_STRIPS_RIGHT_UP,         caption: this.textRightUp}
                                ];
                            case AscFormat.ENTRANCE_WHEEL:
                                return [
                                    {value: AscFormat.ENTRANCE_WHEEL_1_SPOKE,           caption: this.textSpoke1, defvalue: true},
                                    {value: AscFormat.ENTRANCE_WHEEL_2_SPOKES,           caption: this.textSpoke2},
                                    {value: AscFormat.ENTRANCE_WHEEL_3_SPOKES,           caption: this.textSpoke3},
                                    {value: AscFormat.ENTRANCE_WHEEL_4_SPOKES,           caption: this.textSpoke4},
                                    {value: AscFormat.ENTRANCE_WHEEL_8_SPOKES,           caption: this.textSpoke8}
                                ];
                            case AscFormat.ENTRANCE_WIPE_FROM:
                                return [
                                    {value: AscFormat.ENTRANCE_WIPE_FROM_BOTTOM,        caption: this.textFromBottom, defvalue: true},
                                    {value: AscFormat.ENTRANCE_WIPE_FROM_LEFT,          caption: this.textFromLeft},
                                    {value: AscFormat.ENTRANCE_WIPE_FROM_RIGHT,         caption: this.textFromRight},
                                    {value: AscFormat.ENTRANCE_WIPE_FROM_TOP,           caption: this.textFromTop}
                                ];
                            case AscFormat.ENTRANCE_ZOOM:
                                return [
                                    {value: AscFormat.ENTRANCE_ZOOM_OBJECT_CENTER,      caption: this.textObjectCenter, defvalue: true},
                                    {value: AscFormat.ENTRANCE_ZOOM_SLIDE_CENTER,       caption: this.textSlideCenter}
                                ];
                            case AscFormat.ENTRANCE_BASIC_ZOOM:
                                return [
                                    {value: AscFormat.ENTRANCE_BASIC_ZOOM_IN,           caption: this.textIn, defvalue: true},
                                    {value: AscFormat.ENTRANCE_BASIC_ZOOM_IN_FROM_SCREEN_CENTER, caption: this.textInFromScreenCenter},
                                    {value: AscFormat.ENTRANCE_BASIC_ZOOM_IN_SLIGHTLY,  caption: this.textInSlightly},
                                    {value: AscFormat.ENTRANCE_BASIC_ZOOM_OUT,          caption: this.textOut},
                                    {value: AscFormat.ENTRANCE_BASIC_ZOOM_OUT_FROM_SCREEN_BOTTOM, caption: this.textOutFromScreenBottom},
                                    {value: AscFormat.ENTRANCE_BASIC_ZOOM_OUT_SLIGHTLY, caption: this.textOutSlightly}
                                ];
                            case AscFormat.ENTRANCE_STRETCH:
                                return [
                                    {value: AscFormat.ENTRANCE_STRETCH_ACROSS,          caption: this.textAcross, defvalue: true},
                                    {value: AscFormat.ENTRANCE_STRETCH_FROM_BOTTOM,     caption: this.textFromBottom},
                                    {value: AscFormat.ENTRANCE_STRETCH_FROM_LEFT,       caption: this.textFromLeft},
                                    {value: AscFormat.ENTRANCE_STRETCH_FROM_RIGHT,      caption: this.textFromRight},
                                    {value: AscFormat.ENTRANCE_STRETCH_FROM_TOP,        caption: this.textFromTop}
                                ];
                            case AscFormat.ENTRANCE_BASIC_SWIVEL:
                                return [
                                    {value: AscFormat.ENTRANCE_BASIC_SWIVEL_HORIZONTAL, caption: this.textHorizontal, defvalue: true},
                                    {value: AscFormat.ENTRANCE_BASIC_SWIVEL_VERTICAL,   caption: this.textVertical}
                                ];
                            default:
                                return undefined;
                        }
                        break;

                    case 'menu-effect-group-exit':
                        switch (type){
                            case AscFormat.EXIT_BLINDS:
                                return [
                                    {value: AscFormat.EXIT_BLINDS_HORIZONTAL,       caption: this.textHorizontal, defvalue: true},
                                    {value: AscFormat.EXIT_BLINDS_VERTICAL,         caption: this.textVertical}
                                ];
                            case AscFormat.EXIT_BOX:
                                return [
                                    {value: AscFormat.EXIT_BOX_IN,                  caption: this.textIn},
                                    {value: AscFormat.EXIT_BOX_OUT,                 caption: this.textOut, defvalue: true}
                                ];
                            case AscFormat.EXIT_CHECKERBOARD:
                                return [
                                    {value: AscFormat.EXIT_CHECKERBOARD_ACROSS,     caption: this.textAcross, defvalue: true},
                                    {value: AscFormat.EXIT_CIRCLE_OUT,              caption: this.textUp}
                                ];
                            case AscFormat.EXIT_CIRCLE:
                                return [
                                    {value: AscFormat.EXIT_CIRCLE_IN,               caption: this.textIn},
                                    {value: AscFormat.EXIT_CIRCLE_OUT,              caption: this.textOut, defvalue: true}
                                ];
                            case AscFormat.EXIT_DIAMOND:
                                return [
                                    {value: AscFormat.EXIT_DIAMOND_IN,              caption: this.textIn},
                                    {value: AscFormat.EXIT_DIAMOND_OUT,             caption: this.textOut, defvalue: true}
                                ];
                            case AscFormat.EXIT_FLY_OUT_TO:
                                return [
                                    {value: AscFormat.EXIT_FLY_OUT_TO_BOTTOM,       caption: this.textToBottom, defvalue: true},
                                    {value: AscFormat.EXIT_FLY_OUT_TO_BOTTOM_LEFT,  caption: this.textToBottomLeft},
                                    {value: AscFormat.EXIT_FLY_OUT_TO_LEFT,         caption: this.textToLeft},
                                    {value: AscFormat.EXIT_FLY_OUT_TO_TOP_LEFT,     caption: this.textToTopLeft},
                                    {value: AscFormat.EXIT_FLY_OUT_TO_TOP,          caption: this.textToTop},
                                    {value: AscFormat.EXIT_FLY_OUT_TO_TOP_RIGHT,    caption: this.textToTopRight},
                                    {value: AscFormat.EXIT_FLY_OUT_TO_RIGHT,        caption: this.textToRight},
                                    {value: AscFormat.EXIT_FLY_OUT_TO_BOTTOM_RIGHT, caption: this.textToBottomRight}
                                ];
                            case AscFormat.EXIT_PEEK_OUT_TO:
                                return [
                                    {value: AscFormat.EXIT_PEEK_OUT_TO_BOTTOM,      caption: this.textToBottom, defvalue: true},
                                    {value: AscFormat.EXIT_PEEK_OUT_TO_LEFT,        caption: this.textToLeft},
                                    {value: AscFormat.EXIT_PEEK_OUT_TO_RIGHT,       caption: this.textToRight},
                                    {value: AscFormat.EXIT_PEEK_OUT_TO_TOP,         caption: this.textToTop}
                                ];
                            case AscFormat.EXIT_PLUS:
                                return [
                                    {value: AscFormat.EXIT_PLUS_IN,                 caption: this.textIn},
                                    {value: AscFormat.EXIT_PLUS_OUT,                caption: this.textOut, defvalue: true}
                                ];
                            case AscFormat.EXIT_RANDOM_BARS:
                                return [
                                    {value: AscFormat.EXIT_RANDOM_BARS_HORIZONTAL,  caption: this.textHorizontal, defvalue: true},
                                    {value: AscFormat.EXIT_RANDOM_BARS_VERTICAL,    caption: this.textVertical}
                                ];
                            case AscFormat.EXIT_SPLIT:
                                return [
                                    {value: AscFormat.EXIT_SPLIT_HORIZONTAL_IN,     caption: this.textHorizontalIn},
                                    {value: AscFormat.EXIT_SPLIT_HORIZONTAL_OUT,    caption: this.textHorizontalOut},
                                    {value: AscFormat.EXIT_SPLIT_VERTICAL_IN,       caption: this.textVerticalIn, defvalue: true},
                                    {value: AscFormat.EXIT_SPLIT_VERTICAL_OUT,      caption: this.textVerticalOut}
                                ];
                            case AscFormat.EXIT_STRIPS:
                                return [
                                    {value: AscFormat.EXIT_STRIPS_LEFT_DOWN,        caption: this.textLeftDown, defvalue: true},
                                    {value: AscFormat.EXIT_STRIPS_LEFT_UP,          caption: this.textLeftUp},
                                    {value: AscFormat.EXIT_STRIPS_RIGHT_DOWN,       caption: this.textRightDown},
                                    {value: AscFormat.EXIT_STRIPS_RIGHT_UP,         caption: this.textRightUp}
                                ];
                            case AscFormat.EXIT_WHEEL:
                                return [
                                    {value: AscFormat.EXIT_WHEEL_1_SPOKE,           caption: this.textSpoke1, defvalue: true},
                                    {value: AscFormat.EXIT_WHEEL_2_SPOKES,           caption: this.textSpoke2},
                                    {value: AscFormat.EXIT_WHEEL_3_SPOKES,           caption: this.textSpoke3},
                                    {value: AscFormat.EXIT_WHEEL_4_SPOKES,           caption: this.textSpoke4},
                                    {value: AscFormat.EXIT_WHEEL_8_SPOKES,           caption: this.textSpoke8}
                                ];
                            case AscFormat.EXIT_WIPE_FROM:
                                return [
                                    {value: AscFormat.EXIT_WIPE_FROM_BOTTOM,        caption: this.textFromBottom, defvalue: true},
                                    {value: AscFormat.EXIT_WIPE_FROM_LEFT,          caption: this.textFromLeft},
                                    {value: AscFormat.EXIT_WIPE_FROM_RIGHT,         caption: this.textFromRight},
                                    {value: AscFormat.EXIT_WIPE_FROM_TOP,           caption: this.textFromTop}
                                ];
                            case AscFormat.EXIT_ZOOM:
                                return [
                                    {value: AscFormat.EXIT_ZOOM_OBJECT_CENTER,  caption: this.textObjectCenter, defvalue: true},
                                    {value: AscFormat.EXIT_ZOOM_SLIDE_CENTER,   caption: this.textSlideCenter}
                                ];
                            case AscFormat.EXIT_BASIC_ZOOM:
                                return [
                                    {value: AscFormat.EXIT_BASIC_ZOOM_OUT,          caption: this.textOut, defvalue: true},
                                    {value: AscFormat.EXIT_BASIC_ZOOM_OUT_TO_SCREEN_CENTER, caption: this.textOutToScreenCenter},
                                    {value: AscFormat.EXIT_BASIC_ZOOM_OUT_SLIGHTLY, caption: this.textOutSlightly},
                                    {value: AscFormat.EXIT_BASIC_ZOOM_IN,           caption: this.textIn},
                                    {value: AscFormat.EXIT_BASIC_ZOOM_IN_TO_SCREEN_BOTTOM, caption: this.textInToScreenBottom},
                                    {value: AscFormat.EXIT_BASIC_ZOOM_IN_SLIGHTLY,  caption: this.textInSlightly}
                                ];
                            case AscFormat.EXIT_COLLAPSE:
                                return [
                                    {value: AscFormat.EXIT_COLLAPSE_ACROSS,         caption: this.textAcross, defvalue: true},
                                    {value: AscFormat.EXIT_COLLAPSE_TO_BOTTOM,      caption: this.textToBottom},
                                    {value: AscFormat.EXIT_COLLAPSE_TO_LEFT,        caption: this.textToLeft},
                                    {value: AscFormat.EXIT_COLLAPSE_TO_RIGHT,       caption: this.textToRight},
                                    {value: AscFormat.EXIT_COLLAPSE_TO_TOP,         caption: this.textToTop}
                                ];
                            case AscFormat.EXIT_BASIC_SWIVEL:
                                return [
                                    {value: AscFormat.EXIT_BASIC_SWIVEL_HORIZONTAL, caption: this.textHorizontal, defvalue: true},
                                    {value: AscFormat.EXIT_BASIC_SWIVEL_VERTICAL,   caption: this.textVertical}
                                ];
                            default:
                                return undefined;
                        }
                        break;
                    case  'menu-effect-group-path':
                        switch (type) {
                            case AscFormat.MOTION_CUSTOM_PATH:
                                return [
                                    {value: AscFormat.MOTION_CUSTOM_PATH_CURVE,        caption: this.textPathCurve, isCustom: true},
                                    {value: AscFormat.MOTION_CUSTOM_PATH_LINE,         caption: this.textPathLine, isCustom: true},
                                    {value: AscFormat.MOTION_CUSTOM_PATH_SCRIBBLE,     caption: this.textPathScribble, isCustom: true}
                                ];
                        }
                        break;
                    default:
                        return undefined;
                }
            },
            getSimilarEffectsArray: function (familyEffect) {
                switch (familyEffect){
                    case 'shape':
                        return [
                            {value: AscFormat.EXIT_CIRCLE,  caption: this.textCircle},
                            {value: AscFormat.EXIT_BOX,     caption: this.textBox},
                            {value: AscFormat.EXIT_DIAMOND, caption: this.textDiamond},
                            {value: AscFormat.EXIT_PLUS,    caption: this.textPlus}
                        ];
                    case 'entrshape':
                        return [
                            {value: AscFormat.ENTRANCE_CIRCLE,  caption: this.textCircle},
                            {value: AscFormat.ENTRANCE_BOX,     caption: this.textBox},
                            {value: AscFormat.ENTRANCE_DIAMOND, caption: this.textDiamond},
                            {value: AscFormat.ENTRANCE_PLUS,    caption: this.textPlus}
                        ];
                    case 'pathlines':
                        return[
                            {value: AscFormat.MOTION_DOWN,  caption: this.textDown},
                            {value: AscFormat.MOTION_LEFT,  caption: this.textLeft},
                            {value: AscFormat.MOTION_RIGHT, caption: this.textRight},
                            {value: AscFormat.MOTION_UP,    caption: this.textUp}
                        ];
                    case 'patharcs':
                        return [
                            {value: AscFormat.MOTION_ARC_DOWN,  caption: this.textArcDown},
                            {value: AscFormat.MOTION_ARC_LEFT,  caption: this.textArcLeft},
                            {value: AscFormat.MOTION_ARC_RIGHT, caption: this.textArcRight},
                            {value: AscFormat.MOTION_ARC_UP,    caption: this.textArcUp}
                        ];
                    case 'pathturns':
                        return [
                            {value: AscFormat.MOTION_TURN_DOWN,       caption: this.textTurnDown},
                            {value: AscFormat.MOTION_TURN_DOWN_RIGHT, caption: this.textTurnDownRight},
                            {value: AscFormat.MOTION_TURN_UP,         caption: this.textTurnUp},
                            {value: AscFormat.MOTION_TURN_UP_RIGHT,   caption: this.textTurnUpRight}
                        ];
                    case 'pathshapes':
                        return [
                            {value: AscFormat.MOTION_CIRCLE,         caption: this.textCircle},
                            {value: AscFormat.MOTION_DIAMOND,        caption: this.textDiamond},
                            {value: AscFormat.MOTION_EQUAL_TRIANGLE, caption: this.textEqualTriangle},
                            {value: AscFormat.MOTION_HEXAGON,        caption: this.textHexagon},
                            {value: AscFormat.MOTION_OCTAGON,        caption: this.textOctagon},
                            {value: AscFormat.MOTION_PARALLELOGRAM,  caption: this.textParallelogram},
                            {value: AscFormat.MOTION_PENTAGON,       caption: this.textPentagon},
                            {value: AscFormat.MOTION_RIGHT_TRIANGLE, caption: this.textRightTriangle},
                            {value: AscFormat.MOTION_SQUARE,         caption: this.textSquare},
                            {value: AscFormat.MOTION_TRAPEZOID,      caption: this.textTrapezoid}

                        ];
                    case 'pathloops':
                        return [
                            {value: AscFormat.MOTION_HORIZONTAL_FIGURE_8_FOUR, caption: this.textHorizontalFigure},
                            {value: AscFormat.MOTION_VERTICAL_FIGURE_8,        caption: this.textVerticalFigure},
                            {value: AscFormat.MOTION_LOOP_DE_LOOP,             caption: this.textLoopDeLoop}
                        ];
                    case 'entrfloat':
                        return [
                            {value: AscFormat.ENTRANCE_FLOAT_UP,            caption: this.textFloatUp},
                            {value: AscFormat.ENTRANCE_FLOAT_DOWN,          caption: this.textFloatDown}
                        ];
                    case 'exitfloat':
                        return [
                            {value: AscFormat.EXIT_FLOAT_UP,            caption: this.textFloatUp},
                            {value: AscFormat.EXIT_FLOAT_DOWN,          caption: this.textFloatDown}
                        ];
                    default:
                        return [];
                }
            }
        }
    })(), Common.define.effectData || {});

    Common.define.gridlineData = _.extend(new (function () {
        return {
            txtCm: 'cm',
            txtPt: 'pt',

            getGridlineData: function (metric) {
                switch (metric) {
                    case Common.Utils.Metric.c_MetricUnits.inch:
                        return [
                            { caption: '1/16 \"', value: 0.06 },
                            { caption: '1/12 \"', value: 0.08 },
                            { caption: '1/10 \"', value: 0.1 },
                            { caption: '1/8 \"', value: 0.13 },
                            { caption: '1/6 \"', value: 0.17 },
                            { caption: '1/5 \"', value: 0.2 },
                            { caption: '1/4 \"', value: 0.25 },
                            { caption: '1/3 \"', value: 0.33 },
                            { caption: '1/2 \"', value: 0.5 },
                            { caption: '1 \"', value: 1 },
                            { caption: '2 \"', value: 2 }
                        ];
                    case Common.Utils.Metric.c_MetricUnits.cm:
                        return [
                            { caption: '1/8 ' + this.txtCm, value: 0.13 },
                            { caption: '1/6 ' + this.txtCm, value: 0.17 },
                            { caption: '1/5 ' + this.txtCm, value: 0.2 },
                            { caption: '1/4 ' + this.txtCm, value: 0.25 },
                            { caption: '1/3 ' + this.txtCm, value: 0.33 },
                            { caption: '1/2 ' + this.txtCm, value: 0.5 },
                            { caption: '1 ' + this.txtCm, value: 1 },
                            { caption: '2 ' + this.txtCm, value: 2 },
                            { caption: '3 ' + this.txtCm, value: 3 },
                            { caption: '4 ' + this.txtCm, value: 4 },
                            { caption: '5 ' + this.txtCm, value: 5 }
                        ];
                    case Common.Utils.Metric.c_MetricUnits.pt:
                        return [
                            { caption: '4 ' + this.txtPt, value: 4 },
                            { caption: '8 ' + this.txtPt, value: 8 },
                            { caption: '12 ' + this.txtPt, value: 12 },
                            { caption: '16 ' + this.txtPt, value: 16 },
                            { caption: '20 ' + this.txtPt, value: 20 },
                            { caption: '24 ' + this.txtPt, value: 24 },
                            { caption: '36 ' + this.txtPt, value: 36 },
                            { caption: '40 ' + this.txtPt, value: 40 },
                            { caption: '56 ' + this.txtPt, value: 56 },
                            { caption: '64 ' + this.txtPt, value: 64 },
                            { caption: '72 ' + this.txtPt, value: 72 },
                            { caption: '144 ' + this.txtPt, value: 144 }
                        ];
                }
            }
        }
    })(), Common.define.gridlineData || {});
});