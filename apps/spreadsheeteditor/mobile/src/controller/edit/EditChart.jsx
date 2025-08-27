import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditChart } from '../../view/edit/EditChart';

class EditChartController extends Component {
    constructor (props) {
        super(props);
        this.onRemoveChart = this.onRemoveChart.bind(this);
        this.onType = this.onType.bind(this);
        this.onStyle = this.onStyle.bind(this);
        this.onBorderColor = this.onBorderColor.bind(this);
        this.onBorderSize = this.onBorderSize.bind(this);
        this.onVerAxisMinValue = this.onVerAxisMinValue.bind(this);
        this.onVerAxisMaxValue = this.onVerAxisMaxValue.bind(this);
        this.onVerAxisCrossType = this.onVerAxisCrossType.bind(this);
        this.onVerAxisCrossValue = this.onVerAxisCrossValue.bind(this);
        this.onVerAxisDisplayUnits = this.onVerAxisDisplayUnits.bind(this);
        this.onVerAxisReverse = this.onVerAxisReverse.bind(this);
        this.onVerAxisTickMajor = this.onVerAxisTickMajor.bind(this);
        this.onVerAxisTickMinor = this.onVerAxisTickMinor.bind(this);
        this.onVerAxisLabelPos = this.onVerAxisLabelPos.bind(this);
        this.onHorAxisCrossType = this.onHorAxisCrossType.bind(this);
        this.onHorAxisCrossValue = this.onHorAxisCrossValue.bind(this);
        this.onHorAxisPos = this.onHorAxisPos.bind(this);
        this.onHorAxisReverse = this.onHorAxisReverse.bind(this);
        this.onHorAxisTickMajor = this.onHorAxisTickMajor.bind(this);
        this.onHorAxisTickMinor = this.onHorAxisTickMinor.bind(this);
        this.onHorAxisLabelPos = this.onHorAxisLabelPos.bind(this);

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

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    };

    onRemoveChart() {
        const api = Common.EditorApi.get();
        api.asc_Remove();
        this.closeModal();
    }

    onStyle(type) {
        const api = Common.EditorApi.get();
        let image = new Asc.asc_CImgProperty(),
            chart = this.props.storeFocusObjects.chartObject.get_ChartProperties();

        chart.putStyle(type);
        image.put_ChartProperties(chart);

        api.asc_setGraphicObjectProps(image);

    }

    onType(type) {
        const api = Common.EditorApi.get();
        let chart = this.props.storeFocusObjects.chartObject.get_ChartProperties();

        chart.changeType(type);

        // Force update styles
        this.props.storeChartSettings.updateChartStyles(api.asc_getChartPreviews(chart.getType()));

        // me.updateAxisProps(type);
    }

    onFillColor(color) {
        const api = Common.EditorApi.get();
        let image = new Asc.asc_CImgProperty(),
            shape = new Asc.asc_CShapeProperty(),
            fill = new Asc.asc_CShapeFill();

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

        api.asc_setGraphicObjectProps(image);
    }

    onBorderColor(color) {
        const api = Common.EditorApi.get();
        const currentShape = this.props.storeFocusObjects.shapeObject.get_ShapeProperties();
        let image = new Asc.asc_CImgProperty(),
            shape = new Asc.asc_CShapeProperty(),
            stroke = new Asc.asc_CStroke();

        if(currentShape && currentShape.get_stroke().get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {

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

            api.asc_setGraphicObjectProps(image);
        }
    }

    onBorderSize(value) {
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

        api.asc_setGraphicObjectProps(image);
        this.props.storeChartSettings.initBorderColor(this.props.storeFocusObjects.shapeObject.get_ShapeProperties()); // when select STROKE_NONE or change from STROKE_NONE to STROKE_COLOR
    }

    onReorder(type) {
        const api = Common.EditorApi.get();
        let ascType;

        if (type == 'all-up') {
            ascType = Asc.c_oAscDrawingLayerType.BringToFront;
        } else if (type == 'all-down') {
            ascType = Asc.c_oAscDrawingLayerType.SendToBack;
        } else if (type == 'move-up') {
            ascType = Asc.c_oAscDrawingLayerType.BringForward;
        } else {
            ascType = Asc.c_oAscDrawingLayerType.SendBackward;
        }

        api.asc_setSelectedDrawingObjectLayer(ascType);
    }

    setLayoutProperty(propertyMethod, value) {
        const api = Common.EditorApi.get();
        let chartObject = api.asc_getChartSettings();

        if (chartObject && value) {

            chartObject[propertyMethod](+value);

            if ("putDataLabelsPos" == propertyMethod && +value != 0) {
                chartObject["putShowVal"](true);
            }

            api.asc_applyChartSettings(chartObject);
        }
    }

    getVerticalAxisProp() {
        const api = Common.EditorApi.get();
        let chartObject = api.asc_getChartSettings(),
            verAxisProps = chartObject.getVertAxisProps();

        return (verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? verAxisProps : chartObject.getHorAxisProps();
    }

    setVerticalAxisProp(axisProps) {
        const api = Common.EditorApi.get();
        let chartObject = api.asc_getChartSettings(),
            verAxisProps = chartObject.getVertAxisProps();

        if (chartObject) {
            chartObject[(verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? 'putVertAxisProps' : 'putHorAxisProps'](axisProps);
            api.asc_applyChartSettings(chartObject);
        }
    }

    onVerAxisMinValue(value) {
        let axisProps = this.getVerticalAxisProp(),
            axisRule = !value ? Asc.c_oAscValAxisRule.auto : Asc.c_oAscValAxisRule.fixed;

        axisProps.putMinValRule(axisRule);

        if (axisRule == Asc.c_oAscValAxisRule.fixed) {
            axisProps.putMinVal(+value);
        }

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisMaxValue(value) {
        let axisProps = this.getVerticalAxisProp(),
            axisRule = !value ? Asc.c_oAscValAxisRule.auto : Asc.c_oAscValAxisRule.fixed;

        axisProps.putMaxValRule(axisRule);

        if (axisRule == Asc.c_oAscValAxisRule.fixed) {
            axisProps.putMaxVal(+value);
        }

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisCrossType(value) {
        let axisProps = this.getVerticalAxisProp();

        axisProps.putCrossesRule(+value);

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisCrossValue(value) {
        let axisProps = this.getVerticalAxisProp();

        axisProps.putCrossesRule(Asc.c_oAscCrossesRule.value);
        axisProps.putCrosses(+value);

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisDisplayUnits(value) {
        let axisProps = this.getVerticalAxisProp();

        axisProps.putDispUnitsRule(+value);

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisReverse(value) {
        let axisProps = this.getVerticalAxisProp();

        axisProps.putInvertValOrder(value);

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisTickMajor(value) {
        let axisProps = this.getVerticalAxisProp();

        axisProps.putMajorTickMark(+value);

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisTickMinor(value) {
        let axisProps = this.getVerticalAxisProp();

        axisProps.putMinorTickMark(+value);

        this.setVerticalAxisProp(axisProps);
    }

    onVerAxisLabelPos(value) {
        let axisProps = this.getVerticalAxisProp();

        axisProps.putTickLabelsPos(+value);

        this.setVerticalAxisProp(axisProps);
    }

    // Horizontal

    getHorizontalAxisProp() {
        const api = Common.EditorApi.get();
        let chartObject = api.asc_getChartSettings(),
            verHorProps = chartObject.getHorAxisProps();

        return (verHorProps.getAxisType() == Asc.c_oAscAxisType.val) ? chartObject.getVertAxisProps() : verHorProps;
    }

    setHorizontalAxisProp(axisProps) {
        const api = Common.EditorApi.get();
        let chartObject = api.asc_getChartSettings(),
            verAxisProps = chartObject.getHorAxisProps();

        if (chartObject) {
            chartObject[(verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? 'putVertAxisProps' : 'putHorAxisProps'](axisProps);
            api.asc_applyChartSettings(chartObject);
        }
    }

    onHorAxisCrossType(value) {
        let axisProps = this.getHorizontalAxisProp();

        axisProps.putCrossesRule(+value);

        this.setHorizontalAxisProp(axisProps);
    }

    onHorAxisCrossValue(value) {
        let axisProps = this.getHorizontalAxisProp();

        axisProps.putCrossesRule(Asc.c_oAscCrossesRule.value);
        axisProps.putCrosses(+value);

        this.setHorizontalAxisProp(axisProps);
    }

    onHorAxisPos(value) {
        let axisProps = this.getHorizontalAxisProp();

        axisProps.putLabelsPosition(+value);

        this.setHorizontalAxisProp(axisProps);
    }

    onHorAxisReverse(value) {
        let axisProps = this.getHorizontalAxisProp();

        axisProps.putInvertCatOrder(value);

        this.setHorizontalAxisProp(axisProps);
    }

    onHorAxisTickMajor(value) {
        let axisProps = this.getHorizontalAxisProp();

        axisProps.putMajorTickMark(+value);

        this.setHorizontalAxisProp(axisProps);
    }

    onHorAxisTickMinor(value) {
        let axisProps = this.getHorizontalAxisProp();

        axisProps.putMinorTickMark(+value);

        this.setHorizontalAxisProp(axisProps);
    }

    onHorAxisLabelPos(value) {
        let axisProps = this.getHorizontalAxisProp();

        axisProps.putTickLabelsPos(+value);

        this.setHorizontalAxisProp(axisProps);
    }

    render () {
        return (
            <EditChart 
                onReorder={this.onReorder}
                onBorderSize={this.onBorderSize}
                onBorderColor={this.onBorderColor}
                onFillColor={this.onFillColor}
                onType={this.onType}
                onStyle={this.onStyle}
                onRemoveChart={this.onRemoveChart}
                setLayoutProperty={this.setLayoutProperty}
                onVerAxisMinValue={this.onVerAxisMinValue}
                onVerAxisMaxValue={this.onVerAxisMaxValue}
                onVerAxisCrossType={this.onVerAxisCrossType}
                onVerAxisCrossValue={this.onVerAxisCrossValue}
                onVerAxisDisplayUnits={this.onVerAxisDisplayUnits}
                onVerAxisReverse={this.onVerAxisReverse}
                onVerAxisTickMajor={this.onVerAxisTickMajor}
                onVerAxisTickMinor={this.onVerAxisTickMinor}
                onVerAxisLabelPos={this.onVerAxisLabelPos}
                getHorizontalAxisProp={this.getHorizontalAxisProp}
                setHorizontalAxisProp={this.setHorizontalAxisProp}
                onHorAxisCrossType={this.onHorAxisCrossType}
                onHorAxisCrossValue={this.onHorAxisCrossValue}
                onHorAxisPos={this.onHorAxisPos}
                onHorAxisReverse={this.onHorAxisReverse}
                onHorAxisTickMajor={this.onHorAxisTickMajor}
                onHorAxisTickMinor={this.onHorAxisTickMinor}
                onHorAxisLabelPos={this.onHorAxisLabelPos}
            />
        )
    }
}

export default inject("storeChartSettings", "storeFocusObjects")(observer(EditChartController));