import React, {Fragment, useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, f7 } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeThemes = props.storeThemes;
    const displayMode = props.storeReview.displayMode;
    const store = props.storeApplicationSettings;
    const unitMeasurement = store.unitMeasurement;
    const isSpellChecking = store.isSpellChecking;
    const isNonprintingCharacters = store.isNonprintingCharacters;
    const isHiddenTableBorders = store.isHiddenTableBorders;
    const isComments = store.isComments;
    const isResolvedComments = store.isResolvedComments;

    const changeMeasureSettings = value => {
        store.changeUnitMeasurement(value);
        props.setUnitMeasurement(value);
    };

    // set mode
    const appOptions = props.storeAppOptions;
    const colorTheme = storeThemes.colorTheme;
    const translationsThemes = props.translationsThemes;
    const typeTheme = colorTheme.type;
    const isConfigSelectTheme = storeThemes.isConfigSelectTheme;
    const isViewer = appOptions.isViewer;
    const _isEdit = appOptions.isEdit;
    const _isShowMacros = (!appOptions.isDisconnected && appOptions.customization) ? appOptions.customization.macros !== false : true;

    return (
        <Page>
            <Navbar title={_t.textApplicationSettings} backLink={_t.textBack} />
            {_isEdit && !isViewer &&
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
                    <List>
                        <ListItem title={_t.textNoCharacters} disabled={displayMode !== 'markup'}>{/*ToDo: if (DisplayMode == "final" || DisplayMode == "original") {disabled} */}
                            <Toggle checked={isNonprintingCharacters}
                                    onToggleChange={() => {
                                        store.changeNoCharacters(!isNonprintingCharacters);
                                        props.switchNoCharacters(!isNonprintingCharacters);
                                    }}
                            />
                        </ListItem>
                        <ListItem title={_t.textHiddenTableBorders} disabled={displayMode !== 'markup'}>{/*ToDo: if (DisplayMode == "final" || DisplayMode == "original") {disabled} */}
                            <Toggle checked={isHiddenTableBorders}
                                    onToggleChange={() => {
                                        store.changeShowTableEmptyLine(!isHiddenTableBorders);
                                        props.switchShowTableEmptyLine(!isHiddenTableBorders);
                                    }}
                            />
                        </ListItem>
                    </List>
                </Fragment>
            }
            <BlockTitle>{_t.textCommentsDisplay}</BlockTitle>
            <List>
                <ListItem title={_t.textComments}>
                    <Toggle checked={isComments}
                        onToggleChange={() => {
                            store.changeDisplayComments(!isComments);
                            props.switchDisplayComments(!isComments);
                        }}
                    />
                </ListItem>
                <ListItem title={_t.textResolvedComments}>
                    <Toggle checked={isResolvedComments} disabled={!isComments}
                        onToggleChange={() => {
                            store.changeDisplayResolved(!isResolvedComments);
                            props.switchDisplayResolved(!isResolvedComments);
                        }}
                    />
                </ListItem>
            </List>
            {!!isConfigSelectTheme &&
                <List mediaList>
                    <ListItem title={t("Common.Themes.textTheme")} after={typeTheme === 'dark' || typeTheme === 'light' ? translationsThemes[typeTheme] : translationsThemes['system']} link="/theme-settings/" routeProps={{
                        changeTheme: props.changeTheme,
                        translationsThemes
                    }}></ListItem>
                </List>
            }
            {_isShowMacros &&
                <List mediaList>
                    <ListItem title={_t.textMacrosSettings} link="/macros-settings/" routeProps={{
                        setMacrosSettings: props.setMacrosSettings
                    }}></ListItem>
                </List>
            }
        </Page>
    );
};

const PageThemeSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
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

const PageDirection = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const directionMode = store.directionMode;

    const changeDirection = value => {
        store.changeDirectionMode(value);
        props.changeDirection(value);

        f7.dialog.create({
            title: _t.notcriticalErrorTitle,
            text: t('Settings.textRestartApplication'),
            buttons: [
                {
                    text: _t.textOk
                }
            ]
        }).open();
    };

    return (
        <Page>
            <Navbar title={t('Settings.textDirection')} backLink={_t.textBack} />
            <List mediaList>
                <ListItem radio name="direction" title={t('Settings.textLeftToRight')} checked={directionMode === 'ltr'} onChange={() => changeDirection('ltr')}></ListItem>
                <ListItem radio name="direction" title={t('Settings.textRightToLeft')} checked={directionMode === 'rtl'} onChange={() => changeDirection('rtl')}></ListItem>
            </List>
        </Page>
    );
}

const PageMacrosSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
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

const ApplicationSettings = inject("storeApplicationSettings", "storeAppOptions", "storeReview", "storeThemes")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));
const Direction = inject("storeApplicationSettings")(observer(PageDirection));
const ThemeSettings = inject("storeThemes")(observer(PageThemeSettings));

export {ApplicationSettings, MacrosSettings, Direction, ThemeSettings};