import React, {useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link, Toggle, Range, ListItemCell } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageType= props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textType} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <List mediaList>
                <ListItem radio name="editslide-effect-type"></ListItem>
                <ListItem radio name="editslide-effect-type"></ListItem>
                <ListItem radio name="editslide-effect-type"></ListItem>
            </List>
        </Page>
    );
};

const Type = inject("storeType")(observer(PageType));

export default Type;