import React, {Fragment, useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, Icon, f7 } from "framework7-react";
import { useTranslation } from "react-i18next";
import { Themes } from '../../../../../common/mobile/lib/controller/Themes.js';

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
    const [isThemeDark, setIsThemeDark] = useState(Themes.isCurrentDark);

    const changeMeasureSettings = value => {
        storeApplicationSettings.changeUnitMeasurement(value);
        props.unitMeasurementChange(value);
    };

    // set mode
    const appOptions = props.storeAppOptions;
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
                    <ListItem title={t('View.Settings.textDarkTheme')}>
                        <Toggle checked={isThemeDark}
                            onToggleChange={() => {Themes.switchDarkTheme(!isThemeDark), setIsThemeDark(!isThemeDark)}}>
                        </Toggle>
                    </ListItem>
                </List>

                {/*<List mediaList>*/}
                {/*    <ListItem title={t("View.Settings.textDirection")} link="/direction/" routeProps={{changeDirection: props.changeDirection}}></ListItem>*/}
                {/*</List>*/}
            {/* } */}
            {/* {_isShowMacros && */}
                <List>
                    <ListItem title={_t.textMacrosSettings} link="/macros-settings/" routeProps={{
                        onChangeMacrosSettings: props.onChangeMacrosSettings
                    }}></ListItem>
                </List>
            {/* } */}
        </Page>
    );
};

const PageDirection = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const directionMode = store.directionMode;

    const changeDirection = value => {
        store.changeDirectionMode(value);
        props.changeDirection(value);

        f7.dialog.create({
            title: _t.notcriticalErrorTitle,
            text: t('View.Settings.textRestartApplication'),
            buttons: [
                {
                    text: _t.textOk
                }
            ]
        }).open();
    };

    return (
        <Page>
            <Navbar title={t('View.Settings.textDirection')} backLink={_t.textBack} />
            <List mediaList>
                <ListItem radio name="direction" title={t('View.Settings.textLeftToRight')} checked={directionMode === 'ltr'} onChange={() => changeDirection('ltr')}></ListItem>
                <ListItem radio name="direction" title={t('View.Settings.textRightToLeft')} checked={directionMode === 'rtl'} onChange={() => changeDirection('rtl')}></ListItem>
            </List>
        </Page>
    );
}

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

const ApplicationSettings = inject("storeApplicationSettings", "storeAppOptions")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));
const RegionalSettings = inject("storeApplicationSettings")(observer(PageRegionalSettings));
const FormulaLanguage = inject("storeApplicationSettings")(observer(PageFormulaLanguage));
const Direction = inject("storeApplicationSettings")(observer(PageDirection));

export {
    ApplicationSettings, 
    MacrosSettings,
    RegionalSettings,
    FormulaLanguage,
    Direction
};