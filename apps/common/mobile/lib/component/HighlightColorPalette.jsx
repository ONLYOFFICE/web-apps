import React from 'react';
import { f7, ListItem, List, Icon, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const HighlightColorPalette = ({onColorClick, curColor}) => {
    const { t } = useTranslation();
    const highlightColors = [
        'FFFF00', '00FF00', '00FFFF', 'FF00FF', '0000FF', 'FF0000', '00008B', '008B8B',
        '006400', '800080', '8B0000', '808000', 'FFFFFF', 'D3D3D3', 'A9A9A9', '000000'
    ];

    return (
        <List>
            <ListItem>
                <div className='palette'>
                    <div className="row">
                        {highlightColors.map((effect, index) => {
                            return (
                                <a key={index} className={(curColor && (curColor.color === effect  || curColor === effect)) ? 'highlight-color active' : 'highlight-color'} style={{ background: `#${effect}`}} onClick={() => {onColorClick(effect)}}></a>
                            );
                        })}
                    </div>
                </div>
            </ListItem>
            <ListItem radio checked={true} title={t('Edit.textNoFill')}></ListItem>
        </List>
    )
};

export default HighlightColorPalette;