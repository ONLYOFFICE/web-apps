import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageLayout = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const store = props.storeLayout;
    const arrayLayouts = JSON.parse(JSON.stringify(store.arrayLayouts));
    const slideLayoutIndex = store.slideLayoutIndex;
   
    console.log(slideLayoutIndex);
    console.log(arrayLayouts);
    console.log(store);

    

    return (
        <Page className="slide-layout">
            <Navbar title={_t.textLayout} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            {arrayLayouts.length ? (
                <List>
                    {arrayLayouts.map((elem, index) => {
                        return (
                            <ListItem key={index} className={slideLayoutIndex === index ? "active" : ""} 
                                onClick={() => {
                                    store.changeSlideLayoutIndex(index);
                                    props.onLayoutClick(index);
                                }}>
                                <img src={elem.Image} style={{width: elem.Width, height: elem.Height}} alt=""/>
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