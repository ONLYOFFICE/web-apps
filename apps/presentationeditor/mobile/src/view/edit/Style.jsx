import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const color = props.storeStyle.color;
    const customColors = props.storePalette.customColors;

    // const changeColor = (color, effectId) => {
    //     if (color !== 'empty') {
    //         if (effectId !==undefined ) {
    //             props.onBackgroundColor({color: color, effectId: effectId});
    //         } else {
    //             props.onBackgroundColor(color);
    //         }
    //     } else {
    //         // open custom color menu
    //         props.f7router.navigate('/edit-text-custom-back-color/');
    //     }
    // };
  
    return (
        <Page className="slide-style">
            <Navbar title={_t.textFill} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette curColor={color} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-text-custom-font-color/'}></ListItem>
            </List>
        </Page>
    );
};

const Style = inject("storeStyle", "storePalette")(observer(PageStyle));

export default Style;