import React, {useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link, Toggle, Range, ListItemCell } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageEffect= props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    
    return (
        <Page>
            <Navbar title={_t.textEffect} backLink={_t.textBack} />
            <List mediaList>
                <ListItem radio name="editslide-effect"></ListItem>
                <ListItem radio name="editslide-effect"></ListItem>
                <ListItem radio name="editslide-effect"></ListItem>
            </List>
        </Page>
    );
};

const Effect = inject("storeEffect")(observer(PageEffect));

export default Effect;