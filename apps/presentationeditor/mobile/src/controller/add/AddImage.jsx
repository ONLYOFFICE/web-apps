import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {AddImage} from '../../view/add/AddImage';

class AddImageController extends Component {
    constructor (props) {
        super(props);
        this.onInsertByFile = this.onInsertByFile.bind(this);
        this.onInsertByUrl = this.onInsertByUrl.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onInsertByFile () {
        const api = Common.EditorApi.get();
        api.asc_addImage();
        this.closeModal();
    }

    onInsertByUrl (value) {
        const { t } = this.props;
        const _t = t("View.Add", { returnObjects: true });

        const _value = value.replace(/ /g, '');

        if (_value) {
            if ((/((^https?)|(^ftp)):\/\/.+/i.test(_value))) {
                this.closeModal();
                const api = Common.EditorApi.get();
                api.AddImageUrl(_value);
            } else {
                f7.dialog.alert(_t.txtNotUrl, _t.notcriticalErrorTitle);
            }
        } else {
            f7.dialog.alert(_t.textEmptyImgUrl, _t.notcriticalErrorTitle);
        }
    }

    render () {
        return (
            <AddImage onInsertByFile={this.onInsertByFile}
                      onInsertByUrl={this.onInsertByUrl}
            />
        )
    }
}

const AddImageWithTranslation = withTranslation()(AddImageController);

export {AddImageWithTranslation as AddImageController};