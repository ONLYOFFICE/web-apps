import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditShape } from '../../view/edit/EditShape';

class EditShapeController extends Component {
    constructor (props) {
        super(props);
        this.onRemoveShape = this.onRemoveShape.bind(this);
        this.onBorderSize = this.onBorderSize.bind(this);
        this.onBorderColor = this.onBorderColor.bind(this);

        this.props.storeShapeSettings.setFillColor(undefined);
        this.props.storeShapeSettings.setBorderColor(undefined);
    }

    onReplace(type) {
        const api = Common.EditorApi.get();
        api.asc_changeShapeType(type);
    }

    onReorder(type) {
        const api = Common.EditorApi.get();
        let ascType;

        switch(type) {
            case 'all-up':
                ascType = Asc.c_oAscDrawingLayerType.BringToFront;
                break;
            case 'all-down':
                ascType = Asc.c_oAscDrawingLayerType.SendToBack;
                break;
            case 'move-up':
                ascType = Asc.c_oAscDrawingLayerType.BringForward;
                break;
            case 'move-down':
                ascType = Asc.c_oAscDrawingLayerType.SendBackward;
                break;
        }

        api.asc_setSelectedDrawingObjectLayer(ascType);
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    };

    onRemoveShape() {
        const api = Common.EditorApi.get();
        api.asc_Remove();
        this.closeModal();
    }

    onFillColor(color) {
        const api = Common.EditorApi.get();

        let shape = new Asc.asc_CShapeProperty(),
            image = new Asc.asc_CImgProperty(),
            fill = new Asc.asc_CShapeFill();

        if (color == 'transparent') {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
            fill.put_fill(null);
        } else {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
            fill.put_fill(new Asc.asc_CFillSolid());
            fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(color));
        }

        shape.asc_putFill(fill);
        image.asc_putShapeProperties(shape);

        api.asc_setGraphicObjectProps(image);
    }

    onBorderColor(color) {
        const api = Common.EditorApi.get();
        const _shapeObject = this.props.storeFocusObjects.shapeObject.get_ShapeProperties();

        if (_shapeObject && _shapeObject.get_stroke().get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {
            let shape = new Asc.asc_CShapeProperty(),
                image = new Asc.asc_CImgProperty(),
                stroke = new Asc.asc_CStroke();

            if (_shapeObject.get_stroke().get_width() < 0.01) {
                stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
            } else {
                stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                stroke.put_color(Common.Utils.ThemeColor.getRgbColor(color));
                stroke.put_width(_shapeObject.get_stroke().get_width());
                stroke.asc_putPrstDash(_shapeObject.get_stroke().asc_getPrstDash());
            }

            shape.put_stroke(stroke);
            image.asc_putShapeProperties(shape);

            api.asc_setGraphicObjectProps(image);
        }
    }

    onBorderSize(value) {
        const api = Common.EditorApi.get();
        const shape = new Asc.asc_CShapeProperty();
        const stroke = new Asc.asc_CStroke();
        const image = new Asc.asc_CImgProperty();

        const _borderColor = this.props.storeShapeSettings.borderColorView;

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
        image.asc_putShapeProperties(shape);

        api.asc_setGraphicObjectProps(image);

        this.props.storeShapeSettings.initBorderColorView(this.props.storeFocusObjects.shapeObject.get_ShapeProperties());
    }

    onOpacity(value) {
        const api = Common.EditorApi.get();
        
        let fill = new Asc.asc_CShapeFill(),
            properties = new Asc.asc_CImgProperty(),
            shape = new Asc.asc_CShapeProperty();

        fill.asc_putTransparent(parseInt(value * 2.55));
        shape.asc_putFill(fill);
        properties.put_ShapeProperties(shape);

        api.asc_setGraphicObjectProps(properties);
    }


    render () {
        return (
            <EditShape
                onReplace={this.onReplace}
                onReorder={this.onReorder}
                onRemoveShape={this.onRemoveShape}
                onFillColor={this.onFillColor}
                onBorderColor={this.onBorderColor}
                onBorderSize={this.onBorderSize}
                onOpacity={this.onOpacity}
            />
        )
    }
}

export default inject("storeShapeSettings", "storeFocusObjects")(observer(EditShapeController));