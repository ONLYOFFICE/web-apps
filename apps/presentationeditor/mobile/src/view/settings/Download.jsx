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
                <ListItem title="PPTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PPTX)}>
                    <Icon slot="media" icon="icon-format-pptx"></Icon>
                </ListItem>
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                    <Icon slot="media" icon="icon-format-pdf"></Icon>
                </ListItem>
                <ListItem title="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA)}>
                    <Icon slot="media" icon="icon-format-pdfa"></Icon>
                </ListItem>
                <ListItem title="ODP" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODP)}>
                    <Icon slot="media" icon="icon-format-odp"></Icon>
                </ListItem>
                <ListItem title="POTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.POTX)}>
                    <Icon slot="media" icon="icon-format-potx"></Icon>
                </ListItem>
                <ListItem title="OTP" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTP)}>
                    <Icon slot="media" icon="icon-format-otp"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

export default Download;