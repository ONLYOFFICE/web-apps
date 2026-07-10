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

import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditChart } from '../../view/edit/EditChart'

class EditChartController extends Component {
    constructor (props) {
        super(props);
        this.onType = this.onType.bind(this);
        this.onBorderColor = this.onBorderColor.bind(this);
        this.onBorderSize = this.onBorderSize.bind(this);
        this.onStyle = this.onStyle.bind(this);

        const type = props.storeFocusObjects.chartObject.getType();
        if (type==Asc.c_oAscChartTypeSettings.comboBarLine ||
            type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
            type==Asc.c_oAscChartTypeSettings.comboAreaBar ||
            type==Asc.c_oAscChartTypeSettings.comboCustom) {
            props.storeChartSettings.clearChartStyles();
        } else {
            const api = Common.EditorApi.get();
            props.storeChartSettings.updateChartStyles(api.asc_getChartPreviews(type));
        }
    }

    onRemoveChart () {
        const api = Common.EditorApi.get();
        api.asc_Remove();

        if ( Device.phone ) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        } 
    }

    onReorder(type) {
        const api = Common.EditorApi.get();

        switch(type) {
            case 'all-up':
                api.shapes_bringToFront();
                break;
            case 'all-down':
                api.shapes_bringToBack();
                break;
            case 'move-up':
                api.shapes_bringForward();
                break;
            case 'move-down':
                api.shapes_bringBackward();
                break;
        }
    }

    onAlign(type) {
        const api = Common.EditorApi.get();

        switch(type) {
            case 'align-left':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_LEFT);
                break;
            case 'align-center':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_CENTER);
                break;
            case 'align-right':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_RIGHT);
                break;
            case 'align-top':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_TOP);
                break;
            case 'align-middle':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_MIDDLE);
                break;
            case 'align-bottom':
                api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_BOTTOM);
                break;
            case 'distrib-hor':
                api.DistributeHorizontally();
                break;
            case 'distrib-vert':
                api.DistributeVertically();
                break;
        }
    }

    onStyle (style) {
        const api = Common.EditorApi.get();
        let chart = new Asc.CAscChartProp();
        const chartProps = this.props.storeFocusObjects.chartObject.get_ChartProperties();
        chartProps.putStyle(style);
        chart.put_ChartProperties(chartProps);
        api.ChartApply(chart);
    }

    onType (type) {
        const api = Common.EditorApi.get();
        let chart = this.props.storeFocusObjects.chartObject.get_ChartProperties();
        chart.changeType(type);
        // Force update styles
        this.props.storeChartSettings.updateChartStyles(api.asc_getChartPreviews(chart.getType()));
    }

    onFillColor (color) {
        const api = Common.EditorApi.get();
        const shape = new Asc.asc_CShapeProperty();
        const fill = new Asc.asc_CShapeFill();

        if (color == 'transparent') {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
            fill.put_fill(null);
        } else {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
            fill.put_fill(new Asc.asc_CFillSolid());
            fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(color));
        }

        shape.put_fill(fill);
        api.ShapeApply(shape);
    }

    onBorderColor (color) {
        const api = Common.EditorApi.get();
        const currentShape = this.props.storeFocusObjects.shapeObject;
        const shape = new Asc.asc_CShapeProperty();
        const stroke = new Asc.asc_CStroke();

        if (currentShape.get_stroke().get_width() < 0.01) {
            stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
        } else {
            stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
            stroke.put_color(Common.Utils.ThemeColor.getRgbColor(color));
            stroke.put_width(currentShape.get_stroke().get_width());
            stroke.asc_putPrstDash(currentShape.get_stroke().asc_getPrstDash());
        }

        shape.put_stroke(stroke);
        api.ShapeApply(shape);
    }

    onBorderSize (value) {
        const api = Common.EditorApi.get();
        const shape = new Asc.asc_CShapeProperty();
        const stroke = new Asc.asc_CStroke();

        const _borderColor = this.props.storeChartSettings.borderColor;

        if (value < 0.01) {
            stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
        } else {
            stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
            if (_borderColor == 'transparent')
                stroke.put_color(Common.Utils.ThemeColor.getRgbColor({color: '000000', effectId: 29}));
            else
                stroke.put_color(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(_borderColor)));
            stroke.put_width(value * 25.4 / 72.0);
        }

        shape.put_stroke(stroke);
        api.ShapeApply(shape);
        this.props.storeChartSettings.initBorderColor(this.props.storeFocusObjects.shapeObject.get_stroke()); // when select STROKE_NONE or change from STROKE_NONE to STROKE_COLOR
    }

    render () {
        return (
            <EditChart onRemoveChart={this.onRemoveChart}
                       onAlign={this.onAlign}
                       onReorder={this.onReorder}
                       onStyle={this.onStyle}
                       onType={this.onType}
                       onFillColor={this.onFillColor}
                       onBorderColor={this.onBorderColor}
                       onBorderSize={this.onBorderSize}
            />
        )
    }
}

export default inject("storeChartSettings", "storeFocusObjects")(observer(EditChartController));
