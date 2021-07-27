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
    const _t = t('View.Settings', {returnObjects: true});
    const storePresentationSettings = props.storePresentationSettings;
    const allSchemes = storePresentationSettings.allSchemes;
    const SchemeNames = [
        _t.txtScheme1, _t.txtScheme2, _t.txtScheme3, _t.txtScheme4, _t.txtScheme5,
        _t.txtScheme6, _t.txtScheme7, _t.txtScheme8, _t.txtScheme9, _t.txtScheme10,
        _t.txtScheme11, _t.txtScheme12, _t.txtScheme13, _t.txtScheme14, _t.txtScheme15,
        _t.txtScheme16, _t.txtScheme17, _t.txtScheme18, _t.txtScheme19, _t.txtScheme20,
        _t.txtScheme21, _t.txtScheme22
    ];

    return (
        <Page>
            <Navbar title={_t.textColorSchemes} backLink={_t.textBack} />
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