import React from 'react';
import {f7, List, Popover, Sheet, ListItem, Icon, ListButton, Page, Navbar, NavRight, Link, View} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

const FilterOptions = inject('storeAppOptions')(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeAppOptions = props.storeAppOptions;
    const canModifyFilter = storeAppOptions.canModifyFilter;
    let is_all_checked = props.listVal.every(item => item.check);

    const HandleClearFilter = () => {
        is_all_checked = true;
        props.onClearFilter();
        props.onUpdateCell('all', true);
    };

    const onValidChecked = () => {
        if ( props.listVal.every(item => !item.check) ) {
            f7.dialog.create({
                title: _t.textErrorTitle,
                text: _t.textErrorMsg,
                buttons: [
                    {
                        text: 'OK',
                    }
                ]
            }).open();
        }
    };

    return (
        <View style={props.style}>
            <Page>
                <Navbar title={_t.textFilterOptions}>
                    {Device.phone &&
                        <NavRight>
                            <Link sheetClose=".picker__sheet">
                                <Icon icon='icon-expand-down'/>
                            </Link>
                        </NavRight>
                    }
                </Navbar>
                <List>
                    <ListItem className='buttons'>
                        <div className="row">
                            <a className={'button' + (props.checkSort === 'down' ? ' active' : '')} onClick={() => {
                                props.onSort('sortdown');
                                onValidChecked();
                            }}>
                                <Icon slot="media" icon="sortdown"/>
                            </a>
                            <a className={'button' + (props.checkSort === 'up' ? ' active' : '')} onClick={() => {
                                props.onSort('sortup');
                                onValidChecked();
                            }}>
                                <Icon slot="media" icon="sortup"/>
                            </a>
                        </div>
                    </ListItem>
                </List>
                <List>
                    <ListButton className={props.isValid || is_all_checked ? 'disabled' : ''}
                                onClick={HandleClearFilter}>{_t.textClearFilter}</ListButton>
                    <ListButton color="red" className={!canModifyFilter ? 'disabled' : ''}
                                onClick={() => props.onDeleteFilter()}
                                id="btn-delete-filter">{_t.textDeleteFilter}</ListButton>
                </List>
                <List>
                    <ListItem className='radio-checkbox-item' onChange={e => {
                        props.onUpdateCell('all', e.target.checked);
                        onValidChecked();
                    }} name='filter-cellAll' checkbox checked={is_all_checked}>{_t.textSelectAll}</ListItem>
                    {props.listVal.map((value) =>
                        <ListItem className='radio-checkbox-item' onChange={e => {
                            props.onUpdateCell(value.id, e.target.checked);
                            onValidChecked();
                        }} key={value.value} name='filter-cell' value={value.value} title={value.cellvalue} checkbox
                                  checked={value.check}/>
                    )}
                </List>
            </Page>
        </View>
    )
}));

const FilterView = (props) => {
    return (
        !Device.phone ?
            <Popover id="picker-popover" className="popover__titled popover-filter">
                <FilterOptions style={{height: '410px'}} {...props}></FilterOptions>
            </Popover> :
            <Sheet className="picker__sheet sheet-filter">
                <FilterOptions  {...props}></FilterOptions>
            </Sheet>
    )
}

export default FilterView;