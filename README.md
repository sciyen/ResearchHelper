# Research Helper

This is a plugin for [diagrams.net(drawio)](http://diagrams.net/) which retrieves library from your [Zotero](https://www.zotero.org/) personal account and organizes your references according to the collection in it. With this plugin, you can add tags for blocks with standard citation format.

# The Website
Please use [our customized drawio](https://sciyen.github.io/drawio/src/main/webapp/index.html?p=zotero.js). Third-party plugin is not allowed in the offical drawio webapp directly.

For developing usage, you can install this [chrome extension](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden/) to disable Content-Security-Policy for web application. And you can use our plugin on official web app. An additional approval is required after the reloading of the page. Please re-authorize it by clicking the `Disable Content-Security` button.

![](https://i.imgur.com/ArN7HQS.png)

## Quick start
1. Register a private API key from [here](https://www.zotero.org/settings/keys/new).
2. Lookup for your userID from [here](https://www.zotero.org/settings/keys).
3. Enter the personal account information to diagrams.net.
    + Click `Extras > Configurations` to configure the API key and UID.
        ```
        {
          "zotero_uid": "YOUR_UID",
          "zotero_api_key": "SOMEAPIKEY"
        }
        ```
4. Permanently add the plugin. 
    - Go to `Extra > Plugins...`
    - Click `Add` and `Custom...`
    - Enter 
        ```
        plugins/zotero.js
        ```
        <!--```
        https://sciyen.github.io/ResearchHelper/plugins/zotero.js
        ```-->
        and click `Add`. Finally, apply the change and **refresh the site**.  
    ![](https://i.imgur.com/cgqPJaz.png)
5. Click `Extras > Zotero Tag Selector...` to open tag selector.
6. Select a block in your diagram, and add a tag by clicking `Add` button or remove a tag by clicking `Remove`.
7. And you should see the attached yellow block with standard citation format.
    ![](https://i.imgur.com/26mARED.png)

## Steps to load plugin in official app website
After [20.3.0 release](https://github.com/jgraph/drawio/commit/b5dfeb238369d664fb06a95e2179236b0e75f366), the author prohibited the load of third party plugin. And therefore, we need extra steps to bypass this checking. If you have better method to deal with this, please let me know, thanks.
1. Press `F12` to open the dev tools, go to the `Source` tab, and open the file `top/app.diagrams.net/js/app.min.js`. Click the space left to the line number to add breakpoint at the beginning.
2. Turn on the `disable-content-security` extension to disable CSR protection. 
3. Refresh the page. You should notice that the page halts during loading.
4. Go to the `Console` tab in dev tools. Enter 
    ```
    window.ALLOW_CUSTOM_PLUGINS = true
    ```
    and excute it.
5. Resume the breakpoint.

## Get involved
We are currently working on following subjects. Feel free to join us.
- Developing the plugin for diagrams.net, please checkout to `feature/drawio_plugin` for more details
- Unclassified documents will not shown in the tags. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
- The call number may be occupied by some useful information (usually in the literature of the book type), if it is used as a reference number field. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
- Enhance user interface.

## Recommended method for debugging
[This vscode extension](https://marketplace.visualstudio.com/items?itemName=peakchen90.open-html-in-browser) allows you to host the files with local server. And 
[this chrome extension](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden/) allow you to add plugins from arbitary sources. Thus, you can debug in local without pushing it, which have been tested in windows 10 WSL 1.0.
