import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {AddOther} from '../../view/add/AddOther';

class AddOtherController extends Component {
    constructor (props) {
        super(props);
        this.onStyleClick = this.onStyleClick.bind(this);
        this.initStyleTable = this.initStyleTable.bind(this);

        this.initTable = false;
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    initStyleTable () {
        if (!this.initTable) {
            const api = Common.EditorApi.get();
            api.asc_GetDefaultTableStyles();
            this.initTable = true;
        }
    }

    onStyleClick (type) {
        const api = Common.EditorApi.get();

        this.closeModal();

        const { t } = this.props;
        const _t = t("View.Add", { returnObjects: true });

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

                        api.put_Table(parseInt(size[0]), parseInt(size[1]), undefined, type.toString());
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

    hideAddComment () {
        const api = Common.EditorApi.get();
        const stack = api.getSelectedElements();
        let isText = false,
            isChart = false;

        stack.forEach((item) => {
            const objectType = item.get_ObjectType();
            if (objectType === Asc.c_oAscTypeSelectElement.Paragraph) {
                isText = true;
            } else if (objectType === Asc.c_oAscTypeSelectElement.Chart) {
                isChart = true;
            }
        });
        if (stack.length > 0) {
            const topObject = stack[stack.length - 1];
            const topObjectValue = topObject.get_ObjectValue();
            let objectLocked = typeof topObjectValue.get_Locked === 'function' ? topObjectValue.get_Locked() : false;
            !objectLocked && (objectLocked = typeof topObjectValue.get_LockDelete === 'function' ? topObjectValue.get_LockDelete() : false);
            if (!objectLocked) {
                return ((isText && isChart) || api.can_AddQuotedComment() === false);
            }
        }
        return true;
    }

    render () {
        return (
            <AddOther closeModal={this.closeModal}
                      onStyleClick={this.onStyleClick}
                      initStyleTable={this.initStyleTable}
                      hideAddComment={this.hideAddComment}
            />
        )
    }
}

const AddOtherWithTranslation = withTranslation()(AddOtherController);

export {AddOtherWithTranslation as AddOtherController};