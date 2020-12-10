
import MainPage from '../page/main';

import { PageCollaboration, PageUsers } from '../../../../common/mobile/lib/view/Collaboration.jsx';

var routes = [
    {
        path: '/',
        component: MainPage,
    },
    {
        path: '/users/',
        component: PageUsers
    },
];

export default routes;
