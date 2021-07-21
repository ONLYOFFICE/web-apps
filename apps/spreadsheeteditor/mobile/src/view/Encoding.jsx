import React, {Component, useEffect} from 'react';
import { observer, inject } from "mobx-react";
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton, Popover, Popup, View, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { Device } from '../../../../common/mobile/utils/device';

const routes = [
    {
        path: '/encoding/',
        component: PageEncoding
    },
    {
        path: '/encoding-list/',
        component: PageEncodingList
    },
    {
        path: '/delimeter-list/',
        component: PageDelimeterList
    }
];

const PageEncoding = inject("storeEncoding")(observer(props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueEncoding = storeEncoding.valueEncoding;
    const nameDelimeter = storeEncoding.nameDelimeter;
    const valueDelimeter = storeEncoding.valueDelimeter;
    const nameEncoding = storeEncoding.nameEncoding;
    const mode = storeEncoding.mode;

    return (
        <View routes={routes} url="/encoding/">
            <Page>
                <Navbar title={_t.textChooseCsvOptions} />
                <BlockTitle>{_t.textDelimeter}</BlockTitle>
                <List>
                    <ListItem title={nameDelimeter} link="/delimeter-list/"></ListItem>
                </List>
                <BlockTitle>{_t.textEncoding}</BlockTitle>
                <List>
                    <ListItem title={nameEncoding} link="/encoding-list/"></ListItem>
                </List>
                <List className="buttons-list">
                    <ListButton className='button-fill button-raised' title={mode === 2 ?_t.textDownload : _t.txtOk} onClick={() => props.onSaveFormat(mode, valueEncoding, valueDelimeter)}></ListButton>
                </List>
            </Page>
        </View>
        
    )
}));

const PageEncodingList = inject("storeEncoding")(observer(props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueEncoding = storeEncoding.valueEncoding;
    const pages = storeEncoding.pages;
    const pagesName = storeEncoding.pagesName;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadCsv} backLink={_t.textBack} />
            <BlockTitle>{_t.textChooseEncoding}</BlockTitle>
            <List>
                {pagesName.map((name, index) => {
                    return (
                        <ListItem radio checked={valueEncoding === pages[index]} title={name} key={index} value={pages[index]} onChange={() => {
                            storeEncoding.changeEncoding(pages[index]);
                            f7.views.current.router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}));

const PageDelimeterList = inject("storeEncoding")(observer(props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueDelimeter = storeEncoding.valueDelimeter;
    const namesDelimeter = storeEncoding.namesDelimeter;
    const valuesDelimeter = storeEncoding.valuesDelimeter;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadCsv} backLink={_t.textBack} />
            <BlockTitle>{_t.textChooseDelimeter}</BlockTitle>
            <List>
                {namesDelimeter.map((name, index) => {
                    return (
                        <ListItem radio checked={valueDelimeter === valuesDelimeter[index]} title={name} key={index} value={valuesDelimeter[index]} onChange={() => {
                            storeEncoding.changeDelimeter(valuesDelimeter[index]);
                            f7.views.current.router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}));

// const Encoding = inject("storeEncoding")(observer(PageEncoding));
// const EncodingList = inject("storeEncoding")(observer(PageEncodingList));
// const DelimeterList = inject("storeEncoding")(observer(PageDelimeterList));

class EncodingView extends Component {
    constructor(props) {
        super(props);
        this.onoptionclick = this.onoptionclick.bind(this);
    }

    onoptionclick(page){
        f7.views.current.router.navigate(page);
    }

    render() {
        const show_popover = this.props.usePopover;
        return (
            show_popover ?
                <Popover id="encoding-popover" className="popover__titled" onPopoverClosed={() => this.props.onclosed()}>
                    <PageEncoding inPopover={true} openOptions={this.props.openOptions} onOptionClick={this.onoptionclick} onSaveFormat={this.props.onSaveFormat} />
                </Popover> :
                <Popup className="encoding-popup" onPopupClosed={() => this.props.onclosed()}>
                    <PageEncoding onOptionClick={this.onoptionclick} openOptions={this.props.openOptions} />
                </Popup>
        )
    }
}

const Encoding = props => {
    useEffect(() => {
        if ( Device.phone )
            f7.popup.open('.encoding-popup');
        else f7.popover.open('#encoding-popover');

        return () => {
        }
    });


    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };

    return <EncodingView usePopover={!Device.phone} onclosed={onviewclosed} openOptions={props.openOptions} onSaveFormat={props.onSaveFormat} />
};

// export {EncodingList, Encoding, DelimeterList}
export {Encoding, PageEncodingList, PageDelimeterList}