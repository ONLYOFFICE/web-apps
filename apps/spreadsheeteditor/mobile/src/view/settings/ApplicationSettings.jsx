import React, { Fragment } from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, Icon, f7, Block } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const unitMeasurement = storeApplicationSettings.unitMeasurement;
    const formulaLang = storeApplicationSettings.formulaLang;
    const regData = storeApplicationSettings.regData;
    const regCode = storeApplicationSettings.regCode;
    const regExample = storeApplicationSettings.regExample;
    const formulaLangsColection = storeApplicationSettings.formulaLangsColection;
    const defineFormulaLang = () => formulaLangsColection.find(obj => obj.value === formulaLang);
    const currentFormulaLang = defineFormulaLang();
    const defineRegSetting = () => regData.find(obj => regCode === obj.code);
    const currentRegSetting = defineRegSetting();
    const isRefStyle = storeApplicationSettings.isRefStyle;
    const isComments = storeApplicationSettings.isComments;
    const isResolvedComments = storeApplicationSettings.isResolvedComments;
    const directionMode = storeApplicationSettings.directionMode;
    const newDirectionMode = directionMode !== 'ltr' ? 'ltr' : 'rtl';

    const changeMeasureSettings = value => {
        storeApplicationSettings.changeUnitMeasurement(value);
        props.unitMeasurementChange(value);
    };

    // set mode
    const appOptions = props.storeAppOptions;   
    const storeThemes = props.storeThemes;
    const colorTheme = storeThemes.colorTheme;
    const themes = storeThemes.themes;
    const isConfigSelectTheme = storeThemes.isConfigSelectTheme;
    const typeTheme = colorTheme.type;
    const _isEdit = appOptions.isEdit;
    // const _isShowMacros = (!appOptions.isDisconnected && appOptions.customization) ? appOptions.customization.macros !== false : true;

    return (
        <Page>
            <Navbar title={_t.textApplicationSettings} backLink={_t.textBack} />
            {_isEdit &&
                <Fragment>
                    <BlockTitle>{_t.textUnitOfMeasurement}</BlockTitle>
                    <List>
                        <ListItem radio radioIcon="end" title={_t.textCentimeter} name="unit-of-measurement" checked={unitMeasurement === 0}
                            onChange={() => changeMeasureSettings(0)}></ListItem>
                        <ListItem radio radioIcon="end" title={_t.textPoint} name="unit-of-measurement" checked={unitMeasurement === 1}
                            onChange={() => changeMeasureSettings(1)}></ListItem>
                        <ListItem radio radioIcon="end" title={_t.textInch} name="unit-of-measurement" checked={unitMeasurement === 2}
                            onChange={() => changeMeasureSettings(2)}></ListItem>
                    </List>
                    <BlockTitle>{_t.textFormulaLanguage}</BlockTitle>
                    <List mediaList>
                        <ListItem title={currentFormulaLang.displayValue} subtitle={`${t('View.Settings.textExample')}: ${currentFormulaLang.exampleValue}`} link="/formula-languages/" 
                            routeProps={{
                                onFormulaLangChange: props.onFormulaLangChange
                            }}>
                        </ListItem>
                    </List>
                    <BlockTitle>{_t.textRegionalSettings}</BlockTitle>
                    <List mediaList>
                        <ListItem title={currentRegSetting.displayName} subtitle={`${t('View.Settings.textExample')}: ${regExample}`} link="/regional-settings/" routeProps={{
                            onRegSettings: props.onRegSettings
                        }}></ListItem>
                    </List>
                </Fragment>
            }
                <BlockTitle>{_t.textCommentingDisplay}</BlockTitle>
                <List>
                    <ListItem title={_t.textComments}>
                        <Toggle checked={isComments}
                                onToggleChange={() => {
                                    storeApplicationSettings.changeDisplayComments(!isComments);
                                    props.onChangeDisplayComments(!isComments);
                                }}
                        />
                    </ListItem>
                    <ListItem title={_t.textResolvedComments}>
                        <Toggle checked={isResolvedComments} disabled={!isComments}
                                onToggleChange={() => {
                                    storeApplicationSettings.changeDisplayResolved(!isResolvedComments);
                                    props.onChangeDisplayResolved(!isResolvedComments);
                                }}
                        />
                    </ListItem>
                </List>
                <List>
                    <ListItem title={_t.textR1C1Style}>
                        <Toggle checked={isRefStyle}
                                onToggleChange={() => {
                                    storeApplicationSettings.changeRefStyle(!isRefStyle);
                                    props.clickR1C1Style(!isRefStyle);
                                }}
                        />
                    </ListItem>
                </List>
                {!!isConfigSelectTheme &&
                    <List mediaList>
                        <ListItem title={t("Common.Themes.textTheme")} after={themes[typeTheme].text} link="/theme-settings/" routeProps={{
                            changeTheme: props.changeTheme,
                        }}></ListItem>
                    </List>
                }
                <List>
                    <ListItem title={_t.textMacrosSettings} link="/macros-settings/" routeProps={{
                        onChangeMacrosSettings: props.onChangeMacrosSettings
                    }}></ListItem>
                </List>
                {Common.Locale.isCurrentLangRtl &&
                    <>
                        <List>
                            <ListItem>
                                <div>
                                    <span>{t("View.Settings.textRtlInterface")}</span>
                                    <span className="beta-badge">Beta</span>
                                </div>
                                <Toggle checked={directionMode !== 'ltr'}
                                        onToggleChange={() => {
                                            storeApplicationSettings.changeDirectionMode(newDirectionMode);
                                            props.changeDirectionMode(newDirectionMode);
                                        }}
                                />
                            </ListItem>
                        </List>
                        <Block>
                            <p>{t('View.Settings.textExplanationChangeDirection')}</p>
                        </Block>
                    </>
                }
        </Page>
    );
};

const PageThemeSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeThemes = props.storeThemes;
    const colorTheme = storeThemes.colorTheme;
    const typeTheme = colorTheme.type;
    const themes = storeThemes.themes;

    return (
        <Page>
            <Navbar title={t('Common.Themes.textTheme')} backLink={_t.textBack} />
            <List>
                {Object.keys(themes).map((key, index) => {
                    return (
                        <ListItem key={index} radio checked={typeTheme === themes[key].type} onChange={() => props.changeTheme(key)} name={themes[key].id} title={themes[key].text}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
};

const PageRegionalSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const regData = storeApplicationSettings.regData;
    const regCode = storeApplicationSettings.regCode;
    
    return (
        <Page className="regional-settings">
            <Navbar title={_t.textRegionalSettings} backLink={_t.textBack} />
            <List>
                {regData.length ? regData.map((elem, index) => {
                    return (
                        <ListItem key={index} radio checked={elem.code === regCode} onChange={() => {
                            storeApplicationSettings.changeRegCode(elem.code);
                            props.onRegSettings(elem.code);
                        }}>
                            <div className="item-title-row">
                                <Icon slot="media" icon={`lang-flag ${elem.langName}`}></Icon>
                                <div className="item-title">{elem.displayName}</div>
                            </div> 
                        </ListItem>
                    )
                }) : null}
            </List>
        </Page>
    )
}

const PageFormulaLanguage = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const formulaLangsColection = storeApplicationSettings.formulaLangsColection;
    const formulaLang = storeApplicationSettings.formulaLang;

    return (
        <Page>
            <Navbar title={_t.textFormulaLanguage} backLink={_t.textBack} />
            <List mediaList>
                {formulaLangsColection.map((elem, index) => {
                    return (
                        <ListItem radio key={index} title={elem.displayValue} subtitle={`${t('View.Settings.textExample')}: ${elem.exampleValue}`} checked={elem.value === formulaLang}
                            onChange={() => {
                                storeApplicationSettings.changeFormulaLang(elem.value);
                                props.onFormulaLangChange(elem.value);
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageMacrosSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const macrosMode = storeApplicationSettings.macrosMode;

    const changeMacros = value => {
        storeApplicationSettings.changeMacrosSettings(value);
        props.onChangeMacrosSettings(value);
    };

    return (
        <Page>
            <Navbar title={_t.textMacrosSettings} backLink={_t.textBack} />
            <List mediaList>
                <ListItem radio name="macros-settings" title={_t.textDisableAll} text={_t.textDisableAllMacrosWithoutNotification} 
                    checked={macrosMode === 2} onChange={() => changeMacros(2)}></ListItem>
                <ListItem radio name="macros-settings" title={_t.textShowNotification} text={_t.textDisableAllMacrosWithNotification}
                    checked={macrosMode === 0} onChange={() => changeMacros(0)}></ListItem>
                <ListItem radio name="macros-settings" title={_t.textEnableAll} text={_t.textEnableAllMacrosWithoutNotification}
                    checked={macrosMode === 1} onChange={() => changeMacros(1)}></ListItem>
            </List>
        </Page>
    );
};

const ApplicationSettings = inject("storeApplicationSettings", "storeAppOptions", "storeThemes")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));
const RegionalSettings = inject("storeApplicationSettings")(observer(PageRegionalSettings));
const FormulaLanguage = inject("storeApplicationSettings")(observer(PageFormulaLanguage));
const ThemeSettings = inject("storeThemes")(observer(PageThemeSettings));

export {
    ApplicationSettings, 
    MacrosSettings,
    RegionalSettings,
    FormulaLanguage,
    ThemeSettings
};