import React, {Component, useEffect, useState} from 'react';
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton, Popover, Popup, View, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { Device } from '../../../../common/mobile/utils/device';

const PageEncoding = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const encodeData = props.encodeData;
    const [stateEncoding, setStateEncoding] = useState(props.valueEncoding === -1 ? encodeData.find(encoding => encoding.lcid === 65001).value : props.valueEncoding);
    const getIndexNameEncoding = () => encodeData.findIndex(encoding => encoding.value === stateEncoding);
    const nameEncoding = encodeData[getIndexNameEncoding()].displayValue;
    const mode = props.mode;

    const changeStateEncoding = value => {
        setStateEncoding(value);
    }

    return (
        <View style={props.style} routes={routes}>
            <Page>
                <Navbar title={_t.textChooseTxtOptions} />
                <BlockTitle>{_t.textEncoding}</BlockTitle>
                <List>
                    <ListItem title={nameEncoding} link="/encoding-list/" routeProps={{
                        stateEncoding,
                        encodeData,
                        changeStateEncoding
                    }}></ListItem>
                </List>
                <List className="buttons-list">
                    {mode === 2 ? 
                        <ListButton className='button-fill button-raised' title={_t.textCancel} onClick={() => props.closeModal()}></ListButton>
                    : null}
                    <ListButton className='button-fill button-raised' title={mode === 2 ?_t.textDownload : _t.txtOk} onClick={() => props.onSaveFormat(stateEncoding)}></ListButton>
                </List>
            </Page>
        </View>
        
    )
};

const PageEncodingList = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const [currentEncoding, changeCurrentEncoding] = useState(props.stateEncoding);
    const encodeData = props.encodeData;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadTxt} backLink={_t.textBack} />
            <BlockTitle>{_t.textChooseEncoding}</BlockTitle>
            <List>
                {encodeData.map((encoding, index) => {
                    return (
                        <ListItem radio checked={currentEncoding === encoding.value} title={encoding.displayValue} key={index} value={encoding.value} after={encoding.lcid} onChange={() => {
                            changeCurrentEncoding(encoding.value);
                            props.changeStateEncoding(encoding.value);
                            f7.views.current.router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
};

class EncodingView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Popup className="encoding-popup" closeByBackdropClick={false}>
                <PageEncoding 
                    onSaveFormat={this.props.onSaveFormat} 
                    closeModal={this.props.closeModal}
                    mode={this.props.mode}  
                    encodeData={this.props.encodeData}
                    valueEncoding={this.props.valueEncoding}
                />
            </Popup>
        )
    }
}

const routes = [
    {
        path: '/encoding-list/',
        component: PageEncodingList
    }
];

const Encoding = props => {
    useEffect(() => {
        f7.popup.open('.encoding-popup');
    
        return () => {
        }
    });

    return (
        <EncodingView 
            closeModal={props.closeModal}
            onSaveFormat={props.onSaveFormat} 
            mode={props.mode}  
            encodeData={props.encodeData}
            valueEncoding={props.valueEncoding}
        />
    )
};

export {Encoding, PageEncodingList}