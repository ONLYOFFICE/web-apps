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
import ChartColumnNormal from '@common/resources/img/charts/chart-column-normal.svg';
import ChartColumnStack from '@common/resources/img/charts/chart-column-stack.svg';
import ChartColumnPstack from '@common/resources/img/charts/chart-column-pstack.svg';
import ChartColumn3dNormal from '@common/resources/img/charts/chart-column-3d-normal.svg';
import ChartColumn3dStack from '@common/resources/img/charts/chart-column-3d-stack.svg';
import ChartColumn3dPstack from '@common/resources/img/charts/chart-column-3d-pstack.svg';
import ChartColumn3dNormalPer from '@common/resources/img/charts/chart-column-3d-normal-per.svg';
import ChartLineNormal from '@common/resources/img/charts/chart-line-normal.svg';
import ChartLineStacked from '@common/resources/img/charts/chart-line-stacked.svg';
import ChartLine100Stacked from '@common/resources/img/charts/chart-line-100-stacked.svg';
import ChartLineMarkers from '@common/resources/img/charts/chart-line-markers.svg';
import ChartStackedMarkers from '@common/resources/img/charts/chart-stacked-markers.svg';
import Chart100StackedMarkers from '@common/resources/img/charts/chart-100-stacked-markers.svg';
import ChartLine3d from '@common/resources/img/charts/chart-line-3d.svg';
import ChartPieNormal from '@common/resources/img/charts/chart-pie-normal.svg';
import ChartPieDoughnut from '@common/resources/img/charts/chart-pie-doughnut.svg';
import ChartPie3dNormal from '@common/resources/img/charts/chart-pie-3d-normal.svg';
import ChartBarNormal from '@common/resources/img/charts/chart-bar-normal.svg';
import ChartBarStack from '@common/resources/img/charts/chart-bar-stack.svg';
import ChartBarPstack from '@common/resources/img/charts/chart-bar-pstack.svg';
import ChartBar3dNormal from '@common/resources/img/charts/chart-bar-3d-normal.svg';
import ChartBar3dStack from '@common/resources/img/charts/chart-bar-3d-stack.svg';
import ChartBar3dPstack from '@common/resources/img/charts/chart-bar-3d-pstack.svg';
import ChartAreaNormal from '@common/resources/img/charts/chart-area-normal.svg';
import ChartAreaStack from '@common/resources/img/charts/chart-area-stack.svg';
import ChartAreaPstack from '@common/resources/img/charts/chart-area-pstack.svg';
import ChartStockNormal from '@common/resources/img/charts/chart-stock-normal.svg';
import ChartScatterNormal from '@common/resources/img/charts/chart-scatter-normal.svg';
import ChartScatterSmoothLinesAndMarkers from '@common/resources/img/charts/chart-scatter-smooth-lines-and-markers.svg';
import ChartScatterSmoothLines from '@common/resources/img/charts/chart-scatter-smooth-lines.svg';
import ChartScatterStraightLinesAndMarkers from '@common/resources/img/charts/chart-scatter-straight-lines-and-markers.svg';
import ChartScatterStraightLines from '@common/resources/img/charts/chart-scatter-straight-lines.svg';
import ChartRadar1 from '@common/resources/img/charts/chart-radar-1.svg';
import ChartRadar2 from '@common/resources/img/charts/chart-radar-2.svg';
import ChartRadar3 from '@common/resources/img/charts/chart-radar-3.svg';
import ChartComboColumnLine from '@common/resources/img/charts/chart-combo-column-line.svg';
import ChartComboColumnLineSecondaryAxis from '@common/resources/img/charts/chart-combo-column-line-secondary-axis.svg';
import ChartComboColumnAreaStack from '@common/resources/img/charts/chart-combo-column-area-stack.svg';

export class storeChartSettings {
    constructor() {
        makeObservable(this, {
            borderColor: observable,
            fillColor: observable,
            chartStyles: observable,
            setBorderColor: action,
            initBorderColor: action,
            setFillColor: action,
            getFillColor: action,
            clearChartStyles: action,
            updateChartStyles: action,
            styles: computed,
            types: computed,
        });
    }
    
    borderColor = undefined;

    setBorderColor (color) {
        this.borderColor = color;
    }

    initBorderColor(shapeProperties) {
        let stroke = shapeProperties.get_stroke();
        this.borderColor = (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) ? this.resetColor(stroke.get_color()) : 'transparent';
    }

    fillColor = undefined;

    setFillColor (color) {
        this.fillColor = color;
    }

    getFillColor (shapeProperties) {
        const fill = shapeProperties.asc_getFill();
        const fillType = fill.asc_getType();

        if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
            this.fillColor = this.resetColor(fill.asc_getFill().asc_getColor());
        }

        return this.fillColor;
    }

    chartStyles = null;

    clearChartStyles () {
        this.chartStyles = null;
    }

    updateChartStyles (styles) {
        this.chartStyles = styles;
    }

    get styles () {
        if (!this.chartStyles) return null;
        const widthContainer = document.querySelector(".page-content").clientWidth;
        const columns = parseInt(widthContainer / 70); // magic
        let row = -1;
        const styles = [];
        
        this.chartStyles.forEach((style, index) => {
            if (0 == index % columns) {
                styles.push([]);
                row++
            }
            styles[row].push(style);
        });

        return styles;
    }

    get types () {
        const _types = [
            { type: Asc.c_oAscChartTypeSettings.barNormal,               thumb: ChartColumnNormal.id },
            { type: Asc.c_oAscChartTypeSettings.barStacked,              thumb: ChartColumnStack.id },
            { type: Asc.c_oAscChartTypeSettings.barStackedPer,           thumb: ChartColumnPstack.id },
            { type: Asc.c_oAscChartTypeSettings.barNormal3d,             thumb: ChartColumn3dNormal.id },
            { type: Asc.c_oAscChartTypeSettings.barStacked3d,            thumb: ChartColumn3dStack.id },
            { type: Asc.c_oAscChartTypeSettings.barStackedPer3d,         thumb: ChartColumn3dPstack.id },
            { type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,  thumb: ChartColumn3dNormalPer.id },
            { type: Asc.c_oAscChartTypeSettings.lineNormal,              thumb: ChartLineNormal.id },
            { type: Asc.c_oAscChartTypeSettings.lineStacked,             thumb: ChartLineStacked.id },
            { type: Asc.c_oAscChartTypeSettings.lineStackedPer,          thumb: ChartLine100Stacked.id },
            { type: Asc.c_oAscChartTypeSettings.lineNormalMarker,        thumb: ChartLineMarkers.id },
            { type: Asc.c_oAscChartTypeSettings.lineStackedMarker,       thumb: ChartStackedMarkers.id },
            { type: Asc.c_oAscChartTypeSettings.lineStackedPerMarker,    thumb: Chart100StackedMarkers.id },
            { type: Asc.c_oAscChartTypeSettings.line3d,                  thumb: ChartLine3d.id },
            { type: Asc.c_oAscChartTypeSettings.pie,                     thumb: ChartPieNormal.id },
            { type: Asc.c_oAscChartTypeSettings.doughnut,                thumb: ChartPieDoughnut.id },
            { type: Asc.c_oAscChartTypeSettings.pie3d,                   thumb: ChartPie3dNormal.id },
            { type: Asc.c_oAscChartTypeSettings.hBarNormal,              thumb: ChartBarNormal.id },
            { type: Asc.c_oAscChartTypeSettings.hBarStacked,             thumb: ChartBarStack.id },
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer,          thumb: ChartBarPstack.id },
            { type: Asc.c_oAscChartTypeSettings.hBarNormal3d,            thumb: ChartBar3dNormal.id },
            { type: Asc.c_oAscChartTypeSettings.hBarStacked3d,           thumb: ChartBar3dStack.id },
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,        thumb: ChartBar3dPstack.id },
            { type: Asc.c_oAscChartTypeSettings.areaNormal,              thumb: ChartAreaNormal.id },
            { type: Asc.c_oAscChartTypeSettings.areaStacked,             thumb: ChartAreaStack.id },
            { type: Asc.c_oAscChartTypeSettings.areaStackedPer,          thumb: ChartAreaPstack.id },
            { type: Asc.c_oAscChartTypeSettings.stock,                   thumb: ChartStockNormal.id },
            { type: Asc.c_oAscChartTypeSettings.scatter,                 thumb: ChartScatterNormal.id },
            { type: Asc.c_oAscChartTypeSettings.scatterSmoothMarker,     thumb: ChartScatterSmoothLinesAndMarkers.id },
            { type: Asc.c_oAscChartTypeSettings.scatterSmooth,           thumb: ChartScatterSmoothLines.id },
            { type: Asc.c_oAscChartTypeSettings.scatterLineMarker,       thumb: ChartScatterStraightLinesAndMarkers.id },
            { type: Asc.c_oAscChartTypeSettings.scatterLine,             thumb: ChartScatterStraightLines.id },
            { type: Asc.c_oAscChartTypeSettings.radar,                   thumb: ChartRadar1.id },
            { type: Asc.c_oAscChartTypeSettings.radarMarker,             thumb: ChartRadar2.id },
            { type: Asc.c_oAscChartTypeSettings.radarFilled,             thumb: ChartRadar3.id },
            { type: Asc.c_oAscChartTypeSettings.comboBarLine,            thumb: ChartComboColumnLine.id },
            { type: Asc.c_oAscChartTypeSettings.comboBarLineSecondary,   thumb: ChartComboColumnLineSecondaryAxis.id },
            { type: Asc.c_oAscChartTypeSettings.comboAreaBar,            thumb: ChartComboColumnAreaStack.id },
            { type: Asc.c_oAscChartTypeSettings.radar,                   thumb: 'radar'},
            { type: Asc.c_oAscChartTypeSettings.radarMarker,             thumb: 'radarMarker'},
            { type: Asc.c_oAscChartTypeSettings.radarFilled,             thumb: 'radarFilled'},
        ];
        const columns = 3;
        let row = -1;
        const groups = [];
        _types.forEach((type, index) => {
            if (0 == index % columns) {
                groups.push([]);
                row++
            }
            groups[row].push(type);
        });
        return groups;
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

    resetColor(color) {
        let clr = 'transparent';

        if(color) {
            if (color.get_auto()) {
                clr = 'auto'
            } else {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    clr = {
                        color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                        effectValue: color.get_value()
                    }
                } else {
                    clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
        }

        return clr;
    }

}
