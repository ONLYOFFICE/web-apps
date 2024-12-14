import React from 'react';

export default function SvgIcon({ symbolId, className = 'svg-icon', ...props }) {
    return (
        <svg className={className} {...props}>
            <use href={`#${symbolId}`} />
        </svg>
    );
}
