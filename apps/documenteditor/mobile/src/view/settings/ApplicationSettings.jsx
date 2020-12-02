import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
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

    return (
        <Page>
            <Navbar title={_t.textApplicationSettings} backLink={_t.textBack} />
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
                <ListItem>
                    <span>{_t.textSpellcheck}</span>
                    <Toggle checked={isSpellChecking} 
                        onChange={() => {
                            store.changeSpellCheck(!isSpellChecking);
                            props.switchSpellCheck(!isSpellChecking);
                        }} 
                    />
                </ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{_t.textNoCharacters}</span>
                    <Toggle checked={isNonprintingCharacters} 
                        onChange={() => { 
                            store.changeNoCharacters(!isNonprintingCharacters);
                            props.switchNoCharacters(!isNonprintingCharacters);
                        }} 
                    />
                </ListItem>
                <ListItem>
                    <span>{_t.textHiddenTableBorders}</span>
                    <Toggle checked={isHiddenTableBorders} 
                        onChange={() => { 
                            store.changeShowTableEmptyLine(!isHiddenTableBorders);
                            props.switchShowTableEmptyLine(!isHiddenTableBorders);
                        }}
                    />
                </ListItem>
            </List>
            <BlockTitle>{_t.textCommentsDisplay}</BlockTitle>
            <List>
                <ListItem>
                    <span>{_t.textComments}</span>
                    <Toggle checked={isComments} 
                        onChange={() => {
                            store.changeDisplayComments(!isComments);
                            props.switchDisplayComments(!isComments);
                        }}
                    />
                </ListItem>
                <ListItem>
                    <span>{_t.textResolvedComments}</span>
                    <Toggle checked={isResolvedComments} disabled={!isComments ? true : false}
                        onChange={() => {
                            store.changeDisplayResolved(!isResolvedComments);
                            props.switchDisplayResolved(!isResolvedComments);
                        }}
                    />
                </ListItem>
            </List>
            <List mediaList>
                <ListItem title={_t.textMacrosSettings} link="/macros-settings/" routeProps={{
                    setMacrosSettings: props.setMacrosSettings
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageMacrosSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const macrosMode = store.macrosMode;

    const changeMacros = value => {
        store.changeMacrosSettings(value);
        // props.setMacrosSettings(value);
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

const ApplicationSettings = inject("storeApplicationSettings")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));

export {ApplicationSettings, MacrosSettings};