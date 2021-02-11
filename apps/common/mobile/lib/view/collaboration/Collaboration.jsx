import React, { Component, useEffect } from 'react';
import { observer, inject } from "mobx-react";
import { Popover, List, ListItem, Navbar, NavRight, Sheet, BlockTitle, Page, View, Icon, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../utils/device";

import {ReviewController, ReviewChangeController} from "../../controller/collaboration/Review";
import {PageDisplayMode} from "./Review";

const PageUsers = inject("users")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const storeUsers = props.users;
    return (
        <Page name="collab__users">
            <Navbar title={_t.textUsers} backLink={_t.textBack}></Navbar>
            <BlockTitle>{_t.textEditUser}</BlockTitle>
            <List className="coauth__list">
                {storeUsers.users.map((model, i) => (
                    <ListItem title={model.asc_getUserName()} key={i}>
                        <Icon slot="media" icon="coauth__list__icon"
                              style={{backgroundColor: model.asc_getColor()}}></Icon>
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
        path: '/display-mode/',
        component: PageDisplayMode
    },
    {
        path: '/review-change/',
        component: ReviewChangeController
    }
];

const PageCollaboration = props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    return (
        <View style={props.style} stackPages={true} routes={routes}>
            <Page name="collab__main">
                <Navbar title={_t.textCollaboration}>
                    {props.isSheet &&
                        <NavRight>
                            <Link sheetClose=".coauth__sheet">
                                <Icon icon='icon-expand-down'/>
                            </Link>
                        </NavRight>
                    }
                </Navbar>
                <List>
                    <ListItem link={'/users/'} title={_t.textUsers}>
                        <Icon slot="media" icon="icon-users"></Icon>
                    </ListItem>
                    <ListItem link="#" title={_t.textComments}>
                        <Icon slot="media" icon="icon-insert-comment"></Icon>
                    </ListItem>
                    {window.editorType === 'de' &&
                        <ListItem link={'/review/'} title={_t.textReview}>
                            <Icon slot="media" icon="icon-review"></Icon>
                        </ListItem>
                    }
                </List>
            </Page>
        </View>
    )

};

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
                <Popover id="coauth-popover" className="popover__titled" onPopoverClosed={() => this.props.onclosed()}>
                    <PageCollaboration style={{height: '410px'}}/>
                </Popover> :
                <Sheet className="coauth__sheet" push onSheetClosed={() => this.props.onclosed()}>
                    <PageCollaboration isSheet={true}/>
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
        <CollaborationView usePopover={!Device.phone} onclosed={onviewclosed} />
    )
};

// export withTranslation()(CollaborationPopover);
export {PageCollaboration}
export default Collaboration;
