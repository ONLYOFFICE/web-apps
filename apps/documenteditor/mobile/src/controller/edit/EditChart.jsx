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
        this.onWrapType = this.onWrapType.bind(this);
        this.onType = this.onType.bind(this);
        this.onStyle = this.onStyle.bind(this);
        this.onBorderColor = this.onBorderColor.bind(this);
        this.onBorderSize = this.onBorderSize.bind(this);

        const type = props.storeFocusObjects.chartObject.get_ChartProperties().getType();
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
        if (api) {
            api.asc_Remove();
            if ( Device.phone ) {
                f7.sheet.close('#edit-sheet', true);
            } else {
                f7.popover.close('#edit-popover');
            }
        }
    }

    onWrapType (type) {
        const api = Common.EditorApi.get();
        if (api) {
            const sdkType = this.props.storeChartSettings.transformToSdkWrapType(type);
            const properties = new Asc.asc_CImgProperty();
            properties.put_WrappingStyle(sdkType);
            api.ImgApply(properties);
        }
    }

    onAlign (type) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CImgProperty();
            properties.put_PositionH(new Asc.CImagePositionH());
            properties.get_PositionH().put_UseAlign(true);
            properties.get_PositionH().put_Align(type);
            properties.get_PositionH().put_RelativeFrom(Asc.c_oAscRelativeFromH.Page);
            api.ImgApply(properties);
        }
    }

    onMoveText (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CImgProperty();
            properties.put_PositionV(new Asc.CImagePositionV());
            properties.get_PositionV().put_UseAlign(true);
            properties.get_PositionV().put_RelativeFrom(value ? Asc.c_oAscRelativeFromV.Paragraph : Asc.c_oAscRelativeFromV.Page);
            api.ImgApply(properties);
        }
    }

    onOverlap (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CImgProperty();
            properties.put_AllowOverlap(value);
            api.ImgApply(properties);
        }
    }

    onWrapDistance (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CImgProperty();
            const paddings = new Asc.asc_CPaddings();
            const distance = Common.Utils.Metric.fnRecalcToMM(parseInt(value));
            paddings.put_Top(distance);
            paddings.put_Right(distance);
            paddings.put_Bottom(distance);
            paddings.put_Left(distance);
            properties.put_Paddings(paddings);
            api.ImgApply(properties);
        }
    }

    onReorder (type) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CImgProperty();
            if ('all-up' == type) {
                properties.put_ChangeLevel(Asc.c_oAscChangeLevel.BringToFront);
            } else if ('all-down' == type) {
                properties.put_ChangeLevel(Asc.c_oAscChangeLevel.SendToBack);
            } else if ('move-up' == type) {
                properties.put_ChangeLevel(Asc.c_oAscChangeLevel.BringForward);
            } else if ('move-down' == type) {
                properties.put_ChangeLevel(Asc.c_oAscChangeLevel.BringBackward);
            }
            api.ImgApply(properties);
        }
    }

    onStyle (style) {
        const api = Common.EditorApi.get();
        const image = new Asc.asc_CImgProperty();
        const chart = this.props.storeFocusObjects.chartObject.get_ChartProperties();
        chart.putStyle(style);
        image.put_ChartProperties(chart);
        api.ImgApply(image);
    }

    onType (type) {
        const api = Common.EditorApi.get();
        const chart = this.props.storeFocusObjects.chartObject.get_ChartProperties();
        chart.changeType(type);
        // Force update styles
        this.props.storeChartSettings.updateChartStyles(api.asc_getChartPreviews(chart.getType()));
    }

    onFillColor (color) {
        const api = Common.EditorApi.get();
        const image = new Asc.asc_CImgProperty();
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
        image.put_ShapeProperties(shape);
        api.ImgApply(image);
    }

    onBorderColor (color) {
        const api = Common.EditorApi.get();
        const currentShape = this.props.storeFocusObjects.shapeObject.get_ShapeProperties();
        const image = new Asc.asc_CImgProperty();
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
        image.put_ShapeProperties(shape);
        api.ImgApply(image);
    }

    onBorderSize (value) {
        const api = Common.EditorApi.get();

        const image = new Asc.asc_CImgProperty();
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
        image.put_ShapeProperties(shape);

        api.ImgApply(image);
        this.props.storeChartSettings.initBorderColor(this.props.storeFocusObjects.shapeObject.get_ShapeProperties().get_stroke()); // when select STROKE_NONE or change from STROKE_NONE to STROKE_COLOR
    }

    render () {
        return (
            <EditChart onRemoveChart={this.onRemoveChart}
                       onWrapType={this.onWrapType}
                       onAlign={this.onAlign}
                       onMoveText={this.onMoveText}
                       onOverlap={this.onOverlap}
                       onWrapDistance={this.onWrapDistance}
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
