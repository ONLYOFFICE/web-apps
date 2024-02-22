[![License](https://img.shields.io/badge/License-GNU%20AGPL%20V3-green.svg?style=flat)](https://www.gnu.org/licenses/agpl-3.0.en.html)

# web-apps

The frontend for [ONLYOFFICE Document Server][2] and [ONLYOFFICE Desktop Editors](https://github.com/ONLYOFFICE/DesktopEditors). Builds the program interface and allows the user create, edit, save and export text documents, spreadsheets, and presentations.

## Project information

Official website: [https://www.onlyoffice.com/](https://www.onlyoffice.com "https://www.onlyoffice.com")

Code repository: [https://github.com/ONLYOFFICE/web-apps](https://github.com/ONLYOFFICE/web-apps "https://github.com/ONLYOFFICE/web-apps")

# Onlyoffice

R&D document: [https://docs.google.com/document/d/1AoNY1s_5eRTxvwHdlS2DcYon70tfvbj24eQNgXkc0Qs/edit#heading=h.l4dgzjogzgry](https://docs.google.com/document/d/1AoNY1s_5eRTxvwHdlS2DcYon70tfvbj24eQNgXkc0Qs/edit#heading=h.l4dgzjogzgry "https://docs.google.com/document/d/1AoNY1s_5eRTxvwHdlS2DcYon70tfvbj24eQNgXkc0Qs/edit#heading=h.l4dgzjogzgry")

## How to change the source code of the document editor?
For changing source code, need to setup development environment with using powershell (x86)
https://github.com/ONLYOFFICE/build_tools/tree/master/develop

Here we will change the web-apps repository for updating editor options. 

## How to compile ONLYOFFICE Docs for a local server?
https://helpcenter.onlyoffice.com/installation/docs-community-compile.aspx

Require os is 64-bit Ubuntu 16.04

# How to compile only web-app and deploy only documenteditor changes (in use)

1. For compile web-app, require sdkjs repository. So clone the repository beside the current repository

    ```
    cd ..
    git clone https://github.com/ONLYOFFICE/sdkjs.git
    ```

2. Make sure the version of the document editor is match with live document server version.

    - Check the current version of the document editor to follow the below link.
        ```
        // current: <document-server-url>/web-apps/apps/documenteditor/main/app.js
        // live: https://asc.docs.onlyoffice.com/web-apps/apps/documenteditor/main/app.js

        * Copyright (c) Ascensio System SIA 2023. All rights reserved
        *
        * http://www.onlyoffice.com 
        *
        * Version: 7.5.1 (build:23)
        */
        ```
    - Here you get two things, Version and build number. These both things to update in here. Set Version number with same value but build number use with 1 decrease, because it will be automatically increase during build.
        ```
        // path: /build/documenteditor.json

        "version": "7.5.1",
        "build": 22,
        ```

3. Now, ready to start build process using following commands. Run one by one

    ```
    cd build
    ./sprites.sh
    npm install
    grunt
    ```
    After the process, you notice that some files are changed and some new files are created. Don't commit those files to repo.

4. Once the process is completed, `deploy` folder generated on root. Now we are ready to move the documenteditor to production server
    ```
    local path: deploy/web-apps/apps/documenteditor/
        
    server path: /repos/OnlyOffice/deploy/web-apps/apps/documenteditor/
    ```
    Deployment is done. Now you can change the change on live


### If it is first time, then you have to change the docker command for start document server

```
sudo docker run -i -t -d -p <PORT>:80 --restart=always \
    -v /app/onlyoffice/DocumentServer/logs:/var/log/onlyoffice  \
    -v /app/onlyoffice/DocumentServer/data:/var/www/onlyoffice/Data  \
    -v /app/onlyoffice/DocumentServer/lib:/var/lib/onlyoffice \
    -v /app/onlyoffice/DocumentServer/db:/var/lib/postgresql \
    -v <SERVER_PATH>/repos/OnlyOffice/deploy/web-apps/apps/documenteditor/:/var/www/onlyoffice/documentserver/web-apps/apps/documenteditor/ \
    -e JWT_SECRET=<JWT_SECRET> onlyoffice/documentserver:7.5.1
```


#### If you have already docker, then remove it first and create new as above

1. Show the list of docker containers, get the name of container for next process
    ```
    docker ps -a
    ```
2. Stop the container
    ```
    docker container stop <container_name>
    ```
3. Remove old container
    ```
    docker rm <container_name>
    ```