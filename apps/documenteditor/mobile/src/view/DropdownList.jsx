import React, {Component, useEffect, useState} from 'react';
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton, Popover, Popup, View, Link, Actions, ActionsGroup } from "framework7-react";
import { useTranslation } from "react-i18next";
import { Device } from '../../../../common/mobile/utils/device';

const PageDropdownList = props => {
    const listItems = props.listItems;

    return (
        <View style={props.style}>
            <Page>
                <List>
                    {listItems.length && listItems.map((elem, index) => (
                        <ListItem key={index} className='no-indicator' title={elem.caption} onClick={() => props.onChangeItemList(elem.value)}></ListItem>
                    ))} 
                </List>
            </Page>
        </View>
    );
};

class DropdownListView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            Device.isPhone ? 
                <Popup id="dropdown-list-popup" style={{height: '410px'}}> 
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        style={{height: '100%'}}
                    />
                </Popup>
            : 
                <Popover id="dropdown-list-popover" closeByOutsideClick={false} closeByBackdropClick={false}>
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        style={{height: '410px'}}
                    />
                </Popover>
            
        );
    }
}


const DropdownList = props => {
    useEffect(() => {
        if(Device.isPhone) {
            f7.popup.open('#dropdown-list-popup', true);
        } else {
            f7.popover.open('#dropdown-list-popover', '#dropdown-list-target');
        }
    
        return () => {}
    });

    return (
        <DropdownListView 
            listItems={props.listItems}
            onChangeItemList={props.onChangeItemList}
            closeModal={props.closeModal}
        />
    );
};

export default DropdownList;