import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Icon, Row, Page, Navbar, BlockTitle, Toggle, Range, ListButton} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const PageStyle = props => {
    return (
        <Page>

        </Page>
    )
};

const PageWrap = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    const shapeObject = props.storeFocusObjects.shapeObject;
    const wrapType = storeShapeSettings.getWrapType(shapeObject);
    const align = storeShapeSettings.getAlign(shapeObject);
    const moveText = storeShapeSettings.getMoveText(shapeObject);
    const overlap = storeShapeSettings.getOverlap(shapeObject);
    const distance = Common.Utils.Metric.fnRecalcFromMM(storeShapeSettings.getWrapDistance(shapeObject));
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const [stateDistance, setDistance] = useState(distance);
    return (
        <Page>
            <Navbar title={_t.textWrap} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textInline} radio checked={wrapType === 'inline'} onClick={() => {props.onWrapType('inline')}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-inline"></Icon>}
                </ListItem>
                <ListItem title={_t.textSquare} radio checked={wrapType === 'square'} onClick={() => {props.onWrapType('square')}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-square"></Icon>}
                </ListItem>
                <ListItem title={_t.textTight} radio checked={wrapType === 'tight'} onClick={() => {props.onWrapType('tight')}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-tight"></Icon>}
                </ListItem>
                <ListItem title={_t.textThrough} radio checked={wrapType === 'through'} onClick={() => {props.onWrapType('through')}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-through"></Icon>}
                </ListItem>
                <ListItem title={_t.textTopAndBottom} radio checked={wrapType === 'top-bottom'} onClick={() => {props.onWrapType('top-bottom')}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-top-bottom"></Icon>}
                </ListItem>
                <ListItem title={_t.textInFront} radio checked={wrapType === 'infront'} onClick={() => {props.onWrapType('infront')}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-infront"></Icon>}
                </ListItem>
                <ListItem title={_t.textBehind} radio checked={wrapType === 'behind'} onClick={() => {props.onWrapType('behind')}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-behind"></Icon>}
                </ListItem>
            </List>
            {
                wrapType !== 'inline' &&
                <Fragment>
                <BlockTitle>{_t.textAlign}</BlockTitle>
                <List>
                    <ListItem className='buttons'>
                        <Row>
                            <a className={'button' + (align === Asc.c_oAscAlignH.Left ? ' active' : '')}
                               onClick={() => {
                                   props.onShapeAlign(Asc.c_oAscAlignH.Left)
                               }}>
                                <Icon slot="media" icon="icon-text-align-left"></Icon>
                            </a>
                            <a className={'button' + (align === Asc.c_oAscAlignH.Center ? ' active' : '')}
                               onClick={() => {
                                   props.onShapeAlign(Asc.c_oAscAlignH.Center)
                               }}>
                                <Icon slot="media" icon="icon-text-align-center"></Icon>
                            </a>
                            <a className={'button' + (align === Asc.c_oAscAlignH.Right ? ' active' : '')}
                               onClick={() => {
                                   props.onShapeAlign(Asc.c_oAscAlignH.Right)
                               }}>
                                <Icon slot="media" icon="icon-text-align-right"></Icon>
                            </a>
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

const PageReplace = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    let shapes = storeShapeSettings.getStyleGroups();
    shapes.splice(0, 1); // Remove line shapes
    return (
        <Page className="shapes">
            <Navbar title={_t.textReplace} backLink={_t.textBack} />
            {shapes.map((row, indexRow) => {
                return (
                    <ul className="row" key={'shape-row-' + indexRow}>
                        {row.map((shape, index) => {
                            return (
                                <li key={'shape-' + indexRow + '-' + index} onClick={() => {props.onReplace(shape.type)}}>
                                    <div className="thumb"
                                         style={{WebkitMaskImage: `url('resources/img/shapes/${shape.thumb}')`}}>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )
            })}
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
                <ListItem title={_t.textBringToForeground} link='#' onClick={() => {props.onReorder('all-up')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-foreground"></Icon>
                </ListItem>
                <ListItem title={_t.textSendToBackground} link='#' onClick={() => {props.onReorder('all-down')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-background"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveForward} link='#' onClick={() => {props.onReorder('move-up')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-forward"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveBackward} link='#' onClick={() => {props.onReorder('move-down')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-backward"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const EditShape = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Fragment>
            <List>
                <ListItem title={_t.textStyle}></ListItem>
                <ListItem title={_t.textWrap} link='/edit-shape-wrap/' routeProps={{
                    onWrapType: props.onWrapType,
                    onShapeAlign: props.onShapeAlign,
                    onMoveText: props.onMoveText,
                    onOverlap: props.onOverlap,
                    onWrapDistance: props.onWrapDistance
                }}></ListItem>
                <ListItem title={_t.textReplace} link='/edit-shape-replace/' routeProps={{
                    onReplace: props.onReplace
                }}></ListItem>
                <ListItem title={_t.textReorder} link='/edit-shape-reorder/' routeProps={{
                    onReorder: props.onReorder
                }}></ListItem>
            </List>
            <List>
                <ListButton title={_t.textRemoveShape} onClick={() => {props.onRemoveShape()}} className='button-red button-fill button-raised'/>
            </List>
        </Fragment>
    )
};

const EditShapeContainer = inject("storeFocusObjects")(observer(EditShape));
const PageStyleContainer = inject("storeFocusObjects")(observer(PageStyle));
const PageWrapContainer = inject("storeShapeSettings", "storeFocusObjects")(observer(PageWrap));
const PageReplaceContainer = inject("storeShapeSettings","storeFocusObjects")(observer(PageReplace));
const PageReorderContainer = inject("storeFocusObjects")(observer(PageReorder));

export {EditShapeContainer as EditShape,
        PageStyleContainer as PageStyle,
        PageWrapContainer as PageWrap,
        PageReplaceContainer as PageReplace,
        PageReorderContainer as PageReorder}