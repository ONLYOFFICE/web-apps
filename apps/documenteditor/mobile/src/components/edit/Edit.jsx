import React from 'react';
import {observer, inject} from "mobx-react";
import { Page, Navbar, NavRight, NavLeft, NavTitle, Link, Sheet, Tabs, Tab, View } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import EditText from "./EditText";
import EditParagraph from "./EditParagraph";

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

    const settings = props.storeFocusObjects.focusObjects;
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
                component: <EditText />
            })
        }
        if (settings.indexOf('paragraph') > -1) {
            editors.push({
                caption: t("Edit.textParagraph"),
                id: 'edit-paragraph',
                component: <EditParagraph />
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
        <Sheet className="edit__sheet" push>
            <View>
                <Page pageContent={false}>
                    <EditLayoutNavbar editors={editors} />
                    <EditLayoutContent editors={editors} />
                </Page>
            </View>
        </Sheet>
    )
};

export default inject("storeFocusObjects")(observer(EditSheet));