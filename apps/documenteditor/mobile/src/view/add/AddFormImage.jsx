import React, { useState, useEffect, Component } from 'react';
import { f7, Sheet, PageContent, Navbar, List, Page, View, ListItem, ListInput, ListButton, NavRight, Link, BlockTitle, Icon, Popup, Popover } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconImageLibraryIos from '@common-ios-icons/icon-image-library.svg?ios';
import IconImageLibraryAndroid from '@common-android-icons/icon-image-library.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';


const AddImageFromUrlPage = ({ f7router, onInsertByUrl }) => {
    const { t } = useTranslation();
    const _t = t('Add', { returnObjects: true });
    const [stateValue, setValue] = useState('');

    return (
        <Page>
            <Navbar title={t('Add.textPasteImageUrl')} backLink={_t.textBack} />
            <List>
                <ListInput
                    type="text"
                    placeholder={_t.textImageURL}
                    value={stateValue}
                    onChange={(e) => setValue(e.target.value)}
                />
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised' + (stateValue.length < 1 ? ' disabled' : '')}
                    title={_t.textInsertImage}
                    onClick={() => {
                        if (stateValue.length > 0) {
                            onInsertByUrl(stateValue);
                            f7router.back();
                        }
                    }}
                />
            </List>
        </Page>
    );
};


const PageSheetAddImage = ({ closeModal, onInsertByUrl, addPictureFromLibrary, deletePicture, style }) => {
    const { t } = useTranslation();
    const _t = t('Add', { returnObjects: true });
    const routes = [
        {
            path: '/add-form-image-from-url/',
            component: AddImageFromUrlPage,
        },
    ];

    return (
        <View style={style} routes={routes} url="/" stackPages iosSwipeBack={true} animate={true} pushState={false} transition="f7-push">
            <Page>
                <Navbar title={_t.textInsertImage}>
                    {Device.phone &&
                        <NavRight>
                            <Link onClick={closeModal}>
                                {Device.ios ? 
                                    <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                    <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                                }
                            </Link>
                        </NavRight>
                    }
                </Navbar>
                <List>
                    <ListItem
                        title={_t.textPictureFromLibrary}
                        onClick={() => addPictureFromLibrary()}
                    >
                        {Device.ios ? (
                            <SvgIcon slot="media" symbolId={IconImageLibraryIos.id} className={'icon icon-svg'} />
                        ) : (
                            <SvgIcon slot="media" symbolId={IconImageLibraryAndroid.id} className={'icon icon-svg'} />
                        )}
                    </ListItem>
                    <ListItem
                        title={_t.textPictureFromURL}
                        link={'/add-form-image-from-url/'}
                        routeProps={{
                            onInsertByUrl: onInsertByUrl
                        }}
                    >
                        {Device.ios ? (
                            <SvgIcon slot="media" symbolId={IconLinkIos.id} className={'icon icon-svg'} />
                        ) : (
                            <SvgIcon slot="media" symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                        )}
                    </ListItem>
                    <List className="buttons-list">
                        <ListButton title={_t.textRemovePicture} onClick={() => deletePicture()} className='button-red button-fill button-raised'></ListButton>
                    </List>
                </List>
            </Page>
        </View>
    );
};

class SheetAddImageListView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            Device.isPhone ? 
                <Sheet id="dropdown-image-list-popup" className="dropdown-image-list-popup" closeByOutsideClick={true} swipeToClose={true} onPopupClosed={() => this.props.closeModal()}>
                    <PageSheetAddImage
                        closeModal={this.props.closeModal}
                        addPictureFromLibrary={this.props.addPictureFromLibrary}
                        onInsertByUrl={this.props.onInsertByUrl}
                        deletePicture={this.props.deletePicture}
                        style={{height: '260px'}}
                    />
                </Sheet>
            : 
                <Popover id="dropdown-image-list-popover" className="popover__titled" verticalPosition={this.props.vertPos} closeByOutsideClick={true} onPopoverClosed={() => this.props.closeModal()}>
                    <PageSheetAddImage
                        closeModal={this.props.closeModal}
                        addPictureFromLibrary={this.props.addPictureFromLibrary}
                        onInsertByUrl={this.props.onInsertByUrl}
                        deletePicture={this.props.deletePicture}
                        style={{height: '260px'}}
                    />
                </Popover>
            
        );
    }
}

const FormImageList = props => {
    useEffect(() => {
        if(Device.isPhone) {
            f7.popup.open('#dropdown-image-list-popup', true);
        } else {
            f7.popover.open('#dropdown-image-list-popover', '#dropdown-image-list-target');
        }
    
        return () => {}
    });

    return (
        <SheetAddImageListView 
            closeModal={props.closeModal}
            addPictureFromLibrary={props.addPictureFromLibrary}
            onInsertByUrl={props.onInsertByUrl}
            deletePicture={props.deletePicture}
            vertPos={props.vertPos}
        />
    );
};

export default FormImageList;
