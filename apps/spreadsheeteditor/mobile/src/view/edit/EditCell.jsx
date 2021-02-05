import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Row, Button, Page, Navbar, Segmented, BlockTitle, NavRight, Link, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const EditCell = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    // const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeCellSettings = props.storeCellSettings;
    const cellStyles = storeCellSettings.cellStyles;
    const styleName = storeCellSettings.styleName;
    console.log(styleName);
    console.log(cellStyles);
    console.log(storeCellSettings);

    const fontInfo = storeCellSettings.fontInfo;
    console.log(fontInfo);

    const fontName = fontInfo.name || _t.textFonts;
    const fontSize = fontInfo.size;
    const fontColor = storeCellSettings.fontColor;
    const displaySize = typeof fontSize === 'undefined' ? _t.textAuto : fontSize + ' ' + _t.textPt;
    const fillColor = storeCellSettings.fillColor;
    console.log(fillColor);

    const isBold = storeCellSettings.isBold;
    const isItalic = storeCellSettings.isItalic;
    const isUnderline = storeCellSettings.isUnderline;

    const fontColorPreview = fontColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fontColor === "object" ? fontColor.color : fontColor)}`}}></span> :
        <span className="color-preview auto"></span>;
    
    const fillColorPreview = fillColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fillColor === "object" ? fillColor.color : fillColor)}`}}></span> :
        <span className="color-preview auto"></span>;

    return (
        <Fragment>
            <List>
                <ListItem title={fontName} link="/edit-cell-text-fonts/" after={displaySize} routeProps={{
                    onFontSize: props.onFontSize,
                    onFontClick: props.onFontClick
                }}/>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => {props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                    </Row>
                </ListItem>
                <ListItem title={_t.textTextColor} link="/edit-cell-text-color/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                        fontColorPreview
                    }
                </ListItem>
                <ListItem title={_t.textFillColor} link="/edit-cell-fill-color/" routeProps={{
                    onFillColor: props.onFillColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-fill-color">{fillColorPreview}</Icon> :
                        fillColorPreview
                    }
                </ListItem>
                <ListItem title={_t.textTextFormat} link="/edit-cell-text-format/" routeProps={{
                    onHAlignChange: props.onHAlignChange,
                    onVAlignChange: props.onVAlignChange,
                    onWrapTextChange: props.onWrapTextChange
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-left"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textTextOrientation} link="/edit-cell-text-orientation/" routeProps={{
                    onTextOrientationChange: props.onTextOrientationChange
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textBorderStyle} link="/edit-cell-border-style/" routeProps={{
                    onBorderStyle: props.onBorderStyle
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-table-borders-all"></Icon> : null
                    }
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textFormat} link="/edit-cell-format/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-format-general"></Icon> : null
                    }
                </ListItem>
            </List>
            <BlockTitle>{_t.textCellStyles}</BlockTitle>
            {cellStyles.length ? (
                <List className="cell-styles-list">
                    {cellStyles.map((elem, index) => {
                        return (
                            <ListItem key={index} style={{backgroundImage: `url(${elem.image})`}} 
                                className={elem.name === styleName ? "item-theme active" : "item-theme"} onClick={() => props.onStyleClick(elem.name)}>

                            </ListItem>
                        )
                    })}
                </List>
            ) : null}    
        </Fragment>
    )
};

const PageFontsCell = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const fontInfo = storeCellSettings.fontInfo;
    const size = fontInfo.size;
    const displaySize = typeof size === 'undefined' ? _t.textAuto : size + ' ' + _t.textPt;
    const curFontName = fontInfo.name;
    const fonts = storeCellSettings.fontsArray;

    const [vlFonts, setVlFonts] = useState({
        vlData: {
            items: [],
        }
    });

    const renderExternal = (vl, vlData) => {
        setVlFonts((prevState) => {
            let fonts = [...prevState.vlData.items];
            fonts.splice(vlData.fromIndex, vlData.toIndex, ...vlData.items);
            return {vlData: {
                items: fonts,
            }};
        });
    };

    return (
        <Page>
            <Navbar title={_t.textFonts} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textSize}>
                    {!isAndroid && <div slot='after-start'>{displaySize}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.onFontSize(size, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{displaySize}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.onFontSize(size, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textFonts}</BlockTitle>
            <List virtualList virtualListParams={{
                items: fonts,
                renderExternal: renderExternal
            }}>
                <ul>
                    {vlFonts.vlData.items.map((item, index) => (
                        <ListItem
                            key={index}
                            radio
                            checked={curFontName === item.name}
                            title={item.name}
                            style={{fontFamily: `${item.name}`}}
                            onClick={() => {props.onFontClick(item.name)}}
                        ></ListItem>
                    ))}
                </ul>
            </List>
        </Page>
    );
};

const PageTextColorCell = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    // const storeFocusObjects = props.storeFocusObjects;
    // const slideObject = storeFocusObjects.slideObject;
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const customColors = storePalette.customColors;
    const fontColor = storeCellSettings.fontColor;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onTextColor(newColor);
                storeCellSettings.changeFontColor(newColor);
            } else {
                props.onTextColor(color);
                storeCellSettings.changeFontColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-cell-text-custom-color/');
        }
    };
  
    return (
        <Page>
            <Navbar title={_t.textTextColor} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fontColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-cell-text-custom-color/'} routeProps={{
                    onTextColor: props.onTextColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageFillColorCell = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    // const storeFocusObjects = props.storeFocusObjects;
    // const slideObject = storeFocusObjects.slideObject;
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const customColors = storePalette.customColors;
    const fillColor = storeCellSettings.fillColor;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
                storeCellSettings.changeFillColor(newColor);
            } else {
                props.onFillColor(color);
                storeCellSettings.changeFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-cell-fill-custom-color/');
        }
    };
  
    return (
        <Page>
            <Navbar title={_t.textFillColor} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fillColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-cell-fill-custom-color/'} routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageCustomTextColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fontColor = props.storeCellSettings.fontColor;

    if (typeof fontColor === 'object') {
        fontColor = fontColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onTextColor(color);
        props.storeCellSettings.changeFontColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={fontColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageCustomFillColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fillColor = props.storeCellSettings.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        props.storeCellSettings.changeFillColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageTextFormatCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const isAndroid = Device.android;
    const storeCellSettings = props.storeCellSettings;
    const hAlignStr = storeCellSettings.hAlignStr;
    const vAlignStr = storeCellSettings.vAlignStr;
    const isWrapText = storeCellSettings.isWrapText;

    return (
        <Page>
            <Navbar title={_t.textTextFormat} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textAlignLeft} radio checked={hAlignStr === 'left'} onChange={() => {
                    props.onHAlignChange('left');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-left"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAlignCenter} radio checked={hAlignStr === 'center'} onChange={() => {
                    props.onHAlignChange('center');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-center"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAlignRight} radio checked={hAlignStr === 'right'} onChange={() => {
                    props.onHAlignChange('right');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-right"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textJustified} radio checked={hAlignStr === 'justify'} onChange={() => {
                    props.onHAlignChange('justify');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-jast"></Icon> : null
                    }
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textAlignTop} radio checked={vAlignStr === 'top'} onChange={() => {
                    props.onVAlignChange('top');
                }}>
                    {!isAndroid ? <Icon slot="media" icon="icon-text-valign-top"></Icon> : null}
                </ListItem>
                <ListItem title={_t.textAlignMiddle} radio checked={vAlignStr === 'center'} onChange={() => {
                    props.onVAlignChange('center');
                }}>
                    {!isAndroid ? <Icon slot="media" icon="icon-text-valign-middle"></Icon> : null}
                </ListItem>
                <ListItem title={_t.textAlignBottom} radio checked={vAlignStr === 'bottom'} onChange={() => {
                    props.onVAlignChange('bottom');
                }}>
                    {!isAndroid ? <Icon slot="media" icon="icon-text-valign-bottom"></Icon> : null}
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textWrapText}>
                    {!isAndroid ? <Icon slot="media" icon="icon-cell-wrap"></Icon> : null}
                    <Toggle checked={isWrapText} onChange={() => {props.onWrapTextChange(!isWrapText)}} />
                </ListItem>
            </List>
        </Page>
    )
};

const PageTextOrientationCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const isAndroid = Device.android;
    const storeCellSettings = props.storeCellSettings;
    const orientationStr = storeCellSettings.orientationStr;
   
    return (
        <Page>
            <Navbar title={_t.textTextOrientation} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textHorizontalText} radio checked={orientationStr === 'horizontal'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('horizontal');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAngleCounterclockwise} radio checked={orientationStr === 'anglecount'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-anglecount"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('anglecount');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-anglecount"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textAngleClockwise} radio checked={orientationStr === 'angleclock'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-angleclock"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('angleclock');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-angleclock"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textVerticalText} radio checked={orientationStr === 'vertical'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-vertical"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('vertical');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-vertical"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textRotateTextUp} radio checked={orientationStr === 'rotateup'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-rotateup"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('rotateup');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-rotateup"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textRotateTextDown} radio checked={orientationStr === 'rotatedown'}
                    after={isAndroid ? <Icon slot="media" icon="icon-text-orientation-rotatedown"></Icon> : null} onChange={() => {
                    props.onTextOrientationChange('rotatedown');
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-rotatedown"></Icon> : null
                    }
                </ListItem>
            </List>
        </Page>
    )
};

const PageBorderStyleCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const borderInfo = storeCellSettings.borderInfo;

    const borderSizes = {
        7: `${_t.textThin}`,
        12: `${_t.textMedium}`,
        13: `${_t.textThick}`
    };

    // const borderSizes = storeCellSettings.borderSizes;

    return (
        <Page>
            <Navbar title={_t.textBorderStyle} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNoBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('none');
                    props.onBorderStyle('none', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-none"></Icon>
                </ListItem>
                <ListItem title={_t.textAllBorders} onClick={() => {
                    storeCellSettings.changeBorderStyle('all');
                    props.onBorderStyle('all', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-all"></Icon>
                </ListItem>
                <ListItem title={_t.textBottomBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('2');
                    props.onBorderStyle('2', borderInfo);
                }}>  
                    <Icon slot="media" icon="icon-table-borders-bottom"></Icon> 
                </ListItem>
                <ListItem title={_t.textTopBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('0');
                    props.onBorderStyle('0', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-top"></Icon>  
                </ListItem>
                <ListItem title={_t.textLeftBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('3');
                    props.onBorderStyle('3', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-left"></Icon> 
                </ListItem>
                <ListItem title={_t.textRightBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('1');
                    props.onBorderStyle('1', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-right"></Icon>
                </ListItem>
                <ListItem title={_t.textInsideBorders} onClick={() => {
                    storeCellSettings.changeBorderStyle('inner');
                    props.onBorderStyle('inner', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-inner"></Icon>
                </ListItem>
                <ListItem title={_t.textInsideVerticalBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('6');
                    props.onBorderStyle('6', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-center"></Icon>
                </ListItem>
                <ListItem title={_t.textInsideHorizontalBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('7');
                    props.onBorderStyle('7', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-middle"></Icon> 
                </ListItem>
                <ListItem title={_t.textDiagonalUpBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('5');
                    props.onBorderStyle('5', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-dup"></Icon>
                </ListItem>
                <ListItem title={_t.textDiagonalDownBorder} onClick={() => {
                    storeCellSettings.changeBorderStyle('4');
                    props.onBorderStyle('4', borderInfo);
                }}>
                    <Icon slot="media" icon="icon-table-borders-ddown"></Icon>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textColor} link='/edit-border-color-cell/' routeProps={{
                    onBorderStyle: props.onBorderStyle
                }}>
                    <span className="color-preview"
                        slot="after"
                        style={{background:`#${(typeof borderInfo.color === "object" ? borderInfo.color.color : borderInfo.color)}`}}
                    ></span>
                </ListItem>
                <ListItem title={_t.textSize} link='/edit-border-size-cell/' after={borderSizes[borderInfo.width]} routeProps={{
                    onBorderStyle: props.onBorderStyle
                }}>
                </ListItem>
            </List>
        </Page>
    )
};

const PageBorderColorCell = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const borderInfo = storeCellSettings.borderInfo;
    const borderColor = typeof borderInfo.color === "object" ? borderInfo.color.color : borderInfo.color;
    const borderStyle = storeCellSettings.borderStyle;
    const customColors = storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                storeCellSettings.changeBorderColor(newColor);
                props.onBorderStyle(borderStyle, borderInfo);
            } else {
                storeCellSettings.changeBorderColor(color);
                props.onBorderStyle(borderStyle, borderInfo);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-border-custom-color-cell/');
        }
    };
  
    return (
        <Page>
            <Navbar backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={borderColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-border-custom-color-cell/'} routeProps={{
                    onBorderStyle: props.onBorderStyle
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageCustomBorderColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const storePalette = props.storePalette;
    const borderInfo = storeCellSettings.borderInfo;
    const borderColor = typeof borderInfo.color === "object" ? borderInfo.color.color : borderInfo.color;
    const borderStyle = storeCellSettings.borderStyle;
    
    const onAddNewColor = (colors, color) => {
        storePalette.changeCustomColors(colors);
        storeCellSettings.changeBorderColor(color);
        props.onBorderStyle(borderStyle, borderInfo);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={borderColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageBorderSizeCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeCellSettings = props.storeCellSettings;
    const borderInfo = storeCellSettings.borderInfo;
    const borderStyle = storeCellSettings.borderStyle;
    // const borderSizes = storeCellSettings.borderSizes;

    const borderSizes = {
        7: `${_t.textThin}`,
        12: `${_t.textMedium}`,
        13: `${_t.textThick}`
    }

    return (
        <Page>
            <Navbar title={_t.textSize} backLink={_t.textBack} />
            <List>
                {Object.keys(borderSizes).map(key => {
                    return (
                        <ListItem key={key} title={borderSizes[key]} radio checked={+key === borderInfo.width} onChange={() => {
                            storeCellSettings.changeBorderSize(+key);
                            props.onBorderStyle(borderStyle, borderInfo);
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}


const PageEditCell = inject("storeCellSettings")(observer(EditCell));
const TextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageTextColorCell));
const FillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageFillColorCell));
const CustomTextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomTextColorCell));
const CustomFillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomFillColorCell));
const FontsCell = inject("storeCellSettings")(observer(PageFontsCell));
const TextFormatCell = inject("storeCellSettings")(observer(PageTextFormatCell));
const TextOrientationCell = inject("storeCellSettings")(observer(PageTextOrientationCell));
const BorderStyleCell = inject("storeCellSettings")(observer(PageBorderStyleCell));
const BorderColorCell = inject("storeCellSettings", "storePalette")(observer(PageBorderColorCell));
const CustomBorderColorCell = inject("storeCellSettings", "storePalette")(observer(PageCustomBorderColorCell));
const BorderSizeCell = inject("storeCellSettings")(observer(PageBorderSizeCell));

export {
    PageEditCell as EditCell,
    TextColorCell,
    FillColorCell,
    CustomFillColorCell,
    CustomTextColorCell,
    FontsCell,
    TextFormatCell,
    TextOrientationCell,
    BorderStyleCell,
    BorderColorCell,
    CustomBorderColorCell,
    BorderSizeCell
};