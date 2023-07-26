import React, {Fragment, useState} from "react";
import { observer, inject } from "mobx-react";
import {f7, Page, Navbar, List, ListItem, BlockTitle, Toggle } from "framework7-react";
import { useTranslation } from "react-i18next";
import { LocalStorage } from "../../../../../common/mobile/utils/LocalStorage.mjs";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const unitMeasurement = store.unitMeasurement;
    const isSpellChecking = store.isSpellChecking;

    const changeMeasureSettings = value => {
        store.changeUnitMeasurement(value);
        props.setUnitMeasurement(value);
    };

    // set mode
    const appOptions = props.storeAppOptions;
    const storeThemes = props.storeThemes;
    const colorTheme = storeThemes.colorTheme;
    const translationsThemes = props.translationsThemes;
    const typeTheme = colorTheme.type;
    const isConfigSelectTheme = storeThemes.isConfigSelectTheme;
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
                    <List>
                        <ListItem title={_t.textSpellcheck}>
                            <Toggle checked={isSpellChecking}
                                    onToggleChange={() => {
                                        store.changeSpellCheck(!isSpellChecking);
                                        props.switchSpellCheck(!isSpellChecking);
                                    }}
                            />
                        </ListItem>
                    </List>
                    {/*<RTLSetting />*/}
                </Fragment>
            }
            {!!isConfigSelectTheme &&
                <List mediaList>
                    <ListItem title={t("Common.Themes.textTheme")} after={typeTheme === 'dark' || typeTheme === 'light' ? translationsThemes[typeTheme] : translationsThemes['system']} link="/theme-settings/" routeProps={{
                        changeTheme: props.changeTheme,
                        translationsThemes
                    }}></ListItem>
                </List>
            }
            {/* {_isShowMacros && */}
            <List mediaList>
                <ListItem title={_t.textMacrosSettings} link="/macros-settings/" routeProps={{
                    setMacrosSettings: props.setMacrosSettings
                }}></ListItem>
            </List>
            {/* } */}
        </Page>
    );
};

const PageThemeSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeThemes = props.storeThemes;
    const colorTheme = storeThemes.colorTheme;
    const typeTheme = colorTheme.type;
    const translationsThemes = props.translationsThemes;

    return (
        <Page>
            <Navbar title={t('Common.Themes.textTheme')} backLink={_t.textBack} />
            <List>
                {Object.keys(translationsThemes).map((theme, index) => {
                    return (
                        <ListItem key={index} radio checked={typeTheme === theme} onChange={() => props.changeTheme(theme)} name={theme} title={translationsThemes[theme]}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const RTLSetting = () => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });

    let direction = LocalStorage.getItem('mode-direction');
    const [isRTLMode, setRTLMode] = useState(direction === 'rtl' ? true : false);

    const switchRTLMode = rtl => {
        LocalStorage.setItem("mode-direction", rtl ? 'rtl' : 'ltr');

        f7.dialog.create({
            title: t('View.Settings.notcriticalErrorTitle'),
            text: t('View.Settings.textRestartApplication'),
            buttons: [
                {
                    text: t('View.Settings.textOk')
                }
            ]
        }).open();
    }

    return (
        <List>
            <ListItem title={t('View.Settings.textRTL')}>
                <Toggle checked={isRTLMode}
                    onToggleChange={toggle => {switchRTLMode(!toggle), setRTLMode(!toggle)}}>
                </Toggle>
            </ListItem>            
        </List>
    )
}

const PageMacrosSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const macrosMode = store.macrosMode;

    const changeMacros = value => {
        store.changeMacrosSettings(value);
        props.setMacrosSettings(value);
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
const ThemeSettings = inject("storeThemes")(observer(PageThemeSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));

export {ApplicationSettings, MacrosSettings, ThemeSettings};