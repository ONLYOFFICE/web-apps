import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditImage } from '../../view/edit/EditImage';

class EditImageController extends Component {
    constructor (props) {
        super(props);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.onReplaceByFile = this.onReplaceByFile.bind(this);
        this.onReplaceByUrl = this.onReplaceByUrl.bind(this);
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

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    };

    onDefaultSize() {
        const api = Common.EditorApi.get();
        let imgsize = api.asc_getCropOriginalImageSize(),
            properties = new Asc.asc_CImgProperty();

        properties.put_Width(imgsize.get_ImageWidth());
        properties.put_Height(imgsize.get_ImageHeight());
        properties.put_Rot(0);
        api.ImgApply(properties);
    }

    onRemoveImage() {
        const api = Common.EditorApi.get();
        api.asc_Remove();
        this.closeModal();
    }

    onReplaceByFile() {
        const api = Common.EditorApi.get();
        api.ChangeImageFromFile();
        this.closeModal();
    }

    onReplaceByUrl(value) {
        const api = Common.EditorApi.get();
        const image = new Asc.asc_CImgProperty();
        image.put_ImageUrl(value);
        api.ImgApply(image);
        this.closeModal();
    }


    render () {
        return (
            <EditImage
                onReorder={this.onReorder}
                onAlign={this.onAlign}
                onRemoveImage={this.onRemoveImage}
                onReplaceByFile={this.onReplaceByFile}
                onDefaultSize={this.onDefaultSize}
                onReplaceByUrl={this.onReplaceByUrl}
            />
        )
    }
}

export default EditImageController;