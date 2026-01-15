import React, { Component } from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import { withTranslation } from "react-i18next";
import FormImageList from "../../view/add/AddFormImage";

class AddFormImageController extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.addPictureFromLibrary = this.addPictureFromLibrary.bind(this);
        this.onInsertByUrl = this.onInsertByUrl.bind(this);
        this.deletePicture = this.deletePicture.bind(this);
        
        this.state = {
            isOpen: false,
            vertPos: null
        };

        Common.Notifications.on('openFormImageListPhone', obj => {
            this.openModalPhone(obj);
        });

        Common.Notifications.on('openFormImageListTablet', (obj, x, y, boxHeight, popoverHeight) => {
            this.openModalTablet(obj, x, y, boxHeight, popoverHeight);
        });
    }

    openModalTablet(obj, x, y, boxHeight, popoverHeight) {
        let vertPos = (boxHeight - y > 0) && (boxHeight - y >= popoverHeight) ? 'bottom' : 'top'

        this.setState({
            isOpen: true,
            vertPos: vertPos
        });
    }

    openModalPhone(obj) {
        this.setState({
            isOpen: true,
        });
    }

    closeModal() {
        if(Device.isPhone) {
            f7.popup.close('#dropdown-image-list-popup', true);
        } else {
            f7.popover.close('#dropdown-image-list-popover', true);
        }

        f7.views.current.router.back();
        this.setState({isOpen: false});
    }

    addPictureFromLibrary() {
        const api = Common.EditorApi.get();
        if (obj.pr && obj.pr.get_Lock) {
            let lock = obj.pr.get_Lock();
            if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock == Asc.c_oAscSdtLockType.ContentLocked)
                return;
        }
        api.asc_addImage(obj);
        this.closeModal();
    }

    onInsertByUrl (value) {
        const { t } = this.props;
        const _t = t("Add", { returnObjects: true });

        const _value = value.replace(/ /g, '');

        if (_value) {
            if ((/((^https?)|(^ftp)):\/\/.+/i.test(_value))) {
                const api = Common.EditorApi.get();
                api.AddImageUrl([_value]);
                this.closeModal();
            } else {
                f7.dialog.alert(_t.txtNotUrl, _t.notcriticalErrorTitle);
            }
        } else {
                f7.dialog.alert(_t.textEmptyImgUrl, _t.notcriticalErrorTitle);
        }
    }

    deletePicture() {
        const api = Common.EditorApi.get();
        if (api) {
            var props = api.asc_IsContentControl() ? api.asc_GetContentControlProperties() : null;
            if (props) {
                api.asc_ClearContentControl(props.get_InternalId());
                this.closeModal();
            }
        }
    }

    render() {
        return (
            this.state.isOpen &&
                <FormImageList 
                    closeModal={this.closeModal}
                    addPictureFromLibrary={this.addPictureFromLibrary}
                    onInsertByUrl={this.onInsertByUrl}
                    deletePicture={this.deletePicture}
                    vertPos={this.state.vertPos}
                /> 
        );
    }
}

export default withTranslation()(AddFormImageController);