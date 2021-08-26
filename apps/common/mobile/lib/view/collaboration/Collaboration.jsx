import React, { Component, useEffect } from 'react';
import { observer, inject } from "mobx-react";
import { Popover, List, ListItem, Navbar, NavRight, Sheet, BlockTitle, Page, View, Icon, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../utils/device";

import {ReviewController, ReviewChangeController} from "../../controller/collaboration/Review";
import {PageDisplayMode} from "./Review";

import {ViewCommentsController} from "../../controller/collaboration/Comments";

const PageUsers = inject("users")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const storeUsers = props.users;
    return (
        <Page name="collab__users" className='page-users'>
            <Navbar title={_t.textUsers} backLink={_t.textBack}>
                {Device.phone &&
                <NavRight>
                    <Link sheetClose=".coauth__sheet">
                        <Icon icon='icon-expand-down'/>
                    </Link>
                </NavRight>
                }
            </Navbar>
            <BlockTitle>{_t.textEditUser}</BlockTitle>
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

const routes = [
    {
        path: '/users/',
        component: PageUsers
    },
    {
        path: '/review/',
        component: ReviewController
    },
    {
        path: '/cm-review/',
        component: ReviewController,
        options: {
            props: {
                noBack: true
            }
        }
    },
    {
        path: '/display-mode/',
        component: PageDisplayMode
    },
    {
        path: '/review-change/',
        component: ReviewChangeController
    },
    {
        path: '/cm-review-change/',
        component: ReviewChangeController,
        options: {
            props: {
                noBack: true
            }
        }
    },
    {
        path: '/comments/',
        component: ViewCommentsController,
        options: {
            props: {
                allComments: true
            }
        }
    }
];

const PageCollaboration = inject('storeAppOptions', 'users')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const appOptions = props.storeAppOptions;
    return (
        <View style={props.style} stackPages={true} routes={routes} url={props.page && `/${props.page}/`}>
            <Page name="collab__main">
                <Navbar title={_t.textCollaboration}>
                    {Device.phone &&
                        <NavRight>
                            <Link sheetClose=".coauth__sheet">
                                <Icon icon='icon-expand-down'/>
                            </Link>
                        </NavRight>
                    }
                </Navbar>
                <List>
                    {props.users.editUsers.length > 0 &&
                        <ListItem link={'/users/'} title={_t.textUsers}>
                            <Icon slot="media" icon="icon-users"></Icon>
                        </ListItem>
                    }
                    {appOptions.canViewComments &&
                        <ListItem link='/comments/' title={_t.textComments}>
                            <Icon slot="media" icon="icon-insert-comment"></Icon>
                        </ListItem>
                    }
                    {window.editorType === 'de' && (appOptions.canReview || appOptions.canViewReview) &&
                        <ListItem link={'/review/'} title={_t.textReview}>
                            <Icon slot="media" icon="icon-review"></Icon>
                        </ListItem>
                    }
                </List>
            </Page>
        </View>
    )

}));

class CollaborationView extends Component {
    constructor(props) {
        super(props);

        this.onoptionclick = this.onoptionclick.bind(this);
    }
    onoptionclick(page){
        f7.views.current.router.navigate(page);
    }
    render() {
        const show_popover = this.props.usePopover;
        return (
            show_popover ?
                <Popover id="coauth-popover" className="popover__titled" onPopoverClosed={() => this.props.onclosed()} closeByOutsideClick={false}>
                    <PageCollaboration style={{height: '410px'}} page={this.props.page}/>
                </Popover> :
                <Sheet className="coauth__sheet" push onSheetClosed={() => this.props.onclosed()}>
                    <PageCollaboration page={this.props.page}/>
                </Sheet>
        )
    }
}

const Collaboration = props => {
    useEffect(() => {
        if ( Device.phone ) {
            f7.sheet.open('.coauth__sheet');
        } else {
            f7.popover.open('#coauth-popover', '#btn-coauth');
        }

        return () => {
            // component will unmount
        }
    });

    const onviewclosed = () => {
        if ( props.onclosed ) props.onclosed();
    };

    return (
        <CollaborationView usePopover={!Device.phone} onclosed={onviewclosed} page={props.page}/>
    )
};

export {PageCollaboration}
export default Collaboration;
