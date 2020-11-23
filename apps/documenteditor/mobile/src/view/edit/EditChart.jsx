import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, ListButton, Icon, Row, Col, Button, Page, Navbar, Segmented, BlockTitle, Toggle, Range} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const PageStyle = props => {
    return (
        <Page>

        </Page>
    )
};

const PageWrap = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeChartSettings = props.storeChartSettings;
    const chartObject = props.storeFocusObjects.chartObject;
    const wrapType = storeChartSettings.getWrapType(chartObject);
    const align = storeChartSettings.getAlign(chartObject);
    const moveText = storeChartSettings.getMoveText(chartObject);
    const overlap = storeChartSettings.getOverlap(chartObject);
    const distance = Common.Utils.Metric.fnRecalcFromMM(storeChartSettings.getWrapDistance(chartObject));
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const [stateDistance, setDistance] = useState(distance);
    return (
        <Page>
            <Navbar title={_t.textWrap} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textInline} radio checked={wrapType === 'inline'} onClick={() => {props.onWrapType('inline')}}>
                    <Icon slot="media" icon="icon-wrap-inline"></Icon>
                </ListItem>
                <ListItem title={_t.textSquare} radio checked={wrapType === 'square'} onClick={() => {props.onWrapType('square')}}>
                    <Icon slot="media" icon="icon-wrap-square"></Icon>
                </ListItem>
                <ListItem title={_t.textTight} radio checked={wrapType === 'tight'} onClick={() => {props.onWrapType('tight')}}>
                    <Icon slot="media" icon="icon-wrap-tight"></Icon>
                </ListItem>
                <ListItem title={_t.textThrough} radio checked={wrapType === 'through'} onClick={() => {props.onWrapType('through')}}>
                    <Icon slot="media" icon="icon-wrap-through"></Icon>
                </ListItem>
                <ListItem title={_t.textTopAndBottom} radio checked={wrapType === 'top-bottom'} onClick={() => {props.onWrapType('top-bottom')}}>
                    <Icon slot="media" icon="icon-wrap-top-bottom"></Icon>
                </ListItem>
                <ListItem title={_t.textInFront} radio checked={wrapType === 'infront'} onClick={() => {props.onWrapType('infront')}}>
                    <Icon slot="media" icon="icon-wrap-infront"></Icon>
                </ListItem>
                <ListItem title={_t.textBehind} radio checked={wrapType === 'behind'} onClick={() => {props.onWrapType('behind')}}>
                    <Icon slot="media" icon="icon-wrap-behind"></Icon>
                </ListItem>
            </List>
            {
                wrapType !== 'inline' &&
                <Fragment>
                    <BlockTitle>{_t.textAlign}</BlockTitle>
                    <List>
                        <ListItem>
                            <Row>
                                <a className={'button' + (align === Asc.c_oAscAlignH.Left ? ' active' : '')}
                                   onClick={() => {
                                       props.onAlign(Asc.c_oAscAlignH.Left)
                                   }}>left</a>
                                <a className={'button' + (align === Asc.c_oAscAlignH.Center ? ' active' : '')}
                                   onClick={() => {
                                       props.onAlign(Asc.c_oAscAlignH.Center)
                                   }}>center</a>
                                <a className={'button' + (align === Asc.c_oAscAlignH.Right ? ' active' : '')}
                                   onClick={() => {
                                       props.onAlign(Asc.c_oAscAlignH.Right)
                                   }}>right</a>
                            </Row>
                        </ListItem>
                    </List>
                </Fragment>
            }
            <List>
                <ListItem title={_t.textMoveWithText} className={'inline' === wrapType ? 'disabled' : ''}>
                    <Toggle checked={moveText} onToggleChange={() => {props.onMoveText(!moveText)}}/>
                </ListItem>
                <ListItem title={_t.textAllowOverlap}>
                    <Toggle checked={overlap} onToggleChange={() => {props.onOverlap(!overlap)}}/>
                </ListItem>
            </List>
            {
                ('behind' !== wrapType && 'infront' !== wrapType) &&
                <Fragment>
                    <BlockTitle>{_t.textDistanceFromText}</BlockTitle>
                    <List>
                        <ListItem>
                            <div slot='inner' style={{width: '100%'}}>
                                <Range min={0} max={200} step={1} value={stateDistance}
                                       onRangeChange={(value) => {setDistance(value)}}
                                       onRangeChanged={(value) => {props.onWrapDistance(value)}}
                                ></Range>
                            </div>
                            <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                                {stateDistance + ' ' + metricText}
                            </div>
                        </ListItem>
                    </List>
                </Fragment>
            }
        </Page>
    )
};

const PageReorder = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Page>
            <Navbar title={_t.textReorder} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textBringToForeground} onClick={() => {props.onReorder('all-up')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-foreground"></Icon>
                </ListItem>
                <ListItem title={_t.textSendToBackground} onClick={() => {props.onReorder('all-down')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-background"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveForward} onClick={() => {props.onReorder('move-up')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-forward"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveBackward} onClick={() => {props.onReorder('move-down')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-backward"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const EditChart = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Fragment>
            <List>
                <ListItem title={_t.textStyle}></ListItem>
                <ListItem title={_t.textWrap} link='/edit-chart-wrap/' routeProps={{
                    onWrapType: props.onWrapType,
                    onAlign: props.onAlign,
                    onMoveText: props.onMoveText,
                    onOverlap: props.onOverlap,
                    onWrapDistance: props.onWrapDistance
                }}></ListItem>
                <ListItem title={_t.textReorder} link='/edit-chart-reorder/' routeProps={{
                    onReorder: props.onReorder
                }}></ListItem>
            </List>
            <List>
                <ListButton title={_t.textRemoveChart} onClick={() => {props.onRemoveChart()}} className='red'/>
            </List>
        </Fragment>
    )
};

const PageChartStyle = inject("storeFocusObjects")(observer(PageStyle));
const PageChartWrap = inject("storeChartSettings", "storeFocusObjects")(observer(PageWrap));

export {EditChart, PageChartStyle, PageChartWrap, PageReorder as PageChartReorder}