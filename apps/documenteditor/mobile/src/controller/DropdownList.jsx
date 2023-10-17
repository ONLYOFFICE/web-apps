import React, { Component } from 'react';
import { Device } from '../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import { withTranslation } from "react-i18next";
import DropdownList from "../view/DropdownList";

class DropdownListController extends Component {
    constructor(props) {
        super(props);
        this.onChangeItemList = this.onChangeItemList.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        
        this.state = {
            isOpen: false
        };

        Common.Notifications.on('openDropdownList', obj => {
            this.initDropdownList(obj);
        });
    }

    initDropdownList(obj) {
        this.type = obj.type;

        this.propsObj = obj.pr;
        this.internalId = this.propsObj.get_InternalId();
        this.isComboBox = this.type === Asc.c_oAscContentControlSpecificType.ComboBox;
        this.specProps = this.isComboBox ? this.propsObj.get_ComboBoxPr() : this.propsObj.get_DropDownListPr();
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

        f7.views.current.router.back();
        this.setState({isOpen: false});
    }

    onChangeItemList(value) {
        const api = Common.EditorApi.get();
        // const internalId = this.propsObj.get_InternalId();

        if(value !== -1) {
            this.closeModal();
            api.asc_SelectContentControlListItem(value, this.internalId);
        }
    }

    onAddItem(value) {
        const api = Common.EditorApi.get();
        const props = this.propsObj || new AscCommon.CContentControlPr();
        const specProps = this.specProps || new AscCommon.CSdtComboBoxPr();
        specProps.clear();

        this.listItems.push({caption: value, value});
        this.listItems.forEach(item => {
            specProps.add_Item(item.caption, item.value);
        });
        
        (this.type === Asc.c_oAscContentControlSpecificType.ComboBox) ? props.put_ComboBoxPr(specProps) : props.put_DropDownListPr(specProps);
        api.asc_SetContentControlProperties(props, this.internalId);

        f7.views.current.router.back();
        
    }

    render() {
        return (
            this.state.isOpen &&
                <DropdownList 
                    listItems={this.listItems}
                    onChangeItemList={this.onChangeItemList}
                    closeModal={this.closeModal}
                    isComboBox={this.isComboBox}
                    onAddItem={this.onAddItem}
                /> 
        );
    }
}

export default withTranslation()(DropdownListController);