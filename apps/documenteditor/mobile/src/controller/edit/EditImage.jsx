import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditImage } from '../../view/edit/EditImage'

class EditImageController extends Component {
    constructor (props) {
        super(props);
        this.onWrapType = this.onWrapType.bind(this);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.onReplaceByFile = this.onReplaceByFile.bind(this);
        this.onReplaceByUrl = this.onReplaceByUrl.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    }

    onDefaulSize () {
        const api = Common.EditorApi.get();
        if (api) {
            const imgSize = api.get_OriginalSizeImage();
            const properties = new Asc.asc_CImgProperty();
            properties.put_Width(imgSize.get_ImageWidth());
            properties.put_Height(imgSize.get_ImageHeight());
            properties.put_ResetCrop(true);
            properties.put_Rot(0);
            api.ImgApply(properties);
        }
    }

    onRemoveImage () {
        const api = Common.EditorApi.get();
        if (api) {
            api.asc_Remove();
            this.closeModal()
        }
    }

    onWrapType (type) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CImgProperty();
            const sdkType = this.props.storeImageSettings.transformToSdkWrapType(type);
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

    onReplaceByFile () {
        const api = Common.EditorApi.get();
        if (api) {
            api.ChangeImageFromFile();
            this.closeModal();
        }
    }

    onReplaceByUrl (value) {
        const api = Common.EditorApi.get();
        if (api) {
            const image = new Asc.asc_CImgProperty();
            image.put_ImageUrl(value);
            api.ImgApply(image);
            this.closeModal();
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
            <EditImage onDefaulSize={this.onDefaulSize}
                       onRemoveImage={this.onRemoveImage}
                       onWrapType={this.onWrapType}
                       onAlign={this.onAlign}
                       onMoveText={this.onMoveText}
                       onOverlap={this.onOverlap}
                       onWrapDistance={this.onWrapDistance}
                       onReplaceByFile={this.onReplaceByFile}
                       onReplaceByUrl={this.onReplaceByUrl}
                       onReorder={this.onReorder}
            />
        )
    }
}

export default inject("storeImageSettings")(observer(EditImageController));