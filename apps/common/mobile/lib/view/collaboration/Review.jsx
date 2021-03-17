import React, { Component, useEffect } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, NavRight, List, ListItem, Icon, Toggle, Toolbar, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../utils/device";

const PageReview = props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});

    const isDisableAllSettings = props.isReviewOnly || props.displayMode === "final" || props.displayMode === "original";
    const canReview = !!props.canReview;

    return (
       <Page>
           <Navbar title={_t.textReview} backLink={!props.noBack && _t.textBack}>
               {Device.phone &&
               <NavRight>
                   <Link sheetClose=".coauth__sheet">
                       <Icon icon='icon-expand-down'/>
                   </Link>
               </NavRight>
               }
           </Navbar>
           <List>
               {canReview &&
                    <ListItem title={_t.textTrackChanges} className={isDisableAllSettings ? 'disabled' : ''}>
                        <Toggle checked={props.trackChanges} onToggleChange={
                            (prev) => {
                                props.onTrackChanges(!prev);
                            }
                        }/>
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
                   <Icon slot="media" icon="icon-review-changes"></Icon>
               </ListItem>
               {canReview && !props.canUseReviewPermissions &&
                    <ListItem title={_t.textAcceptAllChanges} link='#'
                              className={'no-indicator' + (isDisableAllSettings ? ' disabled' : '')} onClick={() => {props.onAcceptAll();}}>
                        <Icon slot="media" icon="icon-accept-changes"></Icon>
                    </ListItem>
               }
               {canReview && !props.canUseReviewPermissions &&
                    <ListItem title={_t.textRejectAllChanges} link='#'
                              className={'no-indicator' + (isDisableAllSettings ? ' disabled' : '')} onClick={() => {props.onRejectAll();}}>
                        <Icon slot="media" icon="icon-reject-changes"></Icon>
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
                        <Icon icon='icon-expand-down'/>
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

const PageReviewChange = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const change = props.change;
    const displayMode = props.displayMode;
    const isLockAcceptReject = (!change || (change && !change.editable) || (displayMode === "final" || displayMode === "original") || !props.canReview);
    const isLockPrevNext = (displayMode === "final" || displayMode === "original");
    return (
        <Page className='page-review'>
            <Navbar title={_t.textReviewChange} backLink={!props.noBack && _t.textBack}>
                {Device.phone &&
                <NavRight>
                    <Link sheetClose=".coauth__sheet">
                        <Icon icon='icon-expand-down'/>
                    </Link>
                </NavRight>
                }
            </Navbar>
            <Toolbar position='bottom'>
                <span className='change-buttons row'>
                    {!props.isReviewOnly &&
                        <span className='accept-reject row'>
                            <Link id='btn-accept-change'
                                  href='#'
                                  className={isLockAcceptReject && 'disabled'}
                                  onClick={() => {props.onAcceptCurrentChange()}}
                            >{_t.textAccept}</Link>
                            <Link id='btn-reject-change'
                                  href='#'
                                  className={isLockAcceptReject && 'disabled'}
                                  onClick={() => {props.onRejectCurrentChange()}}
                            >{_t.textReject}</Link>
                        </span>
                    }
                    {props.isReviewOnly && change && change.editable &&
                        <span className='delete'>
                            <Link href='#' id="btn-delete-change" onClick={() => {props.onDeleteChange()}}>{_t.textDelete}</Link>
                        </span>
                    }
                    {props.goto && <Link href='#' id='btn-goto-change' onClick={() => {props.onGotoNextChange()}}><Icon slot='media' icon='icon-goto'/></Link>}
                </span>
                <span className='next-prev row'>
                    <Link id='btn-prev-change'
                          href='#'
                          onClick={() => {props.onPrevChange()}}
                          className={isLockPrevNext && 'disabled'}
                    ><Icon slot='media' icon='icon-prev-change'/></Link>
                    <Link id='btn-next-change'
                          href='#'
                          onClick={() => {props.onNextChange()}}
                          className={isLockPrevNext && 'disabled'}
                    ><Icon slot='media' icon='icon-next-change'/></Link>
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
};

const PageDisplayMode = inject("storeReview")(observer(DisplayMode));

export {PageReview, PageDisplayMode, PageReviewChange};