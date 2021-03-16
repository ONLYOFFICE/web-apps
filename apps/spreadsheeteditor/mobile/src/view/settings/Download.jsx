import React from 'react';
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";

const Download = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textDownload} backLink={_t.textBack} />
            <BlockTitle>{_t.textDownloadAs}</BlockTitle>
            <List>
                <ListItem title="XLSX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.XLSX)}>
                    <Icon slot="media" icon="icon-format-xlsx"></Icon>
                </ListItem>
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                    <Icon slot="media" icon="icon-format-pdf"></Icon>
                </ListItem>
                <ListItem title="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA)}>
                    <Icon slot="media" icon="icon-format-pdfa"></Icon>
                </ListItem>
                <ListItem title="ODS" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODS)}>
                    <Icon slot="media" icon="icon-format-ods"></Icon>
                </ListItem>
                <ListItem title="CSV" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.CSV)}>
                    <Icon slot="media" icon="icon-format-csv"></Icon>
                </ListItem>
                <ListItem title="XLTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.XLTX)}>
                    <Icon slot="media" icon="icon-format-xltx"></Icon>
                </ListItem>
                <ListItem title="OTS" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTS)}>
                    <Icon slot="media" icon="icon-format-ots"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

export default Download;