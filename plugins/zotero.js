// load zotero api
var script = document.createElement('script');
script.src = "https://unpkg.com/zotero-api-client";
document.head.appendChild(script);

var zoteroApi; // will be set after load
const str_token = '::';

/* get author information */
function get_author(authors) {
	if (typeof authors === 'undefined' || authors.length <= 0)
		return "Unknown author"
	if (authors.length >= 3)
		return authors[0].lastName + " et.al."
	if (authors.length == 2)
		return authors[0].lastName + " & " + authors[1].lastName
	return authors[0].lastName;
}

/* get year information */
function get_year(date) {
	function filter_year(tokens) {
		for (const t of tokens) {
			y = parseInt(t)
			if (!isNaN(y) && y > 50 && y < 10000)
				return t
		}
	}
	if (typeof date === 'undefined' || date == "")
		return "Unknown year"
	return filter_year(date.split(/[-/,]/))
}

/* get details*/
function get_tagname(item) {
    return '[' + item.title + str_token + get_author(item.creators) + " " + get_year(item.date) + str_token + item.key + ']'
}

script.onload = () => {
zoteroApi = ZoteroApiClient.default;
Draw.loadPlugin(function (ui) {

	function refresh_ui(){
		selected_tags = graph.getCommonTagsForCells(graph.getSelectionCells())
		key_list = []
		selected_tags.forEach((tag)=>{
			token = tag.split(str_token)
			token = token[token.length-1]
			key_list.push('item_' + token.substring(0, token.length-1))
		})

		var root_div = document.getElementById('references')
		root_div.querySelectorAll('.item').forEach((item)=>{
			btn = item.querySelector('button')
			if (key_list.includes(item.id)){
				btn.innerHTML = 'Remove'
				item.style.setProperty("background-color", "#55BB22", "important"); //8888EE
			}
			else {
				btn.innerHTML = 'Add'
				item.style.setProperty("background-color", null, "important");
			}
		})
	}

	/* Retrieve library from Zotero API */
	async function retreive_draw(ApiKey, Uid, callback) {
		const myapi = zoteroApi(ApiKey, {
			'limit': 100
		}).library('user', Uid)
	
		try {
			const collectionsRes = await myapi.collections().get();
			collection_names = {}
			collection_list = {}
			promises = []
			counter = 1
	
			function get_collection_id(hash) {
				return 'collection_' + hash
			}
	
			var root_div = document.getElementById('references')
			root_div.innerHTML = ''
			function tree_build(target) {
				if (collection_list[target].build) return;
				
				function create_new_collection(target){
					collection_div = document.createElement('div')
					collection_div.style.margin = '2px 0 2px 0'
					collection_div.style.paddingLeft = '2px'
					collection_div.style.borderStyle = 'solid'
					collection_div.style.borderWidth = '0 0 0 2px'
					collection_div.innerHTML = '<h5 style="margin-bottom:5px">' + collection_list[target].name + '</h5>'
					collection_div.setAttribute('id', get_collection_id(target))	
					mxEvent.addListener(collection_div, 'mouseenter', (evt)=>{
						evt.target.style.backgroundColor = '#ffeb54'
					})

					mxEvent.addListener(collection_div, 'mouseleave', (evt)=>{
						evt.target.style.backgroundColor = null
					})
					return collection_div
				}

				new_collection_div = create_new_collection(target)
				if (collection_list[target].hasParent) {
					parent_hash = collection_list[target].parentCollection
					if (collection_list[parent_hash].build) {
						root_div.querySelector('#' + get_collection_id(parent_hash))
							.append(new_collection_div)
					}
					else {
						// Parent haven't built
						tree_build(parent_hash)
						root_div.querySelector('#' + get_collection_id(parent_hash))
							.append(create_new_collection(target))
					}
				}
				else {
					// Append directly
					root_div.append(new_collection_div)
				}
				collection_list[target].build = true
			}
	
			// Retrieve collection information
			for (const [i, c] of collectionsRes.raw.entries()) {
				collection_list[c.key] = {
					'key': c.key,
					'name': c.data.name,
					'hasParent': c.data.parentCollection !== false,
					'parentCollection': c.data.parentCollection,
					'build': false
				}
			}
	
			// Build collection container
			for (const [key, value] of Object.entries(collection_list)) {
				tree_build(key, () => { })
			}
	
			promises = []
			for (const [i, c] of collectionsRes.raw.entries()) {
				// Add promises to request for the items in collection
				promises.push(new Promise((resolve, reject) => {
					const itemRes = myapi.collections(c.key).items().get()
					resolve(itemRes)
				}))
			}
	
			// Append the content when the data available
			for (const p of promises) {
				p.then((itemRes) => {
					const items = itemRes.getData()
					items.forEach(item => {
						if (item.itemType != "attachment") {
							console.log(item)
							item_id = 'item_' + item.key
							number = (typeof item.callNumber === 'undefined') ? ('') : (String(item.callNumber))
	
							citation = `[${number}: ${get_author(item.creators)} ${get_year(item.date)}]`
							div_item = document.createElement('div')
							div_item.setAttribute('id', item_id)
							div_item.classList.add('item')
							div_item.style.borderRadius = '4px';
							div_item.style.borderStyle = 'solid';
							div_item.style.borderWidth = '1px';
							div_item.style.marginBottom = '2px';
							div_item.style.padding = '2px 2px 2px 2px';
							div_item.innerHTML = '<p style="margin:0">' + item.title + '</p>' + '<span style="margin:0; color:#R00">' + citation + '</span>'
	
							// Generate metadata for drawio plugin
							// \u4e00-\u9fa5 is used to match Chinese character
							kname = get_tagname(item).replace(/[^a-zA-Z0-9/.,&:\]\[\u4e00-\u9fa5]/g, "_")

							btn = document.createElement('button')
							btn.innerHTML = 'Add'
							btn.setAttribute('value', kname)
							btn.style.display = 'inline-block'
							btn.style.borderRadius = '4px';
							btn.style.borderWidth = '1px';
							btn.style.setProperty("background", null, "important");
	
							mxEvent.addListener(btn, 'click', (evt)=>{
								if (evt.target.innerHTML == 'Add'){
									evt.target.innerHTML = 'Remove'
									graph.addTagsForCells(graph.getSelectionCells(), [evt.target.value]);
								}
								else{
									evt.target.innerHTML = 'Add'
									graph.removeTagsForCells(graph.getSelectionCells(), [evt.target.value]);
								}
							})
							div_item.append(btn)

							/*mxEvent.addListener(div_item, 'mouseenter', (evt)=>{
								evt.target.style.backgroundColor = '#55BB22'
							})

							mxEvent.addListener(div_item, 'mouseleave', (evt)=>{
								evt.target.style.backgroundColor = null
							})*/
	
							item.collections.forEach((ckey) => {
								collection_id = 'collection_' + ckey
								collection_name = collection_names[ckey]
								if (root_div.querySelector(`#${collection_id}>#${item_id}`) == null)
									root_div.querySelector('#' + collection_id).append(div_item)
							})
							counter += 1
						}
					})
				})
			}
	
			// Wait for all promise to finish no matter if it succeeded or rejected
			Promise.allSettled(promises).then(([result]) => {
				callback()
			})
		}
		catch (err) {
			console.log(err)
			alert("Error: " + String(err) + '\nPlease check the UID and API key!')
		}
	}

	var TagSelectorWindow = function(editorUi, x, y, w, h){
		var graph = editorUi.editor.graph;
	
		var div = document.createElement('div');
		div.style.overflow = 'hidden';
		div.style.padding = '12px 8px 12px 8px';
		div.style.height = 'auto';
	
		var updateBtn = document.createElement('button');
		updateBtn.innerHTML = 'Refresh'
		div.appendChild(updateBtn);
	
		var filterInput = document.createElement('input');
		filterInput.setAttribute('placeholder', 'Type in the tags and press Enter to add them');
		filterInput.setAttribute('type', 'text');
		filterInput.style.width = '100%';
		filterInput.style.boxSizing = 'border-box';
		filterInput.style.fontSize = '12px';
		filterInput.style.borderRadius = '4px';
		filterInput.style.padding = '4px';
		filterInput.style.marginBottom = '8px';
		div.appendChild(filterInput);

		var referenceDiv = document.createElement('div');
		referenceDiv.setAttribute('id', 'references')
		referenceDiv.style.width = '100%';
		referenceDiv.style.overflow = 'hidden';
		referenceDiv.style.padding = '12px 8px 12px 8px';
		div.appendChild(referenceDiv);
	
		this.window = new mxWindow(mxResources.get('tagSelector'), div, x, y, w, null, true, true);
		this.window.destroyOnClose = false;
		this.window.setMaximizable(false);
		this.window.setResizable(true);
		this.window.setScrollable(true);
		this.window.setClosable(true);
		this.window.contentWrapper.style.overflowY = 'scroll';
	
		mxEvent.addListener(filterInput, 'keyup', function(){
			// Do something
			console.log('keyup')
		});
	
		mxEvent.addListener(updateBtn, 'click', function(evt){
			evt.target.setAttribute('disabled', 'disabled')
		
			// load from Zotero Api and add them to the list of tags (tags for the root)
			config = JSON.parse(localStorage.getItem(".configuration"));
			zotero_uid = parseInt(config['zotero_uid'], 10);
			zotero_api_key = config['zotero_api_key'];

			if (typeof(zotero_api_key) === 'undefined' || isNaN(zotero_uid))
				alert('Please fill the zotero user id and api key before using this plugin. For more details, please refer to https://github.com/sciyen/ResearchHelper/tree/feature/drawio_plugin')
			else{
				graph = ui.editor.graph;
				root = graph.model.getRoot();
			
				retreive_draw(zotero_api_key, zotero_uid, (citations) => {
					evt.target.removeAttribute('disabled')
				});
			}
		});
	
		this.window.addListener('show', mxUtils.bind(this, function(){
			this.window.fit();
			
			if (this.window.isVisible()){
			}
			else{
				graph.container.focus();
			}
		}));

		graph.selectionModel.addListener(mxEvent.CHANGE, function(sender, evt){
			refresh_ui();
		});
		
		graph.model.addListener(mxEvent.CHANGE, function(sender, evt){
			refresh_ui();
		});
		
		this.window.setLocation = function(x, y){
			var iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
			var ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
			
			x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
			y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));
	
			if (this.getX() != x || this.getY() != y){
				mxWindow.prototype.setLocation.apply(this, arguments);
			}
		};
		
		var resizeListener = mxUtils.bind(this, function(){
			var x = this.window.getX();
			var y = this.window.getY();
			
			this.window.setLocation(x, y);
		});
		
		mxEvent.addListener(window, 'resize', resizeListener);
	
		this.destroy = function(){
			mxEvent.removeListener(window, 'resize', resizeListener);
			this.window.destroy();
		}
	}
	
	function setupTagSelector(ui){
		// Adds resource for action
		mxResources.parse('tagSelector=Zotero Tag Selector');
	
		// Adds action
		ui.actions.addAction('tagSelector...', () => {
			if (ui.tagSelectorWindow == null)
			{
				ui.tagSelectorWindow = new TagSelectorWindow(ui, document.body.offsetWidth - 380, 120, 300, 240);
				ui.tagSelectorWindow.window.addListener('show', function()
				{
					ui.fireEvent(new mxEventObject('tagSelector'));
				});
				ui.tagSelectorWindow.window.addListener('hide', function()
				{
					ui.fireEvent(new mxEventObject('tagSelector'));
				});
				ui.tagSelectorWindow.window.setVisible(true);
				ui.fireEvent(new mxEventObject('tagSelector'));
			}
			else
			{
				ui.tagSelectorWindow.window.setVisible(!ui.tagSelectorWindow.window.isVisible());
			}
		});
	
		// Adds menu item for refreshing
		let menu = ui.menus.get('extras');
		let oldFunct = menu.funct;
		
		menu.funct = function(menu, parent)
		{   
			oldFunct.apply(this, arguments);
			ui.menus.addMenuItems(menu, ['-', 'tagSelector'], parent);
		};
	}

	setupTagSelector(ui);

	// Adds numbered toggle property
	Editor.commonVertexProperties.push({
		name: 'numbered', dispName: 'Numbered', type: 'bool', defVal: true, isVisible: function (state, format) {
			var graph = format.editorUi.editor.graph;

			return graph.view.redrawNumberShape != null;
		}, onChange: function (graph, newValue) {
			graph.refresh();
		}
	});

	var graph = ui.editor.graph;
	var enabled = true;

	var graphViewResetValidationState = graph.view.resetValidationState;

	graph.view.resetValidationState = function () {
		graphViewResetValidationState.apply(this, arguments);
		this.numberCounter = 0;
	};

	var graphViewValidateCellState = graph.view.validateCellState;

	graph.view.validateCellState = function (cell, recurse) {
		var state = graphViewValidateCellState.apply(this, arguments);
		recurse = (recurse != null) ? recurse : true;

		if (recurse && state != null && graph.model.isVertex(state.cell) &&
			mxUtils.getValue(state.style, 'numbered', 1) == 1) {
			this.numberCounter++;
			this.redrawNumberShape(state);
		}

		return state;
	};

	function citation_pretty_print(token) {
		return '[' + token[1].replace(/[^a-zA-Z0-9/.,&:\]\[]/g, " ") + ']'
		//return token[0] + ': ' + token[3].replace(/[^a-zA-Z0-9/.,&:\]\[]/g, " ") + ']'
	}

	function get_citation_info(tag) {
		token = tag.split('::')
		item = {
			'id': token[0],
			'collection': token[1],
			'title': token[2],
			'citation': citation_pretty_print(token),
			'key': token[4]
		}
		return item
	}

	graph.view.redrawNumberShape = function (state) {
		var numbered = mxUtils.getValue(state.style, 'numbered', 1) == 1;

		// Generate tag item
		citation = ''
		tags = graph.getTagsForCell(state.cell);
		if (tags.length > 0) {
			tags.split(' ').forEach((tag) => {
				info = get_citation_info(tag)
				citation += info.citation + ' \n'
			})
		}

		var value = '<div style="padding:2px;border:1px solid gray;background:yellow;border-radius:2px;">'
			+ citation + '</div>';


		if (enabled && numbered && (citation != '') && graph.model.isVertex(state.cell) &&
			state.shape != null && state.secondLabel == null) {
			state.secondLabel = new mxText(value, new mxRectangle(),
				mxConstants.ALIGN_LEFT, mxConstants.ALIGN_BOTTOM);

			// Styles the label
			state.secondLabel.size = 12;
			state.secondLabel.dialect = mxConstants.DIALECT_STRICTHTML;
			graph.cellRenderer.initializeLabel(state, state.secondLabel);
		}

		if (state.secondLabel != null) {
			if (!numbered) {
				state.secondLabel.destroy();
				state.secondLabel = null;
			}
			else {
				var scale = graph.getView().getScale();
				var bounds = new mxRectangle(state.x + state.width - 4 * scale, state.y + 4 * scale, 0, 0);
				state.secondLabel.value = value;
				state.secondLabel.state = state;
				state.secondLabel.scale = scale;
				state.secondLabel.bounds = bounds;
				state.secondLabel.redraw();
			}
		}
	};

	// Destroys the shape number
	var destroy = graph.cellRenderer.destroy;
	graph.cellRenderer.destroy = function (state) {
		destroy.apply(this, arguments);

		if (state.secondLabel != null) {
			state.secondLabel.destroy();
			state.secondLabel = null;
		}
	};

	graph.cellRenderer.getShapesForState = function (state) {
		return [state.shape, state.text, state.secondLabel, state.control];
	};

	// Extends View menu
	mxResources.parse('number=Number');

	// Adds action
	var action = ui.actions.addAction('number...', function () {
		enabled = !enabled;
		graph.refresh();
	});

	action.setToggleAction(true);
	action.setSelectedCallback(function () { return enabled; });

	var menu = ui.menus.get((urlParams['sketch'] == '1') ? 'extras' : 'view');
	var oldFunct = menu.funct;

	menu.funct = function (menu, parent) {
		oldFunct.apply(this, arguments);

		ui.menus.addMenuItems(menu, ['-', 'number'], parent);
	};

	// Forces refresh if file was loaded before plugin
	if (ui.getCurrentFile() != null) {
		graph.refresh();
	}
});
};