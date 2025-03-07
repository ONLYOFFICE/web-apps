import React from 'react';
import { observer, inject } from "mobx-react";
import { List, ListItem, Navbar, NavRight, Page, Icon, Link } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from "../../utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

const UsersPage = inject("users")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const storeUsers = props.users;

    return (
        <Page name="collab__users" className='page-users'>
            <Navbar title={_t.textUsers} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose=".coauth__sheet">
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List className="coauth__list">
                {storeUsers.editUsers.map((user, i) => (
                    <ListItem title={user.name + (user.count > 1 ? ` (${user.count})` : '')} key={i}>
                        <div slot="media" className='color' style={{backgroundColor: user.color}}>
                            {user.initials}
                        </div>
                    </ListItem>
                ))}
            </List>
        </Page>
    )
}));

export default UsersPage;