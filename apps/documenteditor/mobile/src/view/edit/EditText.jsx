import React, {Fragment, useEffect, useState } from 'react';
import {observer, inject} from "mobx-react";
import {f7, Swiper, View, SwiperSlide, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import HighlightColorPalette from '../../../../../common/mobile/lib/component/HighlightColorPalette.jsx';
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage';

const PageFonts = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const size = storeTextSettings.fontSize;
    const displaySize = typeof size === 'undefined' ? t('Edit.textAuto') : size + ' ' + t('Edit.textPt');
    const curFontName = storeTextSettings.fontName;
    const fonts = storeTextSettings.fontsArray;
    const iconWidth = storeTextSettings.iconWidth;
    const iconHeight = storeTextSettings.iconHeight;
    const thumbs = storeTextSettings.thumbs;
    const thumbIdx = storeTextSettings.thumbIdx;
    const thumbCanvas = storeTextSettings.thumbCanvas;
    const thumbContext = storeTextSettings.thumbContext;
    const spriteCols = storeTextSettings.spriteCols;
    const spriteThumbs = storeTextSettings.spriteThumbs;
    const arrayRecentFonts = storeTextSettings.arrayRecentFonts;

    const addRecentStorage = () => {
        setRecent(getImageUri(arrayRecentFonts));
        LocalStorage.setItem('dde-settings-recent-fonts', JSON.stringify(arrayRecentFonts));
    };

    const getImageUri = fonts => {
        return fonts.map(font => {
            thumbContext.clearRect(0, 0, thumbs[thumbIdx].width, thumbs[thumbIdx].height);
            thumbContext.drawImage(spriteThumbs, 0, -thumbs[thumbIdx].height * Math.floor(font.imgidx / spriteCols));

            return thumbCanvas.toDataURL();
        });
    };

    const [stateRecent, setRecent] = useState(() => getImageUri(arrayRecentFonts));
    const [vlFonts, setVlFonts] = useState({
        vlData: {
            items: [],
        }
    });

    const renderExternal = (vl, vlData) => {
        setVlFonts((prevState) => {
            let fonts = [...prevState.vlData.items];
            fonts.splice(vlData.fromIndex, vlData.toIndex, ...vlData.items);

            let images = getImageUri(fonts);

            return {vlData: {
                    items: fonts,
                    images,
                }}
        });
    };

    return (
        <Page>
            <Navbar title={t('Edit.textFonts')} backLink={t('Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={t('Edit.textSize')}>
                    {!isAndroid && <div slot='after-start'>{displaySize}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.changeFontSize(size, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{displaySize}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.changeFontSize(size, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{t('Edit.textFonts')}</BlockTitle>
            {!!arrayRecentFonts.length &&
                <List>
                    {arrayRecentFonts.map((item, index) => (
                        <ListItem className="font-item" key={index} radio checked={curFontName === item.name} onClick={() => {
                            storeTextSettings.changeFontFamily(item.name); 
                            props.changeFontFamily(item.name);
                        }}> 
                            <img src={stateRecent[index]} style={{width: `${iconWidth}px`, height: `${iconHeight}px`}} />
                        </ListItem>
                    ))}
                </List>
            }
            <List virtualList virtualListParams={{
                items: fonts,
                renderExternal: renderExternal
            }}>
                <ul>
                    {vlFonts.vlData.items.map((item, index) => (
                        <ListItem className="font-item" key={index} radio checked={curFontName === item.name} onClick={() => {
                            storeTextSettings.changeFontFamily(item.name); 
                            props.changeFontFamily(item.name);
                            storeTextSettings.addFontToRecent(item); 
                            addRecentStorage();
                        }}>
                            <img src={vlFonts.vlData.images[index]} style={{width: `${iconWidth}px`, height: `${iconHeight}px`}} />
                        </ListItem>
                    ))}
                </ul>
            </List>
        </Page>
    )
};

const PageAdditionalFormatting = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const paragraph = storeFocusObjects.paragraphObject;
    let isStrikeout, isDStrikeout, isSmallCaps, isAllCaps, letterSpacing;
    if (paragraph) {
        isStrikeout = paragraph.get_Strikeout();
        isDStrikeout = paragraph.get_DStrikeout();
        isSmallCaps = paragraph.get_SmallCaps();
        isAllCaps = paragraph.get_AllCaps();
        letterSpacing = Common.Utils.Metric.fnRecalcFromMM(paragraph.get_TextSpacing());
    }
    const isSuperscript = storeTextSettings.isSuperscript;
    const isSubscript = storeTextSettings.isSubscript;
    if (!paragraph && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
    return(
        <Page>
            <Navbar title={t('Edit.textAdditional')} backLink={t('Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={t('Edit.textStrikethrough')} radio checked={isStrikeout} onClick={() => {props.onAdditionalStrikethrough('strikeout', !isStrikeout)}}/>
                <ListItem title={t('Edit.textDoubleStrikethrough')} radio checked={isDStrikeout} onClick={() => {props.onAdditionalStrikethrough('dbStrikeout', !isDStrikeout)}}/>
                <ListItem title={t('Edit.textSuperscript')} radio checked={isSuperscript} onClick={() => {props.onAdditionalScript('superscript', !isSuperscript)}}/>
                <ListItem title={t('Edit.textSubscript')} radio checked={isSubscript} onClick={() => {props.onAdditionalScript('subscript', !isSubscript)}}/>
                <ListItem title={t('Edit.textSmallCaps')} radio checked={isSmallCaps} onClick={() => {props.onAdditionalCaps('small', !isSmallCaps)}}/>
                <ListItem title={t('Edit.textAllCaps')} radio checked={isAllCaps} onClick={() => {props.onAdditionalCaps('all', !isAllCaps)}}/>
            </List>
            <List>
                <ListItem title={t('Edit.textLetterSpacing')}>
                    {!isAndroid && <div slot='after-start'>{(Number.isInteger(letterSpacing) ? letterSpacing : letterSpacing.toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName()}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.changeLetterSpacing(letterSpacing, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{(Number.isInteger(letterSpacing) ? letterSpacing : letterSpacing.toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName()}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.changeLetterSpacing(letterSpacing, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
        </Page>
    )
};

const PageBullets = observer(props => {
    const { t } = useTranslation();
    const bulletArrays = [
        [
            {type: -1, thumb: ''},
            {type: 1, thumb: 'bullet-01.png'},
            {type: 2, thumb: 'bullet-02.png'},
            {type: 3, thumb: 'bullet-03.png'}
        ],
        [
            {type: 4, thumb: 'bullet-04.png'},
            {type: 5, thumb: 'bullet-05.png'},
            {type: 6, thumb: 'bullet-06.png'},
            {type: 7, thumb: 'bullet-07.png'}
        ]
    ];
    const storeTextSettings = props.storeTextSettings;
    const typeBullets = storeTextSettings.typeBullets;
    
    return(
        <View className='bullets dataview'>
            {bulletArrays.map((bullets, index) => (
                    <List className="row" style={{listStyle: 'none'}} key={'bullets-' + index}>
                        {bullets.map((bullet) => (
                            <ListItem key={'bullet-' + bullet.type} data-type={bullet.type} className={(bullet.type === typeBullets) && 
                                (storeTextSettings.listType === 0 || storeTextSettings.listType === -1) ? 'active' : ''}
                                onClick={() => {
                                    storeTextSettings.resetBullets(bullet.type);
                                    props.onBullet(bullet.type);
                                }}>
                                {bullet.thumb.length < 1 ?
                                    <Icon className="thumb" style={{position: 'relative'}}>
                                        <label>{t('Edit.textNone')}</label>
                                    </Icon> :
                                    <Icon className="thumb" style={{backgroundImage: `url('resources/img/bullets/${bullet.thumb}')`}}></Icon>
                                }
                            </ListItem>
                        ))}
                    </List>
            ))}
        </View>
    )
});

const PageNumbers = observer(props => {
    const { t } = useTranslation();
    const numberArrays = [
        [
            {type: -1, thumb: ''},
            {type: 4, thumb: 'number-01.png'},
            {type: 5, thumb: 'number-02.png'},
            {type: 6, thumb: 'number-03.png'}
        ],
        [
            {type: 1, thumb: 'number-04.png'},
            {type: 2, thumb: 'number-05.png'},
            {type: 3, thumb: 'number-06.png'},
            {type: 7, thumb: 'number-07.png'}
        ]
    ];

    const storeTextSettings = props.storeTextSettings;
    const typeNumbers = storeTextSettings.typeNumbers;
    
    return(
        <View className='numbers dataview'>
            {numberArrays.map((numbers, index) => (
                <List className="row" style={{listStyle: 'none'}} key={'numbers-' + index}>
                    {numbers.map((number) => (
                        <ListItem key={'number-' + number.type} data-type={number.type} className={(number.type === typeNumbers) && 
                            (storeTextSettings.listType === 1 || storeTextSettings.listType === -1) ? 'active' : ''}
                            onClick={() => {
                                storeTextSettings.resetNumbers(number.type);
                                props.onNumber(number.type);
                            }}>
                            {number.thumb.length < 1 ?
                                <Icon className="thumb" style={{position: 'relative'}}>
                                    <label>{t('Edit.textNone')}</label>
                                </Icon> :
                                <Icon className="thumb" style={{backgroundImage: `url('resources/img/numbers/${number.thumb}')`}}></Icon>
                            }
                        </ListItem>
                    ))}
                </List>
            ))}
        </View>
    )
});

const PageMultiLevel = observer(props => {
    const { t } = useTranslation();
    
    const arrayMultiLevel = [
        {type: -1, thumb: ''},
        {type: 1, thumb: 'multi-bracket.png'},
        {type: 2, thumb: 'multi-dot.png'},
        {type: 3, thumb: 'multi-bullets.png'},
    ];

    const storeTextSettings = props.storeTextSettings;
    const typeMultiLevel = storeTextSettings.typeMultiLevel;

    return(
        <View className='multilevels dataview'>
                <List className="row" style={{listStyle: 'none'}}>
                    {arrayMultiLevel.map((item) => (
                        <ListItem 
                        key={'multi-level-' + item.type} 
                        data-type={item.type} 
                        className={item.type === typeMultiLevel && storeTextSettings.listType === -1  ? 'active' : ''}
                        onClick={() => props.onMultiLevelList(item.type)}>
                            {item.thumb.length < 1 ?
                                <Icon className="thumb" style={{position: 'relative'}}>
                                    <label>{t('Edit.textNone')}</label>
                                </Icon> :
                                <Icon className="thumb" style={{backgroundImage: `url('resources/img/multilevels/${item.thumb}')`}}></Icon>
                            }
                        </ListItem>
                    ))}
                </List>
        </View>
    )
        
});

const PageBulletsAndNumbers = props => {
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    
    return (
        <Page className="bullets-numbers">
            <Navbar title={t('Edit.textBulletsAndNumbers')} backLink={t('Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <Swiper pagination>
                <SwiperSlide> 
                    <PageNumbers storeTextSettings={storeTextSettings} onNumber={props.onNumber} />
                </SwiperSlide> 
                <SwiperSlide>
                    <PageBullets storeTextSettings={storeTextSettings} onBullet={props.onBullet} />
                </SwiperSlide>
                <SwiperSlide> 
                    <PageMultiLevel storeTextSettings={storeTextSettings} onMultiLevelList={props.onMultiLevelList} />
                </SwiperSlide>
            </Swiper>
        </Page>
    )
}

const PageLineSpacing = props => {
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const lineSpacing = storeTextSettings.lineSpacing;
    return(
        <Page>
            <Navbar title={t('Edit.textLineSpacing')} backLink={t('Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem radio checked={lineSpacing === 1.0} title={1.0} onClick={() => {props.onLineSpacing(1.0)}}></ListItem>
                <ListItem radio checked={lineSpacing === 1.15} title={1.15} onClick={() => {props.onLineSpacing(1.15)}}></ListItem>
                <ListItem radio checked={lineSpacing === 1.5} title={1.5} onClick={() => {props.onLineSpacing(1.5)}}></ListItem>
                <ListItem radio checked={lineSpacing === 2.0} title={2.0} onClick={() => {props.onLineSpacing(2.0)}}></ListItem>
                <ListItem radio checked={lineSpacing === 2.5} title={2.5} onClick={() => {props.onLineSpacing(2.5)}}></ListItem>
                <ListItem radio checked={lineSpacing === 3.0} title={3.0} onClick={() => {props.onLineSpacing(3.0)}}></ListItem>
            </List>
        </Page>
    )
};

const PageCustomFontColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const store = props.storeTextSettings;
    let textColor = store.textColor;
    if (typeof textColor === 'object') {
        textColor = textColor.color;
    }
    const autoColor = textColor === 'auto' ? window.getComputedStyle(document.getElementById('font-color-auto')).backgroundColor : null;
    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onTextColor(color);
        props.f7router.back();
    };
    return(
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker autoColor={autoColor} currentColor={textColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageFontColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const textColor = props.storeTextSettings.textColor;
    const customColors = props.storePalette.customColors;
    const changeColor = (color, effectId) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                props.onTextColor({color: color, effectId: effectId});
            } else {
                props.onTextColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-text-custom-font-color/', {props: {onTextColor: props.onTextColor}});
        }
    };
    return(
        <Page>
            <Navbar title={_t.textFontColors} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem className={'item-color-auto' + (textColor === 'auto' ? ' active' : '')} title={_t.textAutomatic} onClick={() => {
                    props.onTextColorAuto();
                }}>
                    <div slot="media">
                        <div id='font-color-auto' className={'color-auto'}></div>
                    </div>
                </ListItem>
            </List>
            <ThemeColorPalette changeColor={changeColor} curColor={textColor} customColors={customColors}/>
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-text-custom-font-color/'} routeProps={{
                    onTextColor: props.onTextColor
                }}></ListItem>
            </List>
        </Page>
    )
};

const PageCustomBackColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    let backgroundColor = props.storeTextSettings.backgroundColor;
    if (typeof backgroundColor === 'object') {
        backgroundColor = backgroundColor.color;
    }
    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onBackgroundColor(color);
        props.f7router.back();
    };
    return(
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker currentColor={backgroundColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageHighlightColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const highlightColor = props.storeTextSettings.highlightColor;

    const changeColor = (color, effectId) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                props.onHighlightColor({color: color, effectId: effectId});
            } else {
                props.onHighlightColor(color);
            }
        }
    };

    return (
        <Page>
            <Navbar title={_t.textHighlightColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <HighlightColorPalette changeColor={changeColor} curColor={highlightColor} />
        </Page>
    )
};

const EditText = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const storeTextSettings = props.storeTextSettings;
    const fontName = storeTextSettings.fontName || t('Edit.textFonts');
    const fontSize = storeTextSettings.fontSize;
    const fontColor = storeTextSettings.textColor;
    const highlightColor = storeTextSettings.highlightColor;
    const displaySize = typeof fontSize === 'undefined' ? t('Edit.textAuto') : fontSize + ' ' + t('Edit.textPt');
    const isBold = storeTextSettings.isBold;
    const isItalic = storeTextSettings.isItalic;
    const isUnderline = storeTextSettings.isUnderline;
    const isStrikethrough = storeTextSettings.isStrikethrough;
    const paragraphAlign = storeTextSettings.paragraphAlign;

    let previewList;
    switch(storeTextSettings.listType) {
        case -1: 
            previewList = '';
            break;
        case 0: 
            previewList = t('Edit.textBullets');
            break;
        case 1: 
            previewList = t('Edit.textNumbers');
            break;
    }

    const fontColorPreview = fontColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fontColor === "object" ? fontColor.color : fontColor)}`}}></span> :
        <span className="color-preview auto"></span>;

    const highlightColorPreview = highlightColor !== 'transparent' ?
        <span className="color-preview" style={{ background: `#${(typeof highlightColor === "object" ? highlightColor.color : highlightColor)}`}}></span> :
        <span className="color-preview"></span>;

    return (
        <Fragment>
            <List>
                <ListItem title={fontName} link="/edit-text-fonts/" after={displaySize} routeProps={{
                    changeFontSize: props.changeFontSize,
                    changeFontFamily: props.changeFontFamily
                }}/>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => { props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                        <a className={'button' + (isStrikethrough ? ' active' : '')} onClick={() => {props.toggleStrikethrough(!isStrikethrough)}} style={{textDecoration: "line-through"}}>S</a>
                    </Row>
                </ListItem>
                <ListItem title={t("Edit.textFontColor")} link="/edit-text-font-color/" routeProps={{
                    onTextColorAuto: props.onTextColorAuto,
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                        fontColorPreview
                    }
                </ListItem>
                <ListItem title={t("Edit.textHighlightColor")} link="/edit-text-highlight-color/" routeProps={{
                    onHighlightColor: props.onHighlightColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-selection">{highlightColorPreview}</Icon> : highlightColorPreview
                    }
                </ListItem>
                <ListItem title={t("Edit.textAdditionalFormatting")} link="/edit-text-add-formatting/" routeProps={{
                    onAdditionalStrikethrough: props.onAdditionalStrikethrough,
                    onAdditionalCaps: props.onAdditionalCaps,
                    onAdditionalScript: props.onAdditionalScript,
                    changeLetterSpacing: props.changeLetterSpacing
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-text-additional"></Icon>}
                </ListItem>
            </List>
            <List>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (paragraphAlign === 'left' ? ' active' : '')} onClick={() => {props.onParagraphAlign('left')}}>
                            <Icon slot="media" icon="icon-text-align-left"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'center' ? ' active' : '')} onClick={() => {props.onParagraphAlign('center')}}>
                            <Icon slot="media" icon="icon-text-align-center"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'right' ? ' active' : '')} onClick={() => {props.onParagraphAlign('right')}}>
                            <Icon slot="media" icon="icon-text-align-right"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'just' ? ' active' : '')} onClick={() => {props.onParagraphAlign('just')}}>
                            <Icon slot="media" icon="icon-text-align-just"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem className='buttons'>
                    <Row>
                        <a className='button item-link' onClick={() => {props.onParagraphMove(true)}}>
                            <Icon slot="media" icon="icon-de-indent"></Icon>
                        </a>
                        <a className='button item-link' onClick={() => {props.onParagraphMove(false)}}>
                            <Icon slot="media" icon="icon-in-indent"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem title={t('Edit.textBulletsAndNumbers')} link='/edit-bullets-and-numbers/' routeProps={{
                    onBullet: props.onBullet,
                    onNumber: props.onNumber,
                    onMultiLevelList: props.onMultiLevelList
                }}>
                    <div className="preview">{previewList}</div>
                    {!isAndroid && <Icon slot="media" icon="icon-bullets"></Icon>}
                </ListItem>
                <ListItem title={t("Edit.textLineSpacing")} link='/edit-text-line-spacing/' routeProps={{
                    onLineSpacing: props.onLineSpacing
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-linespacing"></Icon>}
                </ListItem>
            </List>
            </Fragment>
        )
};

const EditTextContainer = inject("storeTextSettings", "storeFocusObjects")(observer(EditText));
const PageTextFonts = inject("storeTextSettings", "storeFocusObjects")(observer(PageFonts));
const PageTextAddFormatting = inject("storeTextSettings", "storeFocusObjects")(observer(PageAdditionalFormatting));
const PageTextBulletsAndNumbers = inject("storeTextSettings")(observer(PageBulletsAndNumbers));
const PageTextLineSpacing = inject("storeTextSettings")(observer(PageLineSpacing));
const PageTextFontColor = inject("storeTextSettings", "storePalette")(observer(PageFontColor));
const PageTextCustomFontColor = inject("storeTextSettings", "storePalette")(observer(PageCustomFontColor));
const PageTextHighlightColor = inject("storeTextSettings")(observer(PageHighlightColor));

export {
    EditTextContainer as EditText,
    PageTextFonts,
    PageTextAddFormatting,
    PageTextBulletsAndNumbers,
    PageTextLineSpacing,
    PageTextFontColor,
    PageTextCustomFontColor,
    PageTextHighlightColor,
    // PageTextCustomBackColor
};