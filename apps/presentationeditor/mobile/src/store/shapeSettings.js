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

import {action, observable, computed, makeObservable} from 'mobx';
import ShapeArrow from '@common/resources/img/shapes/shape-arrow.svg';
import ShapeBentArrow from '@common/resources/img/shapes/shape-bent-arrow.svg';
import ShapeBentLeftArrow from '@common/resources/img/shapes/shape-bent-left-arrow.svg';
import ShapeBentRightArrow from '@common/resources/img/shapes/shape-bent-right-arrow.svg';
import ShapeBentUpArrow from '@common/resources/img/shapes/shape-bent-up-arrow.svg';
import ShapeChevron from '@common/resources/img/shapes/shape-chevron.svg';
import ShapeCircle from '@common/resources/img/shapes/shape-circle.svg';
import ShapeCircularArrow from '@common/resources/img/shapes/shape-circular-arrow.svg';
import ShapeCloud from '@common/resources/img/shapes/shape-cloud.svg';
import ShapeCurvedDown from '@common/resources/img/shapes/shape-curved-down-arrow.svg';
import ShapeCurvedLeft from '@common/resources/img/shapes/shape-curved-left-arrow.svg';
import ShapeCurvedRight from '@common/resources/img/shapes/shape-curved-right-arrow.svg';
import ShapeCurvedUp from '@common/resources/img/shapes/shape-curved-up-arrow.svg';
import ShapeDouble from '@common/resources/img/shapes/shape-double-arrow.svg';
import ShapeDownArrow from '@common/resources/img/shapes/shape-down-arrow-callout.svg';
import ShapeFlowchart from '@common/resources/img/shapes/shape-flowchart-off-page-connector.svg';
import ShapeHeart from '@common/resources/img/shapes/shape-heart.svg';
import ShapeHexagon from '@common/resources/img/shapes/shape-hexagon.svg';
import ShapeHomePlate from '@common/resources/img/shapes/shape-home-plate.svg';
import ShapeLeftArrow from '@common/resources/img/shapes/shape-left-arrow.svg';
import ShapeLeftArrowCallout from '@common/resources/img/shapes/shape-left-arrow-callout.svg';
import ShapeLeftRight from '@common/resources/img/shapes/shape-left-right-arrow.svg';
import ShapeLeftRightCallout from '@common/resources/img/shapes/shape-left-right-arrow-callout.svg';
import ShapeLeftRightUpArrow from '@common/resources/img/shapes/shape-left-right-up-arrow.svg';
import ShapeLeftUpArrow from '@common/resources/img/shapes/shape-left-up-arrow.svg';
import ShapeLine from '@common/resources/img/shapes/shape-line.svg';
import ShapeMinus from '@common/resources/img/shapes/shape-minus.svg';
import ShapeNotched from '@common/resources/img/shapes/shape-notched-right-arrow.svg';
import ShapeOctagon from '@common/resources/img/shapes/shape-octagon.svg';
import ShapeOvalCallout from '@common/resources/img/shapes/shape-oval-callout.svg';
import ShapeParallelogram from '@common/resources/img/shapes/shape-parallelogram.svg';
import ShapePlus from '@common/resources/img/shapes/shape-plus.svg';
import ShapeQuadArrow from '@common/resources/img/shapes/shape-quad-arrow.svg';
import ShapeQuadCallout from '@common/resources/img/shapes/shape-quad-arrow-callout.svg';
import ShapeRectangular from '@common/resources/img/shapes/shape-rectangular-callout.svg';
import ShapeRhombus from '@common/resources/img/shapes/shape-rhombus.svg';
import ShapeRightArrow from '@common/resources/img/shapes/shape-right-arrow.svg';
import ShapeRightCallout from '@common/resources/img/shapes/shape-right-arrow-callout.svg';
import ShapeRightTriangle from '@common/resources/img/shapes/shape-right-triangle.svg';
import ShapeRoundedSquare from '@common/resources/img/shapes/shape-rounded-square.svg';
import ShapeSquare from '@common/resources/img/shapes/shape-square.svg';
import ShapeStriped from '@common/resources/img/shapes/shape-striped-right-arrow.svg';
import ShapeText from '@common/resources/img/shapes/shape-text.svg';
import ShapeTrapezoid from '@common/resources/img/shapes/shape-trapezoid.svg';
import ShapeTriangle from '@common/resources/img/shapes/shape-triangle.svg';
import ShapeUpArrow from '@common/resources/img/shapes/shape-up-arrow-callout.svg';
import ShapeUpDown from '@common/resources/img/shapes/shape-up-down-arrow.svg';
import ShapeUturn from '@common/resources/img/shapes/shape-uturn-arrow.svg';

export class storeShapeSettings {
    constructor() {
        makeObservable(this, {
            fillColor: observable,
            borderColorView: observable,
            setFillColor: action,
            getFillColor: action,
            setBorderColor: action,
            initBorderColorView: action
        });
    }

    getStyleGroups () {
        const styles = [
            {
                title: 'Text',
                thumb: ShapeText.id,
                type: 'textRect'
            },
            {
                title: 'Line',
                thumb: ShapeLine.id,
                type: 'line'
            },
            {
                title: 'Line with arrow',
                thumb: ShapeArrow.id,
                type: 'lineWithArrow'
            },
            {
                title: 'Line with two arrows',
                thumb: ShapeDouble.id,
                type: 'lineWithTwoArrows'
            },
            {
                title: 'Rect',
                thumb: ShapeSquare.id,
                type: 'rect'
            },
            {
                title: 'Hexagon',
                thumb: ShapeHexagon.id,
                type: 'hexagon'
            },
            {
                title: 'Round rect',
                thumb: ShapeRoundedSquare.id,
                type: 'roundRect'
            },
            {
                title: 'Ellipse',
                thumb: ShapeCircle.id,
                type: 'ellipse'
            },
            {
                title: 'Triangle',
                thumb: ShapeTriangle.id,
                type: 'triangle'
            },
            {
                title: 'Triangle',
                thumb: ShapeRightTriangle.id,
                type: 'rtTriangle'
            },
            {
                title: 'Trapezoid',
                thumb: ShapeTrapezoid.id,
                type: 'trapezoid'
            },
            {
                title: 'Diamond',
                thumb: ShapeRhombus.id,
                type: 'diamond'
            },
            {
                title: 'Right arrow',
                thumb: ShapeRightArrow.id,
                type: 'rightArrow'
            },
            {
                title: 'Left-right arrow',
                thumb: ShapeLeftRight.id,
                type: 'leftRightArrow'
            },
            {
                title: 'Left arrow callout',
                thumb: ShapeLeftArrow.id,
                type: 'leftArrow'
            },
            {
                title: 'Right arrow callout',
                thumb: ShapeBentUpArrow.id,
                type: 'bentUpArrow'
            },
            {
                title: 'Flow chart off page connector',
                thumb: ShapeFlowchart.id,
                type: 'flowChartOffpageConnector'
            },
            {
                title: 'Heart',
                thumb: ShapeHeart.id,
                type: 'heart'
            },
            {
                title: 'Math minus',
                thumb: ShapeMinus.id,
                type: 'mathMinus'
            },
            {
                title: 'Math plus',
                thumb: ShapePlus.id,
                type: 'mathPlus'
            },
            {
                title: 'Parallelogram',
                thumb: ShapeParallelogram.id,
                type: 'parallelogram'
            },
            {
                title: 'Wedge rect callout',
                thumb: ShapeRectangular.id,
                type: 'wedgeRectCallout'
            },
            {
                title: 'Wedge ellipse callout',
                thumb: ShapeOvalCallout.id,
                type: 'wedgeEllipseCallout'
            },
            {
                title: 'Cloud callout',
                thumb: ShapeCloud.id,
                type: 'cloudCallout'
            },
            {
                title: 'Octagon',
                thumb: ShapeOctagon.id,
                type: 'octagon'
            },
            {
                title: 'Bent right arrow',
                thumb: ShapeBentRightArrow.id,
                type: 'bentRightArrow'
            },
            {
                title: 'Quad arrow',
                thumb: ShapeQuadArrow.id,
                type: 'quadArrow'
            },
            {
                title: 'Left-right-up arrow',
                thumb: ShapeLeftRightUpArrow.id,
                type: 'leftRightUpArrow'
            },
            {
                title: 'Bent arrow',
                thumb: ShapeBentArrow.id,
                type: 'bentArrow'
            },
            {
                title: 'U-turn arrow',
                thumb: ShapeUturn.id,
                type: 'uturnArrow'
            },
            {
                title: 'Left-up arrow',
                thumb: ShapeLeftUpArrow.id,
                type: 'leftUpArrow'
            },
            {
                title: 'Curved right arrow',
                thumb: ShapeCurvedRight.id,
                type: 'curvedRightArrow'
            },
            {
                title: 'Curved left arrow',
                thumb: ShapeCurvedLeft.id,
                type: 'curvedLeftArrow'
            },
            {
                title: 'Curved down arrow',
                thumb: ShapeCurvedDown.id,
                type: 'curvedDownArrow'
            },
            {
                title: 'Curved up arrow',
                thumb: ShapeCurvedUp.id,
                type: 'curvedUpArrow'
            },
            {
                title: 'Up-down arrow',
                thumb: ShapeUpDown.id,
                type: 'upDownArrow'
            },
            {
                title: 'Chevron',
                thumb: ShapeChevron.id,
                type: 'chevron'
            },
            {
                title: 'Home plate',
                thumb: ShapeHomePlate.id,
                type: 'homePlate'
            },
            {
                title: 'Notched right arrow',
                thumb: ShapeNotched.id,
                type: 'notchedRightArrow'
            },
            {
                title: 'Striped right arrow',
                thumb: ShapeStriped.id,
                type: 'stripedRightArrow'
            },
            {
                title: 'Left-right arrow callout',
                thumb: ShapeLeftRightCallout.id,
                type: 'leftRightArrowCallout'
            },
            {
                title: 'Left arrow callout',
                thumb: ShapeLeftArrowCallout.id,
                type: 'leftArrowCallout'
            },
            {
                title: 'Up arrow callout',
                thumb: ShapeUpArrow.id,
                type: 'upArrowCallout'
            },
            {
                title: 'Down arrow callout',
                thumb: ShapeDownArrow.id,
                type: 'downArrowCallout'
            },
            {
                title: 'Right arrow callout',
                thumb: ShapeRightCallout.id,
                type: 'rightArrowCallout'
            },
            {
                title: 'Circular arrow',
                thumb: ShapeCircularArrow.id,
                type: 'circularArrow'
            },
            {
                title: 'Quad arrow callout',
                thumb: ShapeQuadCallout.id,
                type: 'quadArrowCallout'
            },
            {
                title: 'Bent left arrow',
                thumb: ShapeBentLeftArrow.id,
                type: 'bentLeftArrow'
            }
        ];
        const groups = [];
        let i = 0;
        for (let row=0; row<Math.floor(styles.length/4); row++) {
            const group = [];
            for (let cell=0; cell<4; cell++) {
                group.push(styles[i]);
                i++;
            }
            groups.push(group);
        }
        return groups;
    }

    // Fill Color

    fillColor = undefined;

    setFillColor (color) {
        this.fillColor = color;
    }

    getFillColor (shapeObject) {
        let fill = shapeObject.get_fill();
        const fillType = fill.get_type();
        let color = 'transparent';

        if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
            fill = fill.get_fill();
            const sdkColor = fill.get_color();
            if (sdkColor) {
                if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                } else {
                    color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                }
            }
        }

        this.fillColor = color;
        return color;
    }

    // Border size and color

    borderColorView;

    setBorderColor (color) {
        this.borderColorView = color;
    }

    initBorderColorView (shapeObject) {
        const stroke = shapeObject.get_stroke();
        let color = 'transparent';

        if (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {
            const sdkColor = stroke.get_color();
            if (sdkColor) {
                if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                }
                else {
                    color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                }
            }
        }
        
        this.borderColorView = color;
        return color;
    }

    borderSizeTransform () {
        const _sizes = [0, 0.5, 1, 1.5, 2.25, 3, 4.5, 6];

        return {
            sizeByIndex: function (index) {
                if (index < 1) return _sizes[0];
                if (index > _sizes.length - 1) return _sizes[_sizes.length - 1];
                return _sizes[index];
            },

            indexSizeByValue: function (value) {
                let index = 0;
                _sizes.forEach((size, idx) => {
                    if (Math.abs(size - value) < 0.25) {
                        index = idx;
                    }
                });
                return index;
            },

            sizeByValue: function (value) {
                return _sizes[this.indexSizeByValue(value)];
            }
        }
    }

}
