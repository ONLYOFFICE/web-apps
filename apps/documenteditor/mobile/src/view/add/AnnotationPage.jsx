import React, { useContext, useEffect, useState } from 'react';
import { Page, Navbar, NavRight, Link, Icon, ListItem, List, Toggle } from 'framework7-react';
import { Device } from "../../../../../common/mobile/utils/device";
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import { CustomColorPicker, ThemeColorPalette } from '../../../../../common/mobile/lib/component/ThemeColorPalette';
import { AddAnnotationContext } from '../../controller/add/AddAnnotation';

export const AnnotationPage = inject('storeApplicationSettings')(observer(props => {
    const { t } = useTranslation();
	const storeApplicationSettings = props.storeApplicationSettings;
    const curMarkColor = storeApplicationSettings.markColor;
	const isComments = storeApplicationSettings.isComments;
    const { closeModal, switchDisplayComments, onMarkType } = useContext(AddAnnotationContext);
    
    return (
        <Page>
			<Navbar title={t('Add.textAnnotation')}>
            	{Device.phone && 
					<NavRight>
						<Link sheetClose="#annotation-sheet">
							<Icon icon='icon-expand-down'/>
						</Link>
					</NavRight>
				}
         	</Navbar>
            <List>
				<ListItem title={t('Add.textMark')} link='/add-annotation-mark/' className='no-indicator' routeProps={{
                    onMarkType,
                    curMarkColor,
                }}>
                    <Icon slot="media" icon="icon-add-mark"></Icon>
                </ListItem> 
				<ListItem title={t('Add.textAddComment')} link='#' className='no-indicator' onClick={() => {
                    closeModal();
                    Common.Notifications.trigger('addcomment');
                }}>
                    <Icon slot="media" icon="icon-add-comment"></Icon>
                </ListItem>
				<ListItem title={t('Add.textShowComments')}>
					<Toggle checked={isComments}
                        onToggleChange={() => {
                            storeApplicationSettings.changeDisplayComments(!isComments);
                            switchDisplayComments(!isComments);
                        }}
                    />
				</ListItem>
            </List>
        </Page>
    )
}));

export const PageAddMark = inject('storeApplicationSettings')(observer(props => {
    const { t } = useTranslation();
    const isAndroid = Device.android;
    const curMarkColor = props.storeApplicationSettings.markColor;
    const [markType, setMarkType] = useState('');

    const changeMarkType = (type) => {
        setMarkType(type);
        props.onMarkType(type);
    }

    useEffect(() => {
        return () => {
            props.onMarkType('');
        }
    }, [])

    return (
        <Page>
            <Navbar title={t('Add.textMark')}>
            	{Device.phone && 
					<NavRight>
						<Link sheetClose="#annotation-sheet">
							<Icon icon='icon-expand-down'/>
						</Link>
					</NavRight>
				}
         	</Navbar>
            <List>
                <ListItem title={t('Add.textHighlight')} radio checked={markType === 'inline'} onClick={() => {
                    changeMarkType('highlight')
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-mark-highlight"></Icon>}
                </ListItem>
                <ListItem title={t('Add.textUnderline')} radio checked={markType === 'square'} onClick={() => {
                    changeMarkType('underline')
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-mark-underline"></Icon>}
                </ListItem>
                <ListItem title={t('Add.textStrikethrough')} radio checked={markType === 'tight'} onClick={() => {
                    changeMarkType('strikethrough')
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-mark-strikethrough"></Icon>}
                </ListItem>
            </List>
            <List>
                <ListItem title={t('Add.textColor')} link="/add-mark-color/">
                    <div slot="after">
                        <div className='preview-color-style' style={{ backgroundColor: curMarkColor }}></div>
                    </div>
                </ListItem>
            </List>
        </Page>
    )
}));

export const PageMarkColor = inject('storeApplicationSettings', 'storePalette')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    const { changeMarkColor } = useContext(AddAnnotationContext);
    const storeApplicationSettings = props.storeApplicationSettings;
    const curMarkColor = storeApplicationSettings.markColor;
    const customColors = props.storePalette.customColors;
    
    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = { color: color, effectId: effectId, effectValue: effectValue };
                storeApplicationSettings.setMarkColor(newColor);
                changeMarkColor(newColor);
            } else {
                storeApplicationSettings.setMarkColor(color);
                changeMarkColor(color);
            }
        } else {
            props.f7router.navigate('/add-custom-mark-color/', { props: { changeMarkColor }});
        }
    }

    return (
        <Page>
            <Navbar title={t('Add.textColor')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={curMarkColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={t('Add.textAddCustomColor')} link={'/add-custom-mark-color/'}></ListItem>
            </List>
        </Page>
    )
}));

export const PageCustomMarkColor = inject('storeApplicationSettings', 'storePalette')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Add', { returnObjects: true });
    const storePalette = props.storePalette;
    const storeApplicationSettings = props.storeApplicationSettings;
    const { changeMarkColor } = useContext(AddAnnotationContext);
    const markColor = storeApplicationSettings.markColor;
    const curMarkColor = typeof markColor === 'object' ? markColor.color : markColor;
    const autoColor = curMarkColor === 'auto' ? window.getComputedStyle(document.getElementById('font-color-auto'))?.backgroundColor : null;

    const addCustomMarkColor = (colors, color) => {
        storePalette.changeCustomColors(colors);
        changeMarkColor(color);
        storeApplicationSettings.setMarkColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={t('Add.textCustomColor')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose></Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker 
                autoColor={autoColor} 
                currentColor={curMarkColor}
                onAddNewColor={addCustomMarkColor}
            />
        </Page>
    )
}));

