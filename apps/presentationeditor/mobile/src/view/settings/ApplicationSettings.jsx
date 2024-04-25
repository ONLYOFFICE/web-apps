import React, { Fragment } from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, Block } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const unitMeasurement = storeApplicationSettings.unitMeasurement;
    const isSpellChecking = storeApplicationSettings.isSpellChecking;
    const directionMode = storeApplicationSettings.directionMode;
    const newDirectionMode = directionMode !== 'ltr' ? 'ltr' : 'rtl';

    const changeMeasureSettings = value => {
        storeApplicationSettings.changeUnitMeasurement(value);
        props.setUnitMeasurement(value);
    };

    // set mode
    const appOptions = props.storeAppOptions;
    const storeThemes = props.storeThemes;
    const colorTheme = storeThemes.colorTheme;
    const themes = storeThemes.themes;
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
                                        storeApplicationSettings.changeSpellCheck(!isSpellChecking);
                                        props.switchSpellCheck(!isSpellChecking);
                                    }}
                            />
                        </ListItem>
                    </List>
                </Fragment>
            }
            {!!isConfigSelectTheme &&
                <List mediaList>
                    <ListItem title={t("Common.Themes.textTheme")} after={themes[typeTheme].text} link="/theme-settings/" routeProps={{
                        changeTheme: props.changeTheme,
                    }}></ListItem>
                </List>
            }
            <List mediaList>
                <ListItem title={_t.textMacrosSettings} link="/macros-settings/" routeProps={{
                    setMacrosSettings: props.setMacrosSettings
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
}

const PageMacrosSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const macrosMode = storeApplicationSettings.macrosMode;

    const changeMacros = value => {
        storeApplicationSettings.changeMacrosSettings(value);
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