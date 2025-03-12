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

    onDefaultSize() {
        const api = Common.EditorApi.get();
        let imgsize = api.asc_getCropOriginalImageSize(),
            properties = new Asc.asc_CImgProperty();

        properties.put_Width(imgsize.get_ImageWidth());
        properties.put_Height(imgsize.get_ImageHeight());
        properties.put_Rot(0);
        api.asc_setGraphicObjectProps(properties);
    }

    onRemoveImage() {
        const api = Common.EditorApi.get();
        api.asc_Remove();
        this.closeModal();
    }

    onReplaceByFile() {
        const api = Common.EditorApi.get();
        api.asc_changeImageFromFile();
        this.closeModal();
    }

    onReplaceByUrl(value) {
        const api = Common.EditorApi.get();
        const image = new Asc.asc_CImgProperty();
        image.asc_putImageUrl(value);
        api.asc_setGraphicObjectProps(image);
        this.closeModal();
    }


    render () {
        return (
            <EditImage
                onReorder={this.onReorder}
                onRemoveImage={this.onRemoveImage}
                onReplaceByFile={this.onReplaceByFile}
                onDefaultSize={this.onDefaultSize}
                onReplaceByUrl={this.onReplaceByUrl}
            />
        )
    }
}

export default EditImageController;