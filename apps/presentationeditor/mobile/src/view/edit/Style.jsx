import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });

    const storeFocusObjects = props.storeFocusObjects;
    const slideObject = storeFocusObjects.slideObject;
    const storePalette = props.storePalette;
    const storeStyle = props.storeStyle;

    storeStyle.getFillColor(slideObject);

    const customColors = storePalette.customColors;
    const fillColor = storeStyle.fillColor;


    const changeColor = (color, effectId) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                props.onFillColor({color: color, effectId: effectId});
            } else {
                props.onFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-custom-color/');
        }
    };
  
    return (
        <Page className="slide-style">
            <Navbar title={_t.textFill} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fillColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-custom-color/'} routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageStyleCustomColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fillColor = props.storeStyle.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        // props.f7router.back();
    };

    return(
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor} routeProps={{
                onFillColor: props.onFillColor
            }}/>
        </Page>
    )
};

const Style = inject("storeStyle", "storePalette", "storeFocusObjects")(observer(PageStyle));
const CustomColor = inject("storeStyle", "storePalette", "storeFocusObjects")(observer(PageStyleCustomColor));

export {Style, CustomColor};