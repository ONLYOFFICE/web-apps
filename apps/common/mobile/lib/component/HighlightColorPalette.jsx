import React from 'react';
import { f7, ListItem, List, Icon, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const HighlightColorPalette = ({changeColor, curColor}) => {
    const { t } = useTranslation();
    const highlightColors = [
        ['ffff00', '00ff00', '00ffff', 'ff00ff', '0000ff', 'ff0000', '00008b', '008b8b'],
        ['006400', '800080', '8b0000', '808000', 'ffffff', 'd3d3d3', 'a9a9a9', '000000']
    ];

    return (
        <List>
            <ListItem>
                <div className='highlight-palette'>
                    {highlightColors.map((row, index) => (
                        <div key={index} className="row">
                            {row.map((effect, index) => {
                                return (
                                    <a key={index} className={(curColor && (curColor.color === effect  || curColor === effect)) ? 'highlight-color highlight-color_active' : 'highlight-color'} style={{ background: `#${effect}`}} onClick={() => {changeColor(effect)}}></a>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </ListItem>
            <ListItem radio checked={(curColor && curColor === 'transparent')} onClick={() => changeColor('transparent')} title={t('Edit.textNoFill')}></ListItem>
        </List>
    )
};

export default HighlightColorPalette;