import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditChart } from '../../view/edit/EditChart'

class EditChartController extends Component {
    constructor (props) {
        super(props);
        this.onWrapType = this.onWrapType.bind(this);
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

    render () {
        return (
            <EditChart onRemoveChart={this.onRemoveChart}
                       onWrapType={this.onWrapType}
                       onAlign={this.onAlign}
                       onMoveText={this.onMoveText}
                       onOverlap={this.onOverlap}
                       onWrapDistance={this.onWrapDistance}
                       onReorder={this.onReorder}
            />
        )
    }
}

export default inject("storeChartSettings")(observer(EditChartController));