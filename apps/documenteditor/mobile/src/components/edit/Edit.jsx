import React, {useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import { Page, Navbar, NavRight, NavLeft, NavTitle, Link, Sheet, Tabs, Tab, View } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import EditTextController from "./controller/EditText";
import EditParagraphController from "./controller/EditParagraph";

const EmptyEditLayout = () => {
    const { t } = useTranslation();
    return (
        <Page>
            <div className="content-block inset">
                <div className="content-block-inner">
                    <p>{t("Edit.textSelectObjectToEdit")}</p>
                </div>
            </div>
        </Page>
    )
};

const EditLayoutNavbar = ({ editors }) => {
    const { t } = useTranslation();
    return (
        <Navbar>
        {
            editors.length > 1 ?
                <NavLeft tabbar>
                    {editors.map((item, index) => <Link key={"de-link-" + item.id}  tabLink={"#" + item.id} tabLinkActive={index === 0}>{item.caption}</Link>)}
                </NavLeft> :
                <NavTitle>{ editors[0].caption }</NavTitle>
        }
            <NavRight>
                <Link sheetClose>{t("Edit.textClose")}</Link>
            </NavRight>
        </Navbar>
    )
};

const EditLayoutContent = ({ editors }) => {
    if (editors.length > 1) {
        return (
            <Tabs animated>
                {editors.map((item, index) =>
                    <Tab key={"de-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                        {item.component}
                    </Tab>
                )}
            </Tabs>
        )
    } else {
        return (
            <Page>
                {editors[0].component}
            </Page>
        )
    }
};

const EditSheet = props => {
    const { t } = useTranslation();

    const settings = props.storeFocusObjects.settings;
    const headerType = props.storeFocusObjects.headerType;
    let editors = [];
    if (settings.length < 1) {
        editors.push({
            caption: t("Edit.textSettings"),
            component: <EmptyEditLayout />
        });
    } else {
        if (settings.indexOf('text') > -1) {
            editors.push({
                caption: t("Edit.textText"),
                id: 'edit-text',
                component: <EditTextController />
            })
        }
        if (settings.indexOf('paragraph') > -1) {
            editors.push({
                caption: t("Edit.textParagraph"),
                id: 'edit-paragraph',
                component: <EditParagraphController />
            })
        }
        /*if (settings.indexOf('table') > -1) {
            editors.push({
                caption: t("Edit.textTable"),
                id: 'edit-table',
                component: <EditTable />
            })
        }
        if (settings.indexOf('header') > -1) {
            editors.push({
                caption: headerType==2 ? t("Edit.textFooter") : t("Edit.textHeader"),
                id: 'edit-header',
                component: <EditHeader />
            })
        }
        if (settings.indexOf('shape') > -1) {
            editors.push({
                caption: t("Edit.textShape"),
                id: 'edit-shape',
                component: <EditShape />
            })
        }
        if (settings.indexOf('image') > -1) {
            editors.push({
                caption: t("Edit.textImage"),
                id: 'edit-image',
                component: <EditImage />
            })
        }
        if (settings.indexOf('chart') > -1) {
            editors.push({
                caption: t("Edit.textChart"),
                id: 'edit-chart',
                component: <EditChart />
            })
        }
        if (settings.indexOf('hyperlink') > -1) {
            editors.push({
                caption: t("Edit.textHyperlink"),
                id: 'edit-link',
                component: <EditHyperlink />
            })
        }*/
    }

    return (
        <Sheet className="edit__sheet" push onSheetClosed={e => props.onclosed()}>
            <View>
                <Page pageContent={false}>
                    <EditLayoutNavbar editors={editors} />
                    <EditLayoutContent editors={editors} />
                </Page>
            </View>
        </Sheet>
    )
};

const HOC_EditSheet = inject("storeFocusObjects")(observer(EditSheet));

const EditOptions = props => {
    useEffect(() => {
        f7.sheet.open('.edit__sheet');

        return () => {
            // component will unmount
        }
    });

    const onsheetclosed = () => {
        if ( props.onclosed ) props.onclosed();
    };

    return (
        <HOC_EditSheet onclosed={onsheetclosed} />
    )
};

export default EditOptions;
