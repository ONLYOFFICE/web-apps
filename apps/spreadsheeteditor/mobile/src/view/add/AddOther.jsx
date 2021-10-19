import React from 'react';
import {List, ListItem, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const AddOther = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const hideAddComment = props.hideAddComment();
    const wsProps = props.wsProps;

    return (
        <List>
            <ListItem title={_t.textImage} className={wsProps.Objects && 'disabled'} link={'/add-image/'}>
                <Icon slot="media" icon="icon-insimage"></Icon>
            </ListItem>
            {(!hideAddComment && !wsProps.Objects) && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                <Icon slot="media" icon="icon-insert-comment"></Icon>
            </ListItem>}
            <ListItem title={_t.textSortAndFilter} className={wsProps.Sort && 'disabled'} link={'/add-sort-and-filter/'}>
                <Icon slot="media" icon="icon-sort"></Icon>
            </ListItem>
            <ListItem title={_t.textLink} className={wsProps.InsertHyperlinks && 'disabled'} link={'/add-link/'}>
                <Icon slot="media" icon="icon-link"></Icon>
            </ListItem>
        </List>
    )
};

export {AddOther};