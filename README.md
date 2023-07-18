# Research Helper

This is a plugin for [diagrams.net(drawio)](http://diagrams.net/) which retrieves the library from your [Zotero](https://www.zotero.org/) personal account and organizes your references according to the collection in it. With this plugin, you can add tags for blocks with standard citation format.

# The Website
Please use [our customized drawio](https://sciyen.github.io/drawio/src/main/webapp/index.html?p=zotero.js). A third-party plugin is not allowed in the official drawio web app directly.

## Quick Start
1. Add the plugin in [diagrams.net](https://sciyen.github.io/drawio/src/main/webapp/index.html?p=zotero.js). 
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
    ![](https://i.imgur.com/WZKridU.png)
2. Click `Extras > Zotero Tag Selector...` to open the tag selector.
3. Enter the personal account information to diagrams.net.
    - Register a private API key from [here](https://www.zotero.org/settings/keys/new).
    - Lookup for your userID from [here](https://www.zotero.org/settings/keys) (login first).
    - Enter the UID and keys, and click the `Refresh` button.
        ![](https://i.imgur.com/7IrpZmx.png)
6. Select a block in your diagram, and add a tag by clicking an item in the `Zotero Tag Selector`. You can also search an item by its title.
7. And you should see the attached block with standard citation format. The red indicates a journal paper; the blue indicates a conference paper.
    ![](https://i.imgur.com/RyzVzqi.png)

## Steps to Load Plugin in Official App Website (Alternative)
### Content-Security-Policy
For developing usage, you can install this [chrome extension](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden/) to disable Content-Security-Policy for a web application. And you can use our plugin on the official web app. Approval is required after the reloading of the page. Please re-authorize it by clicking the `Disable Content-Security` button.

![](https://i.imgur.com/ArN7HQS.png)

### Loading External Plugins
After [20.3.0 release](https://github.com/jgraph/drawio/commit/b5dfeb238369d664fb06a95e2179236b0e75f366), the author prohibited the load of third party plugin. And therefore, we need extra steps to bypass this checking. If you have a better method to deal with this, please let me know, thanks.
1. Press `F12` to open the dev tools, go to the `Source` tab, and open the file `top/app.diagrams.net/js/app.min.js`. Click the space left to the line number to add a breakpoint at the beginning.
2. Turn on the `disable-content-security` extension to disable CSR protection. 
3. Refresh the page. You should notice that the page halts during loading.
4. Go to the `Console` tab in dev tools. Enter 
    ```
    window.ALLOW_CUSTOM_PLUGINS = true
    ```
    and execute it.
5. Resume the breakpoint.

# Get Involved
We are currently working on the following subjects. Feel free to join us.
- Developing the plugin for diagrams.net, please checkout to `feature/drawio_plugin` for more details
- Unclassified documents will not shown in the tags. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
- The call number may be occupied by some useful information (usually in the literature of the book type) if it is used as a reference number field. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
- Enhance user interface.

## Recommended Method for Debugging
[This vscode extension](https://marketplace.visualstudio.com/items?itemName=peakchen90.open-html-in-browser) allows you to host the files with a local server. And 
[this chrome extension](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden/) allows you to add plugins from arbitrary sources. So, you can just debug locally without pushing it, which has been tested in Windows 10 WSL 1.0.

Since [20.3.0 release](https://github.com/jgraph/drawio/commit/b5dfeb238369d664fb06a95e2179236b0e75f366), one needs to force the external plugin from different domain available by the following steps. 
1. Press F12 to open the dev tools, go to the Source tab, and open the file `top/app.diagrams.net/index.html`. Click the space left to the line number to add a breakpoint at the beginning.
2. Turn on the disable-content-security extension to disable CSR protection.
3. Refresh the page. You should notice that the page halts during loading.
4. Find `App.isSameDomain(l[t])` and change it to `1||App.isSameDomain(l[t])` and press `ctrl+s` to save.
5. Resume the breakpoint.
