import React, {Component} from 'react';
import { f7, Popup, Popover, View } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {PageTypeLink, PageLinkTo, ObservablePageLink} from '../../view/add/AddLink';

const routes = [
    {
        path: '/add-link-type/',
        component: PageTypeLink
    },
    {
        path: '/add-link-to/',
        component: PageLinkTo
    }
];

class AddLinkController extends Component {
    constructor (props) {
        super(props);
        this.onInsertLink = this.onInsertLink.bind(this);
        this.getTextDisplay = this.getTextDisplay.bind(this);

        const api = Common.EditorApi.get();
        this.textDisplay = api.can_AddHyperlink();
    }

    closeModal(mobileSelector, tabletSelector) {
        if (Device.phone) {
            f7.popup.close(mobileSelector);
        } else {
            f7.popover.close(tabletSelector);
        }
    }

    onInsertLink (type, linkInfo) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t("View.Add", { returnObjects: true });

        const c_oHyperlinkType = {
            InternalLink: 0,
            WebLink: 1
        };
        const display = linkInfo.display;
        const tip = linkInfo.tip;
        const props = new Asc.CHyperlinkProperty();

        let def_display = '';

        if (type == c_oHyperlinkType.WebLink) {
            let url = linkInfo.url;
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

            props.put_Value(url);
            props.put_ToolTip(tip);

            def_display = url;
        } else {
            let url = "ppaction://hlink";
            let slidetip = '';

            switch (linkInfo.linkTo) {
                case 0:
                    url = url + "showjump?jump=nextslide";
                    slidetip = _t.textNextSlide;
                    break;
                case 1:
                    url = url + "showjump?jump=previousslide";
                    slidetip = _t.textPreviousSlide;
                    break;
                case 2:
                    url = url + "showjump?jump=firstslide";
                    slidetip = _t.textFirstSlide;
                    break;
                case 3:
                    url = url + "showjump?jump=lastslide";
                    slidetip = _t.textLastSlide;
                    break;
                case 4:
                    url = url + "sldjumpslide" + linkInfo.numberTo;
                    slidetip = _t.textSlide + ' ' + (linkInfo.numberTo + 1);
                    break;
            }

            props.put_Value(url);
            props.put_ToolTip(!tip ? slidetip : tip);
            def_display = slidetip;
        }

        if (!linkInfo.displayDisabled) {
            props.put_Text(!display ? def_display : display);
        } else
            props.put_Text(null);

        api.add_Hyperlink(props);

        if(this.props.isNavigate) {
            this.closeModal('.add-popup', '#add-popover');
        } else {
            this.closeModal('#add-link-popup', '#add-link-popover');
        }
    }

    getTextDisplay () {
        return this.textDisplay;
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
                            <ObservablePageLink closeModal={this.closeModal} onInsertLink={this.onInsertLink} getTextDisplay={this.getTextDisplay} isNavigate={this.props.isNavigate} />
                        </View>
                    </Popup>
                :
                    <Popover id="add-link-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => this.props.closeOptions('add-link')}>
                        <View routes={routes} style={{height: '410px'}}>
                            <ObservablePageLink closeModal={this.closeModal} onInsertLink={this.onInsertLink} getTextDisplay={this.getTextDisplay} isNavigate={this.props.isNavigate}/>
                        </View>
                    </Popover>
            :
                <ObservablePageLink closeModal={this.closeModal} onInsertLink={this.onInsertLink} getTextDisplay={this.getTextDisplay} isNavigate={this.props.isNavigate} />
        )
    }
}

const AddLinkWithTranslation = withTranslation()(AddLinkController);

export {AddLinkWithTranslation as AddLinkController};