import React, { Component, useEffect } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, NavRight, List, ListItem, Icon, Toggle, Toolbar, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconReviewChangesIos from '@common-ios-icons/icon-review-changes.svg?ios';
import IconReviewChangesAndroid from '@common-android-icons/icon-review-changes.svg';
import IconAcceptChangesIos from '@common-ios-icons/icon-accept-changes.svg?ios';
import IconAcceptChangesAndroid from '@common-android-icons/icon-accept-changes.svg';
import IconRejectChangesIos from '@common-ios-icons/icon-reject-changes.svg?ios';
import IconRejectChangesAndroid from '@common-android-icons/icon-reject-changes.svg';
import IconGotoIos from '@common-ios-icons/icon-goto.svg';
import IconGotoAndroid from '@common-android-icons/icon-goto.svg';
import IconPrevChangeIos from '@common-ios-icons/icon-prev-change.svg?ios';
import IconPrevChangeAndroid from '@common-android-icons/icon-prev-change.svg';
import IconNextChangeIos from '@common-ios-icons/icon-next-change.svg?ios';
import IconNextChangeAndroid from '@common-android-icons/icon-next-change.svg';

const PageReview = props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const isProtected = props.isProtected;
    const isDisableAllSettings = props.isReviewOnly || props.displayMode === "final" || props.displayMode === "original";
    const canReview = !!props.canReview;

    return (
       <Page>
           <Navbar title={_t.textReview} backLink={!props.noBack && _t.textBack}>
               {Device.phone &&
               <NavRight>
                   <Link sheetClose=".coauth__sheet">
                        {Device.ios ?
                            <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                        }
                   </Link>
               </NavRight>
               }
           </Navbar>
           <List>
               {canReview &&
                    <ListItem title={_t.textTrackChanges} className={isDisableAllSettings ? 'disabled' : ''} disabled={isProtected}>
                        <Toggle checked={props.trackChanges} onToggleChange={() => props.onTrackChanges(!props.trackChanges)} />
                    </ListItem>
               }
               {!props.isRestrictedEdit &&
                    <ListItem title={_t.textDisplayMode} link={'/display-mode/'} routeProps={{
                        onDisplayMode: props.onDisplayMode
                    }}/>
               }
           </List>
           <List>
               <ListItem title={_t.textReviewChange} link={'/review-change/'}>
                   {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconReviewChangesIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconReviewChangesAndroid.id} className={'icon icon-svg'} />
                    }
               </ListItem>
               {canReview && !props.canUseReviewPermissions && !isProtected &&
                    <ListItem title={_t.textAcceptAllChanges} link='#'
                              className={'no-indicator' + (isDisableAllSettings ? ' disabled' : '')} onClick={() => {props.onAcceptAll();}}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconAcceptChangesIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconAcceptChangesAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
               }
               {canReview && !props.canUseReviewPermissions && !isProtected &&
                    <ListItem title={_t.textRejectAllChanges} link='#'
                              className={'no-indicator' + (isDisableAllSettings ? ' disabled' : '')} onClick={() => {props.onRejectAll();}}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconRejectChangesIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconRejectChangesAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
               }
           </List>
       </Page>
    )
};

const DisplayMode = props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const mode = props.storeReview.displayMode;
    return (
        <Page>
            <Navbar title={_t.textDisplayMode} backLink={_t.textBack}>
                {Device.phone &&
                <NavRight>
                    <Link sheetClose=".coauth__sheet">
                        {Device.ios ? 
                            <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                        }
                    </Link>
                </NavRight>
                }
            </Navbar>
            <List mediaList>
                <ListItem title={_t.textMarkup}
                          subtitle={_t.textAllChangesEditing}
                          radio
                          checked={mode === 'markup'}
                          onClick={() => {
                              props.onDisplayMode('markup');
                          }}
                ></ListItem>
                <ListItem title={_t.textFinal}
                          subtitle={_t.textAllChangesAcceptedPreview}
                          radio
                          checked={mode === 'final'}
                          onClick={() => {
                              props.onDisplayMode('final');
                          }}
                ></ListItem>
                <ListItem title={_t.textOriginal}
                          subtitle={_t.textAllChangesRejectedPreview}
                          radio
                          checked={mode === 'original'}
                          onClick={() => {
                              props.onDisplayMode('original');
                          }}
                ></ListItem>
            </List>
        </Page>
    )
};

const PageReviewChange = inject("storeAppOptions")(observer(props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const change = props.change;
    const displayMode = props.displayMode;
    const isLockAcceptReject = (!change || (change && !change.editable) || (displayMode === "final" || displayMode === "original") || !props.canReview);
    const isLockPrevNext = (displayMode === "final" || displayMode === "original");
    const appOptions = props.storeAppOptions;
    const isProtected = appOptions.isProtected;

    return (
        <Page className='page-review'>
            <Navbar title={_t.textReviewChange} backLink={!props.noBack && _t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose=".coauth__sheet">
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <Toolbar position='bottom'>
                <span className='change-buttons row'>
                    {(!props.isReviewOnly && !isProtected) &&
                        <span className='accept-reject row'>
                            <Link id='btn-accept-change'
                                  href='#'
                                  className={(isLockAcceptReject) && 'disabled'}
                                  onClick={() => {props.onAcceptCurrentChange()}}
                            >{_t.textAccept}</Link>
                            <Link id='btn-reject-change'
                                  href='#'
                                  className={(isLockAcceptReject) && 'disabled'}
                                  onClick={() => {props.onRejectCurrentChange()}}
                            >{_t.textReject}</Link>
                        </span>
                    }
                    {!props.isReviewOnly && change && change?.editable &&
                        <span className='delete'>
                            <Link href='#' id="btn-delete-change" onClick={() => {props.onDeleteChange()}}>{_t.textDelete}</Link>
                        </span>
                    }
                    {props.goto && <Link href='#' id='btn-goto-change' onClick={() => {props.onGotoNextChange()}}>
                            {Device.ios ? 
                                <SvgIcon slot="media" symbolId={IconGotoIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon slot="media" symbolId={IconGotoAndroid.id} className={'icon icon-svg'} />
                            }</Link>}
                </span>
                <span className='next-prev row'>
                    <Link id='btn-prev-change'
                          href='#'
                          onClick={() => {props.onPrevChange()}}
                          className={isLockPrevNext && 'disabled'}
                    >{Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconPrevChangeIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconPrevChangeAndroid.id} className={'icon icon-svg'} />
                    }</Link>
                    <Link id='btn-next-change'
                          href='#'
                          onClick={() => {props.onNextChange()}}
                          className={isLockPrevNext && 'disabled'}
                    >{Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconNextChangeIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconNextChangeAndroid.id} className={'icon icon-svg'} />
                    }</Link>
                </span>
            </Toolbar>
            {change ?
                <div className='block-description'>
                    <div className='header-change'>
                        {isAndroid &&
                            <div className='initials' style={{backgroundColor: `#${change.color}`}}>{change.initials}</div>
                        }
                        <div className='info'>
                            <div className='user-name'>{change.userName}</div>
                            <div className='date-change'>{change.date}</div>
                        </div>
                    </div>
                    <div className='text'>{change.text}</div>
                </div> :
                <div className='no-changes'>{_t.textNoChanges}</div>
            }
        </Page>
    )
}));

const PageDisplayMode = inject("storeReview")(observer(DisplayMode));

export {PageReview, PageDisplayMode, PageReviewChange};