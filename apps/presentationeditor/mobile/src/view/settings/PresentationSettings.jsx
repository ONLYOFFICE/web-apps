import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PagePresentationSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const store = props.storePresentationSettings;
    const slideSizeArr = store.getSlideSizes();
    console.log(slideSizeArr);
    const widthSlide = store.widthSlide;
    const heightSlide = store.heightSlide;
    const slideSize = store.slideSize;
    console.log(widthSlide, heightSlide);
  
    return (
        <Page>
            <Navbar title={_t.textPresentationSettings} backLink={_t.textBack} />
            {slideSizeArr.length ? (
                <Fragment>
                    <BlockTitle>{_t.textSlideSize}</BlockTitle>
                    <List>
                        {/* {slideSizeArr.map((size, index) => {
                            if(Math.abs(size[0] - widthSlide) < 0.001 && Math.abs(size[1] - heightSlide) < 0.001) {
                                console.log(true);
                                return (
                                    <ListItem radio name="slide-size" value={index} title={index === 0 ? _t.mniSlideStandard : _t.mniSlideWide}></ListItem>
                                )
                            }
                        })} */}
                        <ListItem radio name="slide-size" value="0" checked={slideSize === 0} 
                            onChange={() => {
                                props.onSlideSize(0, slideSizeArr);
                                store.changeSlideFormat(0);
                            }} title={_t.mniSlideStandard}></ListItem>
                        <ListItem radio name="slide-size" value="1" checked={slideSize === 1} 
                            onChange={() => {
                                props.onSlideSize(1, slideSizeArr);
                                store.changeSlideFormat(1);
                            }} title={_t.mniSlideWide}></ListItem>
                    </List>
                </Fragment>
            ): null}
               
            <List mediaList>
                <ListItem title={_t.textColorSchemes} link="/color-schemes/"></ListItem>
            </List>
        </Page>
    )
}

const PagePresentationColorSchemes = props => {
    const { t } = useTranslation();
    // const curScheme = props.initPageColorSchemes();
    // const [stateScheme, setScheme] = useState(curScheme);
    const _t = t('View.Settings', {returnObjects: true});
    // const storeSettings = props.storeDocumentSettings;
    // const allSchemes = storeSettings.allSchemes;

    return (
        <Page>
            <Navbar title={_t.textColorSchemes} backLink={_t.textBack} />
            {/* <List>
                {
                    allSchemes ? allSchemes.map((scheme, index) => {
                        return (
                            <ListItem radio={true} className="color-schemes-menu" key={index} title={scheme.get_name()} checked={stateScheme === index} 
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
            </List> */}
        </Page>

    )
};

const PresentationSettings = inject("storePresentationSettings")(observer(PagePresentationSettings));
const PresentationColorSchemes = inject("storePresentationSettings")(observer(PagePresentationColorSchemes));

export { PresentationSettings, PresentationColorSchemes }