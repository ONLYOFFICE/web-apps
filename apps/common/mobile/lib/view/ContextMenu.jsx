/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Component } from 'react';
import { Popover, List, ListItem, ListButton, Link, Icon, Actions, ActionsGroup, ActionsButton } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon';

const idContextMenuElement = "idx-context-menu-popover";

class ContextMenuView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // f7.popover.open('#idx-context-menu-popover', '#idx-context-menu-target');
    }

    render() {
        const buttons = this.props.items || {};

        return (
            <Popover id={idContextMenuElement}
                     className="document-menu"
                     arrow={false}
                     backdrop={false}
                     closeByBackdropClick={false}
                     closeByOutsideClick={false}
                     onPopoverClosed={e => this.props.onMenuClosed()}
            >
                <List className="list-block">
                    {buttons.length && buttons.map((b, index) =>
                        !b.icon ?
                            <ListButton title={b.caption} key={index} onClick={e => this.props.onMenuItemClick(b.event)} /> :
                            <ListButton key={index} onClick={e => this.props.onMenuItemClick(b.event)}>
                                <SvgIcon slot="media" symbolId={b.icon} className={'icon icon-svg icon-svg__mask'} />
                            </ListButton>
                    )}
                </List>
            </Popover>
        )
    }
}

const ActionsWithExtraItems = ({items, onMenuItemClick, opened, onActionClosed}) => {
    const { t } = useTranslation();
    const _t = t('ContextMenu', {returnObjects: true});
    return (
        <Actions opened={opened} onActionsClosed={() => onActionClosed()}>
            <ActionsGroup>
                {items.length > 0 && items.map((item, index)=>{
                    return(
                        <ActionsButton key={`act-${index}`} onClick={() => {onMenuItemClick(item.event)}}>{item.caption}</ActionsButton>
                    )
                })}
            </ActionsGroup>
            <ActionsGroup>
                <ActionsButton>{_t.menuCancel}</ActionsButton>
            </ActionsGroup>
        </Actions>
    )
};

const exportedIdMenuElemen = `#${idContextMenuElement}`;
export {ContextMenuView as default, exportedIdMenuElemen as idContextMenuElement, ActionsWithExtraItems};
