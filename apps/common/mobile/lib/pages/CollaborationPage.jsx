import React from 'react';
import { observer, inject } from "mobx-react";
import { List, ListItem, Navbar, NavRight, Page, Icon, Link } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from "../../utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconReviewIos from '@common-ios-icons/icon-review.svg?ios';
import IconReviewAndroid from '@common-android-icons/icon-review.svg';
import IconSharingSettings from '@common-icons/icon-sharing-settings.svg';
import IconInsertCommentIos from '@common-ios-icons/icon-insert-comment.svg?ios';
import IconInsertCommentAndroid from '@common-android-icons/icon-insert-comment.svg';
import IconUsersIos from '@common-ios-icons/icon-users.svg?ios';
import IconUsersAndroid from '@common-android-icons/icon-users.svg';

const CollaborationPage = props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const appOptions = props.storeAppOptions;
    const isForm = appOptions.isForm;
    const sharingSettingsUrl = appOptions.sharingSettingsUrl;
    const isViewer = appOptions.isViewer;

    return (
        <Page name="collab__main">
            <Navbar title={_t.textCollaboration}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose=".coauth__sheet">
                            {Device.ios ? 
                                <SvgIcon slot="media" symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon slot="media" symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {(sharingSettingsUrl && !isForm) &&
                    <ListItem title={t('Common.Collaboration.textSharingSettings')} link="/sharing-settings/">
                        <SvgIcon slot="media" symbolId={IconSharingSettings.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {props.users.editUsers.length > 0 &&
                    <ListItem link={'/users/'} title={_t.textUsers}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconUsersIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconUsersAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
                {appOptions.canViewComments &&
                    <ListItem link='/comments/' title={_t.textComments}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconInsertCommentIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconInsertCommentAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
                {(window.editorType === 'de' && (appOptions.canReview || appOptions.canViewReview) && !isViewer) &&
                    <ListItem link={'/review/'} title={_t.textReview}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconReviewIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconReviewAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
            </List>
        </Page>
    )
};

let storeInfo;

switch (window.asceditor) {
    case 'word':
        storeInfo = 'storeDocumentInfo';
        break;
    case 'slide':
        storeInfo = 'storePresentationInfo';
        break;
    case 'cell':
        storeInfo = 'storeSpreadsheetInfo';
        break;
    case 'visio':
        storeInfo = 'storeVisioInfo';
        break;
}

const Collaboration = inject('storeAppOptions', 'users', storeInfo)(observer(CollaborationPage));

export { Collaboration as CollaborationPage };