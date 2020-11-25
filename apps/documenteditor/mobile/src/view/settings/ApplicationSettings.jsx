import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageApplicationSettings = (props) => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const store = props.storeApplicationSettings;
    const isActiveUnitCentimeter = store.isActiveUnitCentimeter;
    const isActiveUnitPoint = store.isActiveUnitPoint;
    const isActiveUnitInch = store.isActiveUnitInch;
    // const changeUnitMeasurement = store.changeUnitMeasurement;

    // const unitMeasurementChange = e => {
    //     const api = Common.EditorApi.get();
    //     let value = e.target.value;
    //     value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
    //     Common.Utils.Metric.setCurrentMetric(value);
    //     // Common.localStorage.setItem("de-mobile-settings-unit", value);
    //     api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
    // }

    return (
        <Page>
            <Navbar title={_t.textApplicationSettings} backLink={_t.textBack} />
            <BlockTitle>{_t.textUnitOfMeasurement}</BlockTitle>
            <List>
                <ListItem radio radioIcon="end" title={_t.textCentimeter} value="0" name="unit-of-measurement" checked={isActiveUnitCentimeter} onChange={e => store.changeUnitMeasurement(e.target.value)}></ListItem>
                <ListItem radio radioIcon="end" title={_t.textPoint} value="1" name="unit-of-measurement" checked={isActiveUnitPoint} onChange={e => store.changeUnitMeasurement(e.target.value)}></ListItem>
                <ListItem radio radioIcon="end" title={_t.textInch} value="2" name="unit-of-measurement" checked={isActiveUnitInch} onChange={e => store.changeUnitMeasurement(e.target.value)}></ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{_t.textSpellcheck}</span>
                    <Toggle defaultChecked />
                </ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{_t.textNoCharacters}</span>
                    <Toggle />
                </ListItem>
                <ListItem>
                    <span>{_t.textHiddenTableBorders}</span>
                    <Toggle />
                </ListItem>
            </List>
            <BlockTitle>{_t.textCommentsDisplay}</BlockTitle>
            <List>
                <ListItem>
                    <span>{_t.textComments}</span>
                    <Toggle />
                </ListItem>
                <ListItem>
                    <span>{_t.textResolvedComments}</span>
                    <Toggle />
                </ListItem>
            </List>
            <List mediaList>
                <ListItem title={_t.textMacrosSettings} link="/macros-settings/"></ListItem>
            </List>
        </Page>
    );
};

const PageMacrosSettings = () => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textMacrosSettings} backLink={_t.textBack} />
            <List mediaList>
                <ListItem radio name="demo-media-radio" value="1" title={_t.textDisableAll} text={_t.textDisableAllMacrosWithoutNotification}></ListItem>
                <ListItem radio defaultChecked name="demo-media-radio" value="2" title={_t.textShowNotification} text={_t.textDisableAllMacrosWithNotification}></ListItem>
                <ListItem radio name="demo-media-radio" value="3" title={_t.textEnableAll} text={_t.textEnableAllMacrosWithoutNotification}></ListItem>
            </List>
        </Page>
    )
}

const ApplicationSettings = inject("storeApplicationSettings")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));

export {ApplicationSettings, MacrosSettings};