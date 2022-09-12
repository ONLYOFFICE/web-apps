import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageSpreadsheetInfo = (props) => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeSpreadsheetInfo = props.storeSpreadsheetInfo;
    const dataDoc = storeSpreadsheetInfo.dataDoc;
    const dataApp = props.getAppProps();
    const dataModified = props.modified;
    const dataModifiedBy = props.modifiedBy;
    const creators = props.creators;
  
    return (
        <Page>
            <Navbar title={_t.textSpreadsheetInfo} backLink={_t.textBack} />
            {dataDoc?.title ? (
                <Fragment>
                    <BlockTitle>{_t.textSpreadsheetTitle}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.title}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc?.info?.author || dataDoc?.info?.owner ? (
                <Fragment>
                    <BlockTitle>{_t.textOwner}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.author || dataDoc.info.owner}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc?.info?.folder ? (
                <Fragment>  
                    <BlockTitle>{_t.textLocation}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.folder}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc?.info?.uploaded || dataDoc?.info?.created ? (
                <Fragment>
                    <BlockTitle>{_t.textUploaded}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.uploaded || dataDoc.info.created}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.title ? (
                <Fragment>
                    <BlockTitle>{_t.textTitle}</BlockTitle>
                    <List>
                        <ListItem title={props.title}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.subject ? (
                <Fragment>
                    <BlockTitle>{_t.textSubject}</BlockTitle>
                    <List>
                        <ListItem title={props.subject}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.description ? (
                <Fragment>
                    <BlockTitle>{_t.textComment}</BlockTitle>
                    <List>
                        <ListItem title={props.description}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataModified ? (
                <Fragment>
                    <BlockTitle>{_t.textLastModified}</BlockTitle>
                    <List>
                        <ListItem title={dataModified}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataModifiedBy ? (
                <Fragment>
                    <BlockTitle>{_t.textLastModifiedBy}</BlockTitle>
                    <List>
                        <ListItem title={dataModifiedBy}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.created ? (
                <Fragment>
                    <BlockTitle>{_t.textCreated}</BlockTitle>
                    <List>
                        <ListItem title={props.created}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataApp ? (
                <Fragment>
                    <BlockTitle>{_t.textApplication}</BlockTitle>
                    <List>
                        <ListItem title={dataApp}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {creators ? (
                <Fragment>
                    <BlockTitle>{_t.textAuthor}</BlockTitle>
                    <List>
                        {
                            creators.split(/\s*[,;]\s*/).map(item => {
                                return <ListItem title={item}></ListItem>
                            })
                        }
                    </List>
                </Fragment>
            ) : null}
        </Page>
    );
};

const SpreadsheetInfo = inject("storeSpreadsheetInfo")(observer(PageSpreadsheetInfo));

export default SpreadsheetInfo;