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
    const SchemeNames = [
        t('View.Settings.txtScheme1'), t('View.Settings.txtScheme2'), t('View.Settings.txtScheme3'), t('View.Settings.txtScheme4'), 
        t('View.Settings.txtScheme5'), t('View.Settings.txtScheme6'), t('View.Settings.txtScheme7'), t('View.Settings.txtScheme8'),
        t('View.Settings.txtScheme9'), t('View.Settings.txtScheme10'), t('View.Settings.txtScheme11'), t('View.Settings.txtScheme12'),
        t('View.Settings.txtScheme13'), t('View.Settings.txtScheme14'), t('View.Settings.txtScheme15'), t('View.Settings.txtScheme16'),
        t('View.Settings.txtScheme17'), t('View.Settings.txtScheme18'), t('View.Settings.txtScheme19'), t('View.Settings.txtScheme20'),
        t('View.Settings.txtScheme21'), t('View.Settings.txtScheme22')
    ];

    return (
        <Page>
            <Navbar title={t('View.Settings.textColorSchemes')} backLink={t('View.Settings.textBack')} />
            <List>
                {
                    allSchemes ? allSchemes.map((scheme, index) => {
                        const name = scheme.get_name();
                        return (
                            <ListItem radio={true} className="color-schemes-menu no-fastclick" key={index} title={(index < 22) ? (SchemeNames[index] || name) : name} checked={stateScheme === index}
                                onChange={() => {
                                    if(index !== curScheme) {
                                        setScheme(index);
                                        props.onColorSchemeChange(index);
                                    };
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