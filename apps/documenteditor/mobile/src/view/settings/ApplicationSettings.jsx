import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const isActiveUnitCentimeter = store.isActiveUnitCentimeter;
    const isActiveUnitPoint = store.isActiveUnitPoint;
    const isActiveUnitInch = store.isActiveUnitInch;
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
                <ListItem radio radioIcon="end" title={_t.textCentimeter} value="0" name="unit-of-measurement" checked={isActiveUnitCentimeter} 
                    onChange={e => changeMeasureSettings(e.target.value)}></ListItem>
                <ListItem radio radioIcon="end" title={_t.textPoint} value="1" name="unit-of-measurement" checked={isActiveUnitPoint} 
                    onChange={e => changeMeasureSettings(e.target.value)}></ListItem>
                <ListItem radio radioIcon="end" title={_t.textInch} value="2" name="unit-of-measurement" checked={isActiveUnitInch} 
                    onChange={e => changeMeasureSettings(e.target.value)}></ListItem>
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
    const isDisabledAllMacros = store.isDisabledAllMacros;
    const isShowNotification = store.isShowNotification;
    const isEnabledAllMacros = store.isEnabledAllMacros;

    const changeMacros = value => {
        store.changeMacrosSettings(value);
        props.setMacrosSettings(value);
    };

    return (
        <Page>
            <Navbar title={_t.textMacrosSettings} backLink={_t.textBack} />
            <List mediaList>
                <ListItem radio name="macros-settings" value="2" title={_t.textDisableAll} text={_t.textDisableAllMacrosWithoutNotification} 
                    checked={isDisabledAllMacros} onChange={e => changeMacros(e.target.value)}></ListItem>
                <ListItem radio name="macros-settings" value="0" title={_t.textShowNotification} text={_t.textDisableAllMacrosWithNotification}
                    checked={isShowNotification} onChange={e => changeMacros(e.target.value)}></ListItem>
                <ListItem radio name="macros-settings" value="1" title={_t.textEnableAll} text={_t.textEnableAllMacrosWithoutNotification}
                    checked={isEnabledAllMacros} onChange={e => changeMacros(e.target.value)}></ListItem>
            </List>
        </Page>
    );
};

const ApplicationSettings = inject("storeApplicationSettings")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));

export {ApplicationSettings, MacrosSettings};