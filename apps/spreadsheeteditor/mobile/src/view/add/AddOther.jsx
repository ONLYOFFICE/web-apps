import React from 'react';
import {List, ListItem, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const AddOther = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    return (
        <List>
            <ListItem title={_t.textImage} link={'/add-image/'}>
                <Icon slot="media" icon="icon-insimage"></Icon>
            </ListItem>
            <ListItem title={_t.textLink} link={'/add-link/'}>
                <Icon slot="media" icon="icon-link"></Icon>
            </ListItem>
        </List>
    )
};

export {AddOther};