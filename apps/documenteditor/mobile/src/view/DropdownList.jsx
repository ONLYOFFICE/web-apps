import React, { Component, useEffect, useState } from 'react';
import { f7, Page, Navbar, List, ListItem, Popover, View, Link, Sheet, Icon, NavRight, BlockTitle, NavLeft } from "framework7-react";
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';

const PageCustomOptionList = props => {
    const { t } = useTranslation();
    const [itemValue, setItemValue] = useState('');

    return (
        <Page>
            <Navbar className='navbar-dropdown-list'>
                <NavLeft>
                    <Link text={t('Edit.textCancel')} onClick={() => {
                        f7.views.current.router.back()
                    }} />
                </NavLeft>
                <NavRight>
                    <Link text={t('Edit.textSave')} onClick={() => props.onAddItem(itemValue)} />
                </NavRight>
            </Navbar>
            <div className="custom-option-wrapper">
                <div className='wrap-textarea'>
                    <textarea autoFocus placeholder={t('Edit.textPlaceholder')} onChange={(e) => {setItemValue(e.target.value)}} value={itemValue}></textarea>
                </div>
            </div>
        </Page>
    )
}

const routes = [
    {
        path: '/custom-option/',
        component: PageCustomOptionList
    }
]

const PageDropdownList = props => {
    const listItems = props.listItems;
    const { t } = useTranslation();

    const openDlgCustomOption = () => {
        f7.dialog.create({
            title: t('Edit.textYourOption'),
            content: `
                <div class="input-field dropdown-option">
                    <div class="inputs-list list inline-labels">
                        <ul>
                            <li>
                                <div class="item-content item-input">
                                    <div class="item-inner">
                                        <div class="item-input-wrap">
                                            <input type="text" id="custom-option-field" placeholder='${t('Edit.textPlaceholder')}'>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>`,
            buttons: [
                {
                    text: t('Edit.textCancel')
                },
                {
                    text: t('Edit.textSave'),
                    onClick: () => {
                        const valueItem = document.querySelector('#custom-option-field');
                        props.onAddItem(valueItem);
                    }
                }
            ]
        }).open();
    }

    return (
        <View style={props.style} routes={routes}>
            <Page>
                <Navbar title={t('Edit.textChooseAnOption')} className='navbar-dropdown-list'>
                    <NavRight>
                        <Link text={Device.ios ? t('Edit.textDone') : ''} onClick={props.closeModal}>
                            {Device.android && <Icon icon='icon-done' />}
                        </Link>
                    </NavRight>
                </Navbar>
                {props.isComboBox ?
                    <>
                        <List>
                            <ListItem title={t('Edit.textEnterYourOption')} href={Device.ios ? '/custom-option/' : '#'} onClick={() => {
                                if(Device.android) openDlgCustomOption()
                            }} routeProps={{
                                onAddItem: props.onAddItem
                            }}></ListItem>
                        </List>
                        <BlockTitle>{t('Edit.textChooseAnItem')}</BlockTitle>
                    </>
                : null}
                <List className="dropdown-list">
                    {listItems.length && listItems.map((elem, index) => (
                        <ListItem key={index} className={'no-indicator ' + (index === 0 ? 'dropdown-list__placeholder' : '')} title={elem.caption} onClick={() => props.onChangeItemList(elem.value)}></ListItem>
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
                <Sheet id="dropdown-list-sheet" closeByOutsideClick={true} backdrop={false} closeByBackdropClick={false} swipeToClose={true} onSheetClosed={() => this.props.closeModal()}> 
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
                        onAddItem={this.props.onAddItem}
                    />
                </Sheet>
            : 
                <Popover id="dropdown-list-popover" className="popover__titled" closeByOutsideClick={true} onPopoverClosed={() => this.props.closeModal()}>
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
                        onAddItem={this.props.onAddItem}
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
            isComboBox={props.isComboBox}
            onAddItem={props.onAddItem}
        />
    );
};

export default DropdownList;