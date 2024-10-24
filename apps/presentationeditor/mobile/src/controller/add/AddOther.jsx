import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {observer, inject} from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {AddOther} from '../../view/add/AddOther';

class AddOtherController extends Component {
    constructor (props) {
        super(props);

        this.onStyleClick = this.onStyleClick.bind(this);
        this.onGetTableStylesPreviews = this.onGetTableStylesPreviews.bind(this);
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
        const _t = t("View.Add", { returnObjects: true });

        let picker;

        const dialog = f7.dialog.create({
            title: _t.textTableSize,
            text: '',
            content:
                '<div class="content-block">' +
                '<div class="row row-picker">' +
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
                    text: _t.textOk,
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

    onGetTableStylesPreviews = () => {
        if(this.props.storeTableSettings.arrayStylesDefault.length == 0) {
            const api = Common.EditorApi.get();
            setTimeout(() => this.props.storeTableSettings.setStyles(api.asc_getTableStylesPreviews(true), 'default'), 1);
        }
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
                      hideAddComment={this.hideAddComment}
                      onGetTableStylesPreviews = {this.onGetTableStylesPreviews}
                      onCloseLinkSettings={this.props.onCloseLinkSettings}
            />
        )
    }
}

const AddOtherWithTranslation = inject("storeTableSettings")(withTranslation()(AddOtherController));

export {AddOtherWithTranslation as AddOtherController};