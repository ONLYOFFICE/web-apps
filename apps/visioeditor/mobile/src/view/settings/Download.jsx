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
                <ListItem title="VSDX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.VSDX)}>
                    <Icon slot="media" icon="icon-format-vsdx"></Icon>
                </ListItem>
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                    <Icon slot="media" icon="icon-format-pdf"></Icon>
                </ListItem>
                <ListItem title="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA)}>
                    <Icon slot="media" icon="icon-format-pdfa"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

export default Download;