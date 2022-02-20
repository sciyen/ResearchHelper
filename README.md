# Research Helper

This is a front-end only web tool which retrieves library from your [Zotero](https://www.zotero.org/) personal account and organizes your references according to the collection in it. The outputs can be used to generate `tags` in [diagrams.net](http://diagrams.net/), which allow one to make citations with unique hash key.

# The Website
- [Our customized drawio](https://sciyen.github.io/drawio/src/main/webapp/index.html?p=zotero.js)
- [The researcher helper](https://sciyen.github.io/ResearchHelper/publics/index.html)

## Quick start
1. Register a private API key from [here](https://www.zotero.org/settings/keys/new).
2. Lookup for your userID from [here](https://www.zotero.org/settings/keys).
3. Follow the steps in [this](https://github.com/sciyen/ResearchHelper/tree/main/plugins) to permanently add a plugin to your diagrams.
4. Obtain the citation list with [our tool](https://sciyen.github.io/ResearchHelper/publics/index.html) and copy to clipboard.
5. Paste the citation list to the `Tags` dialog in diagrams.net.
    + You can open the dialog by clicking `View > Tags`, where you can see all the tags that you already have.
    + Click `add` button and paste the citation list.
    + Click `add` button and all the citations will be imported.
6. Select a block, and add a tag from `Tags` dialog in your diagram.
7. And you should see the attached yellow block with standard citation.
    ![](https://i.imgur.com/Plw7U0k.png)

## Get involved
We are currently working on following subjects. Feel free to join us.
- Developing the plugin for diagrams.net, please checkout to `feature/drawio_plugin` for more details
- Auto-complete for uid and API key.
- Copy the outputs to clipboard automatically
- Unclassified documents will not shown in the tags. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
- The call number may be occupied by some useful information (usually in the literature of the book type), if it is used as a reference number field. As mentioned in [#2](https://github.com/sciyen/ResearchHelper/issues/2).
