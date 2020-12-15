import React from 'react';
import { View, Toolbar, Link } from 'framework7-react';

const viewStyle = {
    height: 30
};

const StatusbarView = props => {
    return <View id="idx-statusbar" style={viewStyle}>
                <Toolbar tabbar bottom>
                    <Link>Sheet 1</Link>
                    <Link>Sheet 2</Link>
                </Toolbar>
            </View>;
};

export default StatusbarView;
