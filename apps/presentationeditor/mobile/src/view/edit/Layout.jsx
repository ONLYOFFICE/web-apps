import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageLayout = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeFocusObjects = props.storeFocusObjects;
    const storeLayout = props.storeLayout;
    storeLayout.changeSlideLayoutIndex(storeFocusObjects.slideObject.get_LayoutIndex());
    const arrayLayouts = JSON.parse(JSON.stringify(storeLayout.arrayLayouts));
    const slideLayoutIndex = storeLayout.slideLayoutIndex;
   
    // console.log(slideLayoutIndex);
    // console.log(arrayLayouts);
   
    return (
        <Page className="slide-layout">
            <Navbar title={_t.textLayout} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            {arrayLayouts.length ? (
                <List className="slide-layout__list">
                    {arrayLayouts.map((elem, index) => {
                        return (
                            <ListItem key={index} className={slideLayoutIndex === index ? "active" : ""} 
                                onClick={() => {
                                    storeLayout.changeSlideLayoutIndex(index);
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

const Layout = inject("storeLayout", "storeFocusObjects")(observer(PageLayout));

export default Layout;