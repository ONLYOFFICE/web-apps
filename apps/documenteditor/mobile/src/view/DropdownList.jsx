import React, {Component, useEffect} from 'react';
import { f7, Page, Navbar, List, ListItem, Popover, View, Link, Sheet, Icon, NavRight, BlockTitle, NavLeft } from "framework7-react";
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';

const PageCustomOptionList = () => {
    const { t } = useTranslation();

    return (
        <Page>
            <Navbar className='navbar-dropdown-list'>
                <NavLeft>
                    <Link text={t('Edit.textCancel')} onClick={() => {
                        f7.views.current.router.back()
                    }} />
                </NavLeft>
                <NavRight>
                    <Link text={t('Edit.textSave')} />
                </NavRight>
            </Navbar>
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

    const openDlgCustomOption = () => {}

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
                <Sheet id="dropdown-list-sheet" closeByOutsideClick={true} backdrop={false} closeByBackdropClick={false} swipeToClose={true}> 
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
                    />
                </Sheet>
            : 
                <Popover id="dropdown-list-popover" className="popover__titled" closeByOutsideClick={false}>
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
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
        />
    );
};

export default DropdownList;