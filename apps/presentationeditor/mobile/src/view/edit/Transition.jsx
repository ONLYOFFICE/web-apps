import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageTransition = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    // const storeInfo = props.storePresentationInfo;
    // const dataApp = props.getAppProps();
    // const dataModified = props.getModified;
    // const dataModifiedBy = props.getModifiedBy;
    // const creators = props.getCreators;
    // const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc));
    
    return (
        <Page>
            <Navbar title={_t.textTransition} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <List>
                <ListItem link="#" title={_t.textEffect} after="None"></ListItem>
                <ListItem link="#" title={_t.textType}></ListItem>
                <ListItem link="#" title={_t.textDuration}></ListItem>
            </List>

        </Page>
    );
};

const Transition = inject("storeTransition")(observer(PageTransition));

export default Transition;