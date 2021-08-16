import React, {useEffect, useState} from 'react';
import {f7, List, Popover, Sheet, ListItem, Icon, Row, Button, ListButton, Page, Navbar, Segmented, BlockTitle, NavRight, Link, Toggle,View} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';

const FilterOptions = (props) => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    let is_all_checked = props.listVal.every(item => item.check);

    const HandleClearFilter = () => {
        is_all_checked = true;
        props.onClearFilter();
        props.onUpdateCell('all', true);
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
                    <Row>
                        <a className={'button' + (props.checkSort === 'down' ? ' active' : '')} onClick={() => props.onSort('sortdown')}>
                            <Icon slot="media" icon="sortdown"/>
                        </a>
                        <a className={'button' + (props.checkSort === 'up' ? ' active' : '')} onClick={() => props.onSort('sortup')}>
                            <Icon slot="media" icon="sortup"/>
                        </a>
                    </Row>
                </ListItem>
           </List>

           <List >
               <ListButton color="black" className={props.isValid ? 'disabled' : ''} onClick={HandleClearFilter}>{_t.textClearFilter}</ListButton>
               <ListButton color="red" onClick={() => props.onDeleteFilter()} id="btn-delete-filter">{_t.textDeleteFilter}</ListButton>
           </List>
           <List>
               <ListItem className='radio-checkbox-item' onChange={e => props.onUpdateCell('all', e.target.checked)} name='filter-cellAll' checkbox checked={is_all_checked}>{_t.textSelectAll}</ListItem>
               {props.listVal.map((value) =>
                   <ListItem className='radio-checkbox-item' onChange={e => props.onUpdateCell(value.id, e.target.checked)}  key={value.value} name='filter-cell' value={value.value} title={value.cellvalue} checkbox checked={value.check} />
               )}
           </List>
            </Page>
        </View>
    )
};

const FilterView = (props) => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const onClosed = () => {
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
        !Device.phone ?
        <Popover id="picker-popover" className="popover__titled" onPopoverClosed={onClosed}>
            <FilterOptions style={{height: '410px'}} {...props}></FilterOptions>
        </Popover> :
        <Sheet className="picker__sheet" push onSheetClosed={onClosed}>
            <FilterOptions  {...props}></FilterOptions>
        </Sheet>
    )
}

export default FilterView;