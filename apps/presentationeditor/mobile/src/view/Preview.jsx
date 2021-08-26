import React from 'react';

const Preview = () => {
    return (
        <div id="pe-preview" style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 14000}}>
            <div id="presentation-preview" style={{width: '100%', height: '100%'}}></div>
        </div>
    )
};

export default Preview;