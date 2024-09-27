import React, {Component} from 'react';
import { f7, Popup, Popover, View } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {withTranslation} from 'react-i18next';

import {AddLink, PageTypeLink, PageSheet} from '../../view/add/AddLink';

const routes = [
    {
        path: '/add-link-type/',
        component: PageTypeLink
    },
    {
        path: '/add-link-sheet/',
        component: PageSheet
    }
];

class AddLinkController extends Component {
    constructor (props) {
        super(props);
        this.onInsertLink = this.onInsertLink.bind(this);

        const api = Common.EditorApi.get();
        const cell = api.asc_getCellInfo();
        const celltype = cell.asc_getSelectionType();

        this.allowInternal = (celltype !== Asc.c_oAscSelectionType.RangeImage && celltype !== Asc.c_oAscSelectionType.RangeShape &&
            celltype !== Asc.c_oAscSelectionType.RangeShapeText && celltype !== Asc.c_oAscSelectionType.RangeChart &&
            celltype !== Asc.c_oAscSelectionType.RangeChartText);

        this.displayText = cell.asc_getLockText() ? 'locked' : cell.asc_getText();

        // sheets
        let items = [];
        let wsc = api.asc_getWorksheetsCount();
        const aws = api.asc_getActiveWorksheetIndex();
        if (wsc > 0) {
            items = [];
            while ( !(--wsc < 0) ) {
                if ( !api.asc_isWorksheetHidden(wsc) ) {
                    items.unshift({
                        value: wsc,
                        caption: api.asc_getWorksheetName(wsc)
                    });
                    if (wsc === aws) {
                        this.activeSheet = {
                            value: wsc,
                            caption: api.asc_getWorksheetName(wsc)
                        }
                    }
                }
            }
            this.sheets = items;
        }
    }

    onInsertLink (args) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t("View.Add", { returnObjects: true });

        const link = new Asc.asc_CHyperlink();
        let display = '';

        if (args.type == 'ext') {
            let url = args.url;
            const urltype = api.asc_getUrlType(url.trim());

            if (urltype===AscCommon.c_oAscUrlType.Invalid) {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.txtNotUrl,
                    buttons: [
                        {
                            text: t('View.Add.textOk')
                        }
                    ]
                }).open();
                return;
            }

            url = url.replace(/^\s+|\s+$/g, '');

            if (urltype!==AscCommon.c_oAscUrlType.Unsafe && !/(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url))
                url = (urltype===AscCommon.c_oAscUrlType.Email ? 'mailto:' : 'http://' ) + url;

            url = url.replace(new RegExp("%20", 'g'), " ");

            link.asc_setType(Asc.c_oAscHyperlinkType.WebLink);
            link.asc_setHyperlinkUrl(url);
            display = url;
        } else {
            const isValid = api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.FormatTable, args.url, false);

            if (isValid !== Asc.c_oAscError.ID.No) {
                f7.dialog.alert(_t.textInvalidRange, _t.notcriticalErrorTitle);
                return;
            }

            link.asc_setType(Asc.c_oAscHyperlinkType.RangeLink);
            link.asc_setSheet(args.sheet);
            link.asc_setRange(args.url);

            display = args.sheet + '!' + args.url;
        }

        if(this.displayText !== 'locked') {
            link.asc_setText(args.text == null ? null : !!args.text ? args.text : display);
        }

        link.asc_setTooltip(args.tooltip);
        api.asc_insertHyperlink(link);
        
        if(this.props.isNavigate) {
            this.closeModal('.add-popup', '#add-popover');
        } else {
            this.closeModal('#add-link-popup', '#add-link-popover');
        }
    }

    closeModal(mobileSelector, tabletSelector) {
        if (Device.phone) {
            f7.popup.close(mobileSelector);
        } else {
            f7.popover.close(tabletSelector);
        }
    }

    componentDidMount() {
        if(!this.props.isNavigate) {
            if(Device.phone) {
                f7.popup.open('#add-link-popup', true);
            } else {
                f7.popover.open('#add-link-popover', '#btn-add');
            }
        }
    }

    render () {
        return (
            !this.props.isNavigate ?
                Device.phone ?
                    <Popup id="add-link-popup" onPopupClosed={() => this.props.closeOptions('add-link')}>
                        <View routes={routes} style={{height: '100%'}}>
                            <AddLink 
                                allowInternal={this.allowInternal}
                                displayText={this.displayText}
                                sheets={this.sheets}
                                activeSheet={this.activeSheet}
                                onInsertLink={this.onInsertLink}
                                closeModal={this.closeModal} 
                                isNavigate={this.props.isNavigate} 
                            />
                        </View>
                    </Popup>
                :
                    <Popover id="add-link-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => this.props.closeOptions('add-link')}>
                        <View routes={routes} style={{height: '410px'}}>
                            <AddLink 
                                allowInternal={this.allowInternal}
                                displayText={this.displayText}
                                sheets={this.sheets}
                                activeSheet={this.activeSheet}
                                onInsertLink={this.onInsertLink}
                                closeModal={this.closeModal} 
                                isNavigate={this.props.isNavigate} 
                            />
                        </View>
                    </Popover>
            :
                <AddLink 
                    allowInternal={this.allowInternal}
                    displayText={this.displayText}
                    sheets={this.sheets}
                    activeSheet={this.activeSheet}
                    onInsertLink={this.onInsertLink}
                    closeModal={this.closeModal} 
                    isNavigate={this.props.isNavigate} 
                />
        )
    }
}

const AddLinkWithTranslation = withTranslation()(AddLinkController);

export {AddLinkWithTranslation as AddLinkController};