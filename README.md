# Research Helper

This is a front-end only web tool which retrieves library from your [Zotero](https://www.zotero.org/) personal account and organizes your references according to the collection in it. The outputs can be used to generate `tags` in [diagrams.net](http://diagrams.net/), which allow one to make citations with unique hash key.

## Quick start
1. Register a private API key from [here](https://www.zotero.org/settings/keys/new).
2. Lookup for your userID from [here](https://www.zotero.org/settings/keys).
3. Obtain the citation list with [our tool](https://sciyen.github.io/ResearchHelper/publics/index.html).
4. Paste the citation list to the `Tags` dialog in diagrams.net.
    + You can open the dialog by clicking `View > Tags`, where you can see all the tags that you already have.
    + Click `add` button and paste the citation list.
    + Click `add` button and all the citations will be imported.
5. Now, you can add tags to any block you want.


## Get involved
We are currently working on following subjects. Feel free to join us.
- Developing the plugin for diagrams.net, please checkout to `feature/drawio_plugin` for more details
- Auto complete for uid and API key.
- Copy the outputs to clipboard automatically
- Visualize tag information directly on the blocks.