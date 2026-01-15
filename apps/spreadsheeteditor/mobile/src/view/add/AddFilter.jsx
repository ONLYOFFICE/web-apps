import React, {useState} from 'react';
import {Page, Navbar, List, ListItem, Icon, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconSortdown from '@icons/icon-sortdown.svg';
import IconSortup  from '@icons/icon-sortup.svg';

const AddSortAndFilter = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [isFilter, setIsFilter] = useState(props.isFilter);
    const wsLock = props.wsLock;

    return (
        <Page>
            <Navbar title={_t.textSortAndFilter} backLink={_t.textBack}/>
            <List>
                <ListItem className='buttons'>
                    <div className="row">
                        <a className='button' onClick={() => {props.onInsertSort('down')}}>
                            <SvgIcon slot="media" symbolId={IconSortdown.id} className={'icon icon-svg'} />
                        </a>
                        <a className='button' onClick={() => {props.onInsertSort('up')}}>
                            <SvgIcon slot="media" symbolId={IconSortup.id} className={'icon icon-svg'} />
                        </a>
                    </div>
                </ListItem>
            </List>
            {!wsLock && 
                <List>
                    <ListItem title={_t.textFilter}>
                        <Toggle checked={isFilter}
                            onToggleChange={() => {
                                setIsFilter(!isFilter);
                                props.onInsertFilter(!isFilter)}
                            }
                        />
                    </ListItem>
                </List>
            }
        </Page>
    )
};

export default AddSortAndFilter;