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

        Common.Notifications.on('openDropdownList', obj => {
            this.initDropdownList(obj);
        });
    }

    initDropdownList(obj) {
        let type = obj.type;

        this.propsObj = obj.pr;
        this.specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? this.propsObj.get_ComboBoxPr() : this.propsObj.get_DropDownListPr();
        this.isForm = !!this.propsObj.get_FormPr();
        this.listItems = [];

        this.initListItems();

        this.setState({
            isOpen: true
        });
    }

    initListItems() {
        const { t } = this.props;
        const count = this.specProps.get_ItemsCount();

        if(this.isForm) {
            let text = this.propsObj.get_PlaceholderText();

            this.listItems.push({
                caption: text.trim() !== '' ? text : t('Edit.textEmpty'),
                value: ''
            });
        }

        for (let i = 0; i < count; i++) {
            if(this.specProps.get_ItemValue(i) || !this.isForm) {
                this.listItems.push({
                    caption: this.specProps.get_ItemDisplayText(i), 
                    value: this.specProps.get_ItemValue(i)
                });
            }
        }

        if (!this.isForm && this.listItems.length < 1) {
            this.listItems.push({
                caption: t('Edit.textEmpty'),
                value: -1
            });
        }
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
        // const internalId = this.propsObj.get_InternalId;

        if(value !== -1) {
            this.closeModal();
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

export default withTranslation()(DropdownListController);