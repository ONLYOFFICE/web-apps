import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, Icon } from "framework7-react";
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
    const dataLang = storeApplicationSettings.getFormulaLanguages();
    const defineFormulaLang = () => dataLang.find(obj => obj.value === formulaLang);
    const currentFormulaLang = defineFormulaLang();
    const defineRegSetting = () => regData.find(obj => regCode === obj.code);
    const currentRegSetting = defineRegSetting();
    const isRefStyle = storeApplicationSettings.isRefStyle;
    const isComments = storeApplicationSettings.isComments;
    const isResolvedComments = storeApplicationSettings.isResolvedComments;

    const changeMeasureSettings = value => {
        storeApplicationSettings.changeUnitMeasurement(value);
        props.unitMeasurementChange(value);
    };

    // set mode
    // const appOptions = props.storeAppOptions;
    // const _isEdit = appOptions.isEdit;
    // const _isShowMacros = (!appOptions.isDisconnected && appOptions.customization) ? appOptions.customization.macros !== false : true;

    return (
        <Page>
            <Navbar title={_t.textApplicationSettings} backLink={_t.textBack} />
            {/* {_isEdit && */}
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
                        <ListItem title={currentFormulaLang.displayValue} subtitle={`Example: ${currentFormulaLang.exampleValue}`} link="/formula-languages/" 
                            routeProps={{
                                onFormulaLangChange: props.onFormulaLangChange
                            }}>
                        </ListItem>
                    </List>
                    <BlockTitle>{_t.textRegionalSettings}</BlockTitle>
                    <List mediaList>
                        <ListItem title={currentRegSetting.displayName} subtitle={`Example: ${regExample}`} link="/regional-settings/" routeProps={{
                            onRegSettings: props.onRegSettings
                        }}></ListItem>
                    </List>
                    <BlockTitle>{_t.textCommentingDisplay}</BlockTitle>
                    <List>
                        <ListItem>
                            <span>{_t.textComments}</span>
                            <Toggle checked={isComments}
                                    onChange={() => {
                                        storeApplicationSettings.changeDisplayComments(!isComments);
                                        props.onChangeDisplayComments(!isComments);
                                    }}
                            />
                        </ListItem>
                        <ListItem>
                            <span>{_t.textResolvedComments}</span>
                            <Toggle checked={isResolvedComments} disabled={!isComments}
                                    onChange={() => {
                                        storeApplicationSettings.changeDisplayResolved(!isResolvedComments);
                                        props.onChangeDisplayResolved(!isResolvedComments);
                                    }}
                            />
                        </ListItem>
                    </List>
                    <List>
                        <ListItem>
                            <span>{_t.textR1C1Style}</span>
                            <Toggle checked={isRefStyle}
                                    onChange={() => {
                                        storeApplicationSettings.changeRefStyle(!isRefStyle);
                                        props.clickR1C1Style(!isRefStyle);
                                    }}
                            />
                        </ListItem>
                    </List>
                </Fragment>
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
    const formulaLang = storeApplicationSettings.formulaLang;
    const dataLang = storeApplicationSettings.getFormulaLanguages();

    return (
        <Page>
            <Navbar title={_t.textFormulaLanguage} backLink={_t.textBack} />
            <List mediaList>
                {dataLang.map((elem, index) => {
                    return (
                        <ListItem radio key={index} title={elem.displayValue} subtitle={`Example: ${elem.exampleValue}`} checked={elem.value === formulaLang}
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

export {
    ApplicationSettings, 
    MacrosSettings,
    RegionalSettings,
    FormulaLanguage
};