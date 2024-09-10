import React, {useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PagePresentationSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storePresentationSettings = props.storePresentationSettings;
    const slideSizeArr = storePresentationSettings.slideSizes;
    const slideSizeIndex = storePresentationSettings.slideSizeIndex;
    // console.log(slideSizeIndex);

    return (
        <Page>
            <Navbar title={_t.textPresentationSettings} backLink={_t.textBack} />
            <BlockTitle>{_t.textSlideSize}</BlockTitle>
            <List>
                <ListItem radio name="slide-size" checked={slideSizeIndex === 0} 
                    onChange={() => props.onSlideSize(slideSizeArr[0])} title={_t.mniSlideStandard}></ListItem>
                <ListItem radio name="slide-size" checked={slideSizeIndex === 1}
                    onChange={() => props.onSlideSize(slideSizeArr[1])} title={_t.mniSlideWide}></ListItem>
            </List>
            <List mediaList>
                <ListItem title={_t.textColorSchemes} link="/color-schemes/" routeProps={{
                    onColorSchemeChange: props.onColorSchemeChange,
                    initPageColorSchemes: props.initPageColorSchemes
                }}></ListItem>
            </List>
        </Page>
    )
}

const PagePresentationColorSchemes = props => {
    const { t } = useTranslation();
    const curScheme = props.initPageColorSchemes();
    const [stateScheme, setScheme] = useState(curScheme);
    const storePresentationSettings = props.storePresentationSettings;
    const allSchemes = storePresentationSettings.allSchemes;

    return (
        <Page>
            <Navbar title={t('View.Settings.textColorSchemes')} backLink={t('View.Settings.textBack')} />
            <List>
                {
                    allSchemes ? allSchemes.map((scheme, index) => {
                        return (
                            <ListItem radio={true} className="color-schemes-menu no-fastclick" key={index} title={scheme.get_name()} checked={stateScheme === index}
                                onChange={() => {
                                    setScheme(index);
                                    setTimeout(() => props.onColorSchemeChange(index), 10);
                            }}>
                                <div slot="before-title">
                                    <span className="color-schema-block">
                                        {
                                            scheme.get_colors().map((elem, index) => {
                                                if(index >=2 && index < 7) {
                                                    let clr = {background: "#" + Common.Utils.ThemeColor.getHexColor(elem.get_r(), elem.get_g(), elem.get_b())};
                                                    return (
                                                        <span className="color" key={index} style={clr}></span>
                                                    )
                                                }
                                            })
                                        }
                                       
                                    </span>
                                </div>
                            </ListItem>
                        )
                    }) : null        
                }
            </List>
        </Page>

    )
};

const PresentationSettings = inject("storePresentationSettings")(observer(PagePresentationSettings));
const PresentationColorSchemes = inject("storePresentationSettings")(observer(PagePresentationColorSchemes));

export { PresentationSettings, PresentationColorSchemes }