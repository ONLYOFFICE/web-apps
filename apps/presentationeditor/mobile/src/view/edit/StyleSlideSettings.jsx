import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const PageFillColor = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeFocusObjects = props.storeFocusObjects;
    const slideObject = storeFocusObjects.slideObject;
    const storePalette = props.storePalette;
    const storeSlideStyle = props.storeSlideStyle;
    const customColors = storePalette.customColors;
    const fillColor =  storeSlideStyle.fillColor ? storeSlideStyle.fillColor : storeSlideStyle.getFillColor(slideObject);

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
                storeSlideStyle.changeFillColor(newColor);
            } else {
                props.onFillColor(color);
                storeSlideStyle.changeFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-custom-color/');
        }
    };
  
    return (
        <Page>
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

const PageCustomFillColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fillColor = props.storeSlideStyle.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        props.storeSlideStyle.changeFillColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const StyleFillColor = inject("storeSlideStyle", "storePalette", "storeFocusObjects")(observer(PageFillColor));
const CustomFillColor = inject("storeSlideStyle", "storePalette", "storeFocusObjects")(observer(PageCustomFillColor));

export { StyleFillColor, CustomFillColor };