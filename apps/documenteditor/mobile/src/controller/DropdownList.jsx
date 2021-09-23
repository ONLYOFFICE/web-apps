import React, { Component } from 'react';
import { Device } from '../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import DropdownList from "../view/DropdownList";

class DropdownListController extends Component {
    constructor(props) {
        super(props);
        this.onChangeItemList = this.onChangeItemList.bind(this);
        
        this.state = {
            isOpen: false
        };

        Common.Notifications.on('openDropdownList', (obj, x, y) => {
            this.initDropdownList(obj, x, y);
        });
    }

    initDropdownList(obj, x, y) {
        let type = obj.type;

        this.left = x;
        this.top = y;
        this.props = obj.pr;
        this.specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? this.props.get_ComboBoxPr() : this.props.get_DropDownListPr();
        this.isForm = !!this.props.get_FormPr();
        this.listItems = [];

        this.initListItems();

        this.setState({
            isOpen: true
        });
    }

    initListItems() {
        let count = this.specProps.get_ItemsCount();

        for (let i = 0; i < count; i++) {
            if(this.specProps.get_ItemValue(i) || !this.isForm) {
                this.listItems.push({
                    caption: this.specProps.get_ItemDisplayText(i), 
                    value: this.specProps.get_ItemValue(i)
                });
            }
        }
    }

    closeModal() {
        if(Device.isPhone) {
            f7.popup.close('#dropdown-list-popup', true);
        } else {
            f7.popover.close('#dropdown-list-popover', true);
        }

        this.setState({isOpen: false});
    }

    onChangeItemList(value) {
        const api = Common.EditorApi.get();
        // const internalId = this.props.get_InternalId;

        if(value !== -1) {
            this.closeModal()
            api.asc_SelectContentControlListItem(value);
        }
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

export default DropdownListController;