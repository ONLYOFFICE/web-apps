import React, { Component } from 'react';
import { Device } from '../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import { withTranslation } from "react-i18next";
import DropdownList from "../view/DropdownList";

class DropdownListController extends Component {
    constructor(props) {
        super(props);
        this.onChangeItemList = this.onChangeItemList.bind(this);
        
        this.state = {
            isOpen: false
        };

        Common.Notifications.on('openDropdownList', (textArr, addArr) => {
            this.initDropdownList(textArr, addArr);
        });
    }

    initDropdownList(textArr, addArr) {
        this.listItems = textArr.map((item, index) => {
            return {
                caption: item, 
                value: addArr ? addArr[index] : item
            };
        });

        this.setState({
            isOpen: true
        });
    }

    closeModal() {
        if(Device.isPhone) {
            f7.sheet.close('#dropdown-list-sheet', true);
        } else {
            f7.popover.close('#dropdown-list-popover', true);
        }

        this.setState({isOpen: false});
    }

    onChangeItemList(value) {
        const api = Common.EditorApi.get();

        this.closeModal();
        api.asc_insertInCell(value, Asc.c_oAscPopUpSelectorType.None, false);
    }

    render() {
        return (
            this.state.isOpen &&
                <DropdownList 
                    listItems={this.listItems}
                    onChangeItemList={this.onChangeItemList}
                    closeModal={this.closeModal}
                /> 
        );
    }
}

export default withTranslation()(DropdownListController);