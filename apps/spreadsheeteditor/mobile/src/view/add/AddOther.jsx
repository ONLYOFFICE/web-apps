import React, { useContext } from 'react';
import { inject, observer } from 'mobx-react';
import {List, ListItem, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../page/main';
import { Device } from "../../../../../common/mobile/utils/device";
import SvgIcon from "../../../../../common/mobile/lib/component/SvgIcon";
import IconDraw from "../../../../../common/mobile/resources/icons/draw.svg";

const AddOther = inject("storeFocusObjects", "storeAppOptions")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const storeAppOptions = props.storeAppOptions;
    const canModifyFilter = storeAppOptions.canModifyFilter;
    const isHyperLink = storeFocusObjects.selections.indexOf('hyperlink') > -1;
    const hideAddComment = props.hideAddComment();
    const mainContext = useContext(MainContext);
    const wsProps = mainContext.wsProps;

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
            <ListItem title={_t.textSortAndFilter} className={wsProps.Sort || !canModifyFilter ? 'disabled' : ''} link={'/add-sort-and-filter/'}>
                <Icon slot="media" icon="icon-sort"></Icon>
            </ListItem>
            <ListItem title={_t.textLink} className={wsProps.InsertHyperlinks && 'disabled'} link={isHyperLink ? '/edit-link/' : '/add-link/'} routeProps={{
                isNavigate: true
            }}>
                <Icon slot="media" icon="icon-link"></Icon>
            </ListItem>
            <ListItem key='drawing' title={_t.textDrawing} onClick={() => {
              props.closeModal();
              Common.Notifications.trigger('draw:start');
            }}>
              <SvgIcon slot='media' symbolId={IconDraw.id} className='icon icon-svg'/>
            </ListItem>
        </List>
    )
}));

export {AddOther};