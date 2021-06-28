import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import AddTable from '../../view/add/AddTable';

class AddTableController extends Component {
    constructor (props) {
        super(props);
        this.onStyleClick = this.onStyleClick.bind(this);

        const api = Common.EditorApi.get();
        api.asc_GetDefaultTableStyles();
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onStyleClick (type) {
        const api = Common.EditorApi.get();

        this.closeModal();

        const { t } = this.props;
        const _t = t("Add", { returnObjects: true });

        let picker;

        const dialog = f7.dialog.create({
            title: _t.textTableSize,
            text: '',
            content:
                '<div class="content-block">' +
                '<div class="row">' +
                '<div class="col-50">' + _t.textColumns + '</div>' +
                '<div class="col-50">' + _t.textRows + '</div>' +
                '</div>' +
                '<div id="picker-table-size"></div>' +
                '</div>',
            buttons: [
                {
                    text: _t.textCancel
                },
                {
                    text: 'OK',
                    bold: true,
                    onClick: function () {
                        const size = picker.value;

                        api.put_Table(parseInt(size[0]), parseInt(size[1]), type.toString());
                    }
                }
            ],
            on: {
                open: () => {
                    picker = f7.picker.create({
                        containerEl: document.getElementById('picker-table-size'),
                        cols: [
                            {
                                textAlign: 'center',
                                width: '100%',
                                values: [1,2,3,4,5,6,7,8,9,10]
                            },
                            {
                                textAlign: 'center',
                                width: '100%',
                                values: [1,2,3,4,5,6,7,8,9,10]
                            }
                        ],
                        toolbar: false,
                        rotateEffect: true,
                        value: [3, 3]
                    });
                }
            }
        }).open();
    }

    render () {
        return (
            <AddTable onStyleClick={this.onStyleClick}
            />
        )
    }
}

const AddTableWithTranslation = withTranslation()(AddTableController);

export {AddTableWithTranslation as AddTableController};