# Plugin for Diagrams.net

This plugin is modified from `number.js` in [offical repo](https://github.com/jgraph/drawio/tree/dev/src/main/webapp/plugins).

# Quick start

1. Visit our self-customized [diagrams](https://sciyen.github.io/drawio/src/main/webapp/index.html).
2. Permanently add the plugin. 
    - Go to `Extra > Plugins...`
    - Click `Add` and `Custom...`
    - Enter 
        ```
        https://sciyen.github.io/ResearchHelper/plugins/zotero.js
        ```
        and click `Add`. Finally, apply the change and refresh the site.

## Load items from [Zotero](zotero.org)
1. Follow the steps in [this](https://github.com/sciyen/ResearchHelper/tree/main) to add the tags.
2. Select a block, and add a tag from `Tags` dialog.
3. And you should see the attached yellow block with standard citation.
    ![](https://i.imgur.com/Plw7U0k.png)

# Current Issues
- Our self-host digrams can not be authorized by google drive because we don't have a server to handle `/google` request. (This is mentioned in this [issue](https://github.com/jgraph/drawio/issues/642#issuecomment-551271207)).
- The third-party plugins are not allowed to be added to official webapp because [this](https://github.com/jgraph/drawio/issues/958).
