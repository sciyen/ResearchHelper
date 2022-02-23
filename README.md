# Research Helper

This is a plugin for [diagrams.net(drawio)](http://diagrams.net/) which retrieves library from your [Zotero](https://www.zotero.org/) personal account and organizes your references according to the collection in it. With this plugin, you can add tags for blocks with standard citation format.

# The Website
Please use [our customized drawio](https://sciyen.github.io/drawio/src/main/webapp/index.html?p=zotero.js). Third-party plugin is not allowed in the offical drawio webapp.

For developing usage, you can install this [chrome extension](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden/) to disable Content-Security-Policy for web application. And you can use our plugin on official web app directly.

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
        https://sciyen.github.io/ResearchHelper/plugins/zotero.js
        ```
        and click `Add`. Finally, apply the change and refresh the site.
5. Click `Extras > Reload Zotero` to load the library to the list of tags.
6. Select a block, and add a tag from `Tags` dialog (you can open it from `View > Tags`) in your diagram.
7. And you should see the attached yellow block with standard citation.
    ![](https://i.imgur.com/Plw7U0k.png)

## Get involved
We are currently working on following subjects. Feel free to join us.
- Developing the plugin for diagrams.net, please checkout to `feature/drawio_plugin` for more details
- Unclassified documents will not shown in the tags. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
- The call number may be occupied by some useful information (usually in the literature of the book type), if it is used as a reference number field. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
- Enhance user interface
