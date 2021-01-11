import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageTheme = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const store = props.storeTheme;
    const arrayThemes = JSON.parse(JSON.stringify(store.arrayThemes));
    const slideThemeIndex = store.slideThemeIndex;
    const defaultThemes = arrayThemes[0];
    const docThemes = arrayThemes[1];
   
    // console.log(slideThemeIndex);
    // console.log(arrayThemes);
  
    return (
        <Page className="slide-theme">
            <Navbar title={_t.textTheme} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            {arrayThemes.length ? (
                <List className="slide-theme__list">
                    {defaultThemes.map((elem, index) => {
                        return (
                            <ListItem key={elem.Index} className={elem.Index === slideThemeIndex ? "item-theme active" : "item-theme"} 
                                style={{backgroundPosition: "0 " + index * -38 + "px"}} 
                                onClick={() => {
                                    store.changeSlideThemeIndex(elem.Index);
                                    props.onThemeClick(elem.Index);
                                }}>
                            </ListItem>
                        );
                    })}
                    {docThemes.map((elem, index) => {
                        return (
                            <ListItem key={elem.Index} className={elem.Index === slideThemeIndex ? "item-theme active" : "item-theme"}
                                style={{backgroundPosition: "0 -0px", backgroundImage: "url(" + elem.ThemeInfo.Thumbnail + ")"}}
                                onClick={() => {
                                    store.changeSlideThemeIndex(elem.Index);
                                    props.onThemeClick(elem.Index);
                                }}>
                            </ListItem>
                        );
                    })}
                </List>
            ) : null}
        </Page>
    );
};

const Theme = inject("storeTheme")(observer(PageTheme));

export default Theme;