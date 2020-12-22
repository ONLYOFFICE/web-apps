import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageLayout = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const store = props.storeLayout;
    const arrayLayouts = JSON.parse(JSON.stringify(store.arrayLayouts));
    console.log(arrayLayouts);
    console.log(store);
    
    return (
        <Page>
            <Navbar title={_t.textLayout} backLink={_t.textBack} />
            {arrayLayouts.length ? (
                <List className="list-layouts">
                    {arrayLayouts.map((elem, index) => {
                        return (
                            <ListItem key={index}>
                                <img src={elem.Image} style={{width: elem.Width, height: elem.height}} alt=""/>
                            </ListItem>
                        )
                    })}
                </List>
            ) : null}
        </Page>
    );
};

const Layout = inject("storeLayout")(observer(PageLayout));

export default Layout;