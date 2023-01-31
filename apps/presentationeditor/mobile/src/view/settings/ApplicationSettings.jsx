import React, {Fragment, useState} from "react";
import { observer, inject } from "mobx-react";
import {f7, Page, Navbar, List, ListItem, BlockTitle, Toggle } from "framework7-react";
import { useTranslation } from "react-i18next";
import { Themes } from '../../../../../common/mobile/lib/controller/Themes.js';
import { LocalStorage } from "../../../../../common/mobile/utils/LocalStorage.mjs";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const unitMeasurement = store.unitMeasurement;
    const isSpellChecking = store.isSpellChecking;
    const [isThemeDark, setIsThemeDark] = useState(Themes.isCurrentDark);

    const changeMeasureSettings = value => {
        store.changeUnitMeasurement(value);
        props.setUnitMeasurement(value);
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
            <List>
                <ListItem title={t('View.Settings.textDarkTheme')}>
                    <Toggle checked={isThemeDark}
                            onToggleChange={() => {Themes.switchDarkTheme(!isThemeDark), setIsThemeDark(!isThemeDark)}}>
                    </Toggle>
                </ListItem>
            </List>
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

const ApplicationSettings = inject("storeApplicationSettings", "storeAppOptions")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));

export {ApplicationSettings, MacrosSettings};