import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditShape } from '../../view/edit/EditShape'

class EditShapeController extends Component {
    constructor (props) {
        super(props);
        this.onWrapType = this.onWrapType.bind(this);
        this.onBorderSize = this.onBorderSize.bind(this);
        this.onBorderColor = this.onBorderColor.bind(this);

        this.props.storeShapeSettings.setFillColor(undefined);
        this.props.storeShapeSettings.setBorderColor(undefined);
    }

    onRemoveShape () {
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
            const sdkType = this.props.storeShapeSettings.transformToSdkWrapType(type);
            const properties = new Asc.asc_CImgProperty();
            properties.put_WrappingStyle(sdkType);
            api.ImgApply(properties);
        }
    }

    onShapeAlign (type) {
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

    onReplace (type) {
        const api = Common.EditorApi.get();
        if (api) {
            api.ChangeShapeType(type);
        }
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

    onBorderSize (value) {
        const api = Common.EditorApi.get();

        const image = new Asc.asc_CImgProperty();
        const shape = new Asc.asc_CShapeProperty();
        const stroke = new Asc.asc_CStroke();

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
        image.put_ShapeProperties(shape);

        api.ImgApply(image);
        this.props.storeShapeSettings.initBorderColorView(this.props.storeFocusObjects.shapeObject); // when select STROKE_NONE or change from STROKE_NONE to STROKE_COLOR
    }

    onBorderColor (color) {
        const api = Common.EditorApi.get();
        const currentShape = this.props.storeFocusObjects.shapeObject.get_ShapeProperties();
        if (currentShape && currentShape.get_stroke().get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {
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
    }

    onOpacity (value) {
        const api = Common.EditorApi.get();
        const properties = new Asc.asc_CImgProperty();
        const fill = new Asc.asc_CShapeFill();
        const shape = new Asc.asc_CShapeProperty();
        fill.put_transparent(parseInt(value * 2.55));
        shape.put_fill(fill);
        properties.put_ShapeProperties(shape);
        api.ImgApply(properties);
    }

    render () {
        return (
            <EditShape onRemoveShape={this.onRemoveShape}
                       onWrapType={this.onWrapType}
                       onShapeAlign={this.onShapeAlign}
                       onMoveText={this.onMoveText}
                       onOverlap={this.onOverlap}
                       onWrapDistance={this.onWrapDistance}
                       onReorder={this.onReorder}
                       onReplace={this.onReplace}
                       onFillColor={this.onFillColor}
                       onBorderSize={this.onBorderSize}
                       onBorderColor={this.onBorderColor}
                       onOpacity={this.onOpacity}
            />
        )
    }
}

export default inject("storeShapeSettings", "storeFocusObjects")(observer(EditShapeController));