import React, {useState} from 'react';
import {Page, Navbar, List, ListItem, Icon, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';

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
                            <Icon slot="media" icon="sortdown"></Icon>
                        </a>
                        <a className='button' onClick={() => {props.onInsertSort('up')}}>
                            <Icon slot="media" icon="sortup"></Icon>
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