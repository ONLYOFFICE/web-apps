import React, {Component, useEffect, useState} from 'react';
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton, Popover, Popup, View, Link, Sheet } from "framework7-react";
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
                <Sheet id="dropdown-list-sheet" closeByOutsideClick={true} backdrop={false} closeByBackdropClick={false} swipeToClose={true}> 
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                    />
                </Sheet>
            : 
                <Popover id="dropdown-list-popover" className="popover__titled" closeByOutsideClick={false}>
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
            f7.sheet.open('#dropdown-list-sheet', true);
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