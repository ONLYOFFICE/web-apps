import React, { Component, useEffect } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, Icon, Toggle, Toolbar, Link } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../utils/device";

const PageReview = props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});

    return (
       <Page>
           <Navbar title={_t.textReview} backLink={_t.textBack}/>
           <List>
               <ListItem title={_t.textTrackChanges}>
                   <Toggle checked={props.trackChanges} onToggleChange={
                       (prev) => {
                           props.onTrackChanges(!prev);
                       }
                   }/>
               </ListItem>
               <ListItem title={_t.textDisplayMode} link={'/display-mode/'} routeProps={{
                   onDisplayMode: props.onDisplayMode
               }}/>
           </List>
           <List>
               <ListItem title={_t.textReviewChange} link={'/review-change/'}>
                   <Icon slot="media" icon="icon-review-changes"></Icon>
               </ListItem>
               <ListItem title={_t.textAcceptAllChanges} link='#' className='no-indicator' onClick={() => {
                   props.onAcceptAll();
               }}>
                   <Icon slot="media" icon="icon-accept-changes"></Icon>
               </ListItem>
               <ListItem title={_t.textRejectAllChanges} link='#' className='no-indicator' onClick={() => {
                   props.onRejectAll();
               }}>
                   <Icon slot="media" icon="icon-reject-changes"></Icon>
               </ListItem>
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
            <Navbar title={_t.textDisplayMode} backLink={_t.textBack}/>
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
    return (
        <Page className='page-review'>
            <Navbar title={_t.textReviewChange} backLink={_t.textBack}/>
            <Toolbar position='bottom'>
                <span className='change-buttons row'>
                    <span className='accept-reject row'>
                        <Link id='btn-accept-change' href='#' className={!change && 'disabled'}>{_t.textAccept}</Link>
                        <Link id='btn-reject-change' href='#' className={!change && 'disabled'}>{_t.textReject}</Link>
                    </span>
                    {props.goto && <Link href='#' id='btn-goto-change'><Icon slot='media' icon='icon-goto'/></Link>}
                </span>
                <span className='next-prev row'>
                    <Link id='btn-prev-change' href='#'><Icon slot='media' icon='icon-prev-change'/></Link>
                    <Link id='btn-next-change' href='#'><Icon slot='media' icon='icon-next-change'/></Link>
                </span>
            </Toolbar>
            {change ?
                <div className='block-description'>
                    <div className='header-change'>
                        {isAndroid &&
                        <div className='initials' style={{backgroundColor: `#${change.color}`}}>{change.initials}</div>}
                        <div className='info'>
                            <div id='user-name'>{change.userName}</div>
                            <div id='date-change'>{change.date}</div>
                        </div>
                    </div>
                    <div className='text' dangerouslySetInnerHTML={{__html: change.text}}></div>
                </div> :
                <div className='no-changes'>{_t.textNoChanges}</div>
            }
        </Page>
    )
};

const PageDisplayMode = inject("storeReview")(observer(DisplayMode));

export {PageReview, PageDisplayMode, PageReviewChange};