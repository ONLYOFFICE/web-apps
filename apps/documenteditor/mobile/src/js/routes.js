
import HomePage from '../pages/home.jsx';

import LeftPage1 from '../pages/left-page-1.jsx';
import LeftPage2 from '../pages/left-page-2.jsx';
import DynamicRoutePage from '../pages/dynamic-route.jsx';
import RequestAndLoad from '../pages/request-and-load.jsx';

import { PageCollaboration, PageUsers } from '../../../../common/mobile/lib/view/Collaboration.jsx';

// Edit text
import { PageFonts, PageAdditionalFormatting, PageBullets, PageNumbers, PageLineSpacing } from "../components/edit/EditText";

var routes = [
  {
    path: '/',
    component: HomePage,
  },
    //Edit text
  {
    path: '/edit-text-fonts/',
    component: PageFonts,
  },
  {
    path: '/edit-text-add-formatting/',
    component: PageAdditionalFormatting,
  },
  {
    path: '/edit-text-bullets/',
    component: PageBullets,
  },
  {
    path: '/edit-text-numbers/',
    component: PageNumbers,
  },
  {
    path: '/edit-text-line-spacing/',
    component: PageLineSpacing,
  },
  {
    path: '/users/',
    component: PageUsers
  },
  {
    path: '/left-page-1/',
    component: LeftPage1,
  },
  {
    path: '/left-page-2/',
    component: LeftPage2,
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function (routeTo, routeFrom, resolve, reject) {
      // Router instance
      var router = this;

      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = routeTo.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            component: RequestAndLoad,
          },
          {
            context: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
];

export default routes;
