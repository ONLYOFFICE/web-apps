import React, { Component, useEffect, useState } from 'react';
import { f7, Page, Navbar, List, ListItem, Popover, View, Link, Sheet, Icon, NavRight, BlockTitle, NavLeft, Popup } from "framework7-react";
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';

const PageCustomOptionList = props => {
    const { t } = useTranslation();
    const [itemValue, setItemValue] = useState(props.enteredValue);

    return (
        <Page>
            <Navbar className='navbar-dropdown-list'>
                <NavLeft>
                    <Link text={t('Edit.textCancel')} onClick={() => {
                        f7.views.current.router.back();
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

const PageDropdownList = props => {
    const listItems = props.listItems;
    const curValue = props.curValue;
    const enteredValue = props.enteredValue;
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
                                            <input type="text" id="custom-option-field" placeholder='${t('Edit.textPlaceholder')}' value='${enteredValue}'>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>`,
            on: {
                opened: () => {
                    const optionField = document.querySelector('#custom-option-field');
                    optionField.focus();
                }
            },
            buttons: [
                {
                    text: t('Edit.textCancel')
                },
                {
                    text: t('Edit.textSave'),
                    onClick: () => {
                        const itemValue = document.querySelector('#custom-option-field').value;
                        props.onAddItem(itemValue);
                    }
                }
            ]
        }).open();
    }

    const customOptionClickHandler = () => {
        if(Device.android) {
            openDlgCustomOption();
        } else {
            f7.views.current.router.navigate('/custom-option/', {
                props: {
                    onAddItem: props.onAddItem,
                    enteredValue
                }
            });
        }
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
                        <List className="dropdown-list">
                            <ListItem radio radioIcon="end" checked={enteredValue.length} title={enteredValue || t('Edit.textEnterYourOption')} name="custom-option" onClick={customOptionClickHandler}></ListItem> 
                        </List>
                        <BlockTitle>{t('Edit.textChooseAnItem')}</BlockTitle>
                    </>
                : null}
                <List className="dropdown-list">
                    {listItems.length && listItems.map((item, index) => (
                        <ListItem radioIcon="end" radio checked={item.value === curValue && !enteredValue} key={index} name="dropdown-option" className={'no-indicator ' + (index === 0 ? 'dropdown-list__placeholder' : '')} title={item.caption} onClick={() => props.onChangeItemList(item.value)}></ListItem>
                    ))}
                </List>
            </Page>
        </View>
    );
};

const routes = [
    {
        path: '/custom-option/',
        component: PageCustomOptionList
    }
]

class DropdownListView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            Device.isPhone ? 
                <Popup id="dropdown-list-popup" className="dropdown-list-popup" closeByOutsideClick={true} swipeToClose={true} onPopupClosed={() => this.props.closeModal()}> 
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
                        onAddItem={this.props.onAddItem}
                        curValue={this.props.curValue}
                        enteredValue={this.props.enteredValue}
                        style={{height: '260px'}}
                    />
                </Popup>
            : 
                <Popover id="dropdown-list-popover" className="popover__titled" closeByOutsideClick={true} onPopoverClosed={() => this.props.closeModal()}>
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
                        onAddItem={this.props.onAddItem}
                        curValue={this.props.curValue}
                        enteredValue={this.props.enteredValue}
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
            isComboBox={props.isComboBox}
            onAddItem={props.onAddItem}
            curValue={props.curValue}
            enteredValue={props.enteredValue}
        />
    );
};

export default DropdownList;