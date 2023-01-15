// load zotero api
var script = document.createElement('script');
script.src = "https://unpkg.com/zotero-api-client";
document.head.appendChild(script);

// Loading icon image
var style = document.createElement('link');
style.setAttribute('rel', 'stylesheet');
style.setAttribute('href', "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css")
document.head.appendChild(style);

var zoteroApi; // will be set after load
const str_token = '::';
var item_list = {};

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
.collapsible { 
	max-height: 0;
	overflow: hidden;
	transition: max-height 0.2s ease-out;
}
.default_input_box {
	box-sizing: border-box;
	font-size = 12px;
	border-radius = 4px;
	padding = 4px;
	margin-bottom = 8px;
}
.title_header {
	margin: 0 0 10px 0;
	text-align: center;
	justify-content: center;
}
.item > p > a {
	color: black;
	text-decoration: none;
	cursor: help;
}
.collection {
	margin: 2px 0 2px 0;
	padding-left: 5px;
	border-style: solid;
	border-width: 0 0 0 2px;
}
.item_container {
	width: 100%;
	background-color: white;
	overflow: hidden;
	padding: 12px 8px 12px 8px;
}
.default_btn {
	width: 40%;
	margin: 5px auto 5px auto;
}
.btn_container {
	width: 100%;
	background-color: white;
	text-align: center;
	justify-content: center;
}
.btn_container > button{
	width: 40%;
	margin: 5px;
	border-width: 1px !important;
	border-radius: 3px !important;
	border-color: gray !important;
	background: none !important;
	float: none !important;
	transition-duration: 0.4s;
}
.btn_container > button:hover{
	background-color: #222222 !important;;
  	color: white;
}
`;
document.getElementsByTagName('head')[0].appendChild(style);

script.onload = () => {
zoteroApi = ZoteroApiClient.default;
Draw.loadPlugin(function (ui) {
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
			btn = item.querySelector('.btn')
			if (key_list.includes(item.id)){
				btn.setAttribute('state', 'Remove')
				item.style.setProperty("background-color", "#55BB22AA", "important"); //8888EE
			}
			else {
				btn.setAttribute('state', 'Add')
				item.style.setProperty("background-color", null, "important");
			}
		})
	}
	
	function get_collection_id(hash) {
		return 'collection_' + hash
	}

	function get_item_id(hash) {
		return 'item_' + hash
	}

	function set_item_click_evt(div_item) {
		mxEvent.addListener(div_item, 'click', (evt)=>{
			state = evt.target.getAttribute('state')
			value = evt.target.getAttribute('value')
			if (state == 'Add'){
				evt.target.setAttribute('state', 'Remove')
				console.log('add')
				graph.addTagsForCells(graph.getSelectionCells(), [value]);
			}
			else{
				evt.target.setAttribute('state', 'Add')
				console.log('remove')
				graph.removeTagsForCells(graph.getSelectionCells(), [value]);
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
	
			var root_div = document.getElementById('references')
			function tree_build(target) {
				if (collection_list[target].build) return;
				
				function create_new_collection(target){
					// Avoiding recreating collection box if the container already exists.
					if (root_div.querySelector(`#${get_collection_id(target)}`) != null)
						return root_div.querySelector(`#${get_collection_id(target)}`);

					collection_div = document.createElement('div')
					collection_div.classList.add('collection');
					collection_div.innerHTML = '<h5 style="padding:5px 0 5px 0; background-color:#BBB; cursor:pointer; ">' + collection_list[target].name + '</h5><div style="max-height:10000px" class="collapsible"></div>'
					collection_div.setAttribute('id', get_collection_id(target))

					mxEvent.addListener(collection_div, 'mouseenter', (evt)=>{
						evt.target.style.backgroundColor = '#ffeb54'
					})

					mxEvent.addListener(collection_div, 'mouseleave', (evt)=>{
						evt.target.style.backgroundColor = null
					})

					mxEvent.addListener(collection_div, 'click', (evt)=>{
						evt.stopPropagation();
						content = evt.target.nextElementSibling;
						if (content != null){
							if (content.style.maxHeight)
								content.style.maxHeight = null;
							else
								content.style.maxHeight = content.scrollHeight + "px";
						}
					})
					return collection_div
				}

				new_collection_div = create_new_collection(target)
				if (collection_list[target].hasParent) {
					parent_hash = collection_list[target].parentCollection
					if (collection_list[parent_hash].build) {
						root_div.querySelector(`#${get_collection_id(parent_hash)}>div`)
							.append(new_collection_div)
					}
					else {
						// Parent haven't built
						tree_build(parent_hash)
						root_div.querySelector(`#${get_collection_id(parent_hash)}>div`)
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
						// Not append ing attachments and duplicated items
						if (item.itemType != "attachment" && (typeof item_list[item.key] === 'undefined')) {
							console.log(item)
							item.collections.forEach((ckey) => {
								collection_id = get_collection_id(ckey)
								collection_name = collection_names[ckey]
								// div_item needs to be re-created for each time, 
								// otherwise, the click event will not be called.

								item_id = get_item_id(item.key)
								//number = String((typeof item.callNumber === 'undefined') ? (counter) : (item.callNumber));
								number = String(counter)
		
								citation = `[${number}: ${get_author(item.creators)} ${get_year(item.date)}]`
								div_item = document.createElement('div')
								div_item.setAttribute('id', item_id)
								div_item.classList.add('item')
								div_item.style.borderRadius = '4px';
								div_item.style.borderStyle = 'solid';
								div_item.style.borderWidth = '1px';
								div_item.style.marginBottom = '2px';
								div_item.style.padding = '2px 2px 2px 2px';

								label = document.createElement('p');
								label.style.cursor = 'pointer';
								label.style.margin = 0;
								label.style.backgroundColor = (item.itemType == "journalArticle") ? '#FF8888' : '#55AAFF';
								label.innerHTML = citation;

								title = document.createElement('p');
								title.style.margin = 0;
								// title.innerHTML = item.title;
								title.innerHTML = `<a href="https://doi.org/${item.DOI}" target="_blank" rel="noopener noreferrer">${item.title}</a>`;
		
								// Generate metadata for drawio plugin
								// \u4e00-\u9fa5 is used to match Chinese character
								kname = get_tagname(item).replace(/[^a-zA-Z0-9/.,&:\]\[\u4e00-\u9fa5]/g, "_")

								item_list[item.key] = {
									'key': item.key,
									'number': number, // TODO, string
									'itemType': item.itemType,
									'citation': citation,
									'title': item.title
								}

								label.classList.add('btn');
								label.setAttribute('state', 'Add');
								label.setAttribute('value', kname);
								set_item_click_evt(label);

								div_item.append(label);
								div_item.append(title);

								/*mxEvent.addListener(div_item, 'mouseenter', (evt)=>{
									evt.target.style.backgroundColor = '#55BB22'
								})

								mxEvent.addListener(div_item, 'mouseleave', (evt)=>{
									evt.target.style.backgroundColor = null
								})*/
	
								// Only append items haven't shown before
								console.log(item_id + ' into ' + collection_names[ckey] + ' , ' + collection_id + ' , ' + (root_div.querySelector(`#${collection_id}>div>#${item_id}`) == null))
								if (root_div.querySelector(`#${collection_id}>div>#${item_id}`) == null){
									root_div.querySelector(`#${collection_id}>div`).append(div_item)
								}
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
			callback()
		}
	}

	var TagSelectorWindow = function(editorUi, x, y, w, h){
		var graph = editorUi.editor.graph;

		var div = document.createElement('div');
		div.style.overflow = 'hidden';
		div.style.padding = '12px 8px 12px 8px';
		div.style.height = 'auto';

		var InfoDiv = document.createElement('div');
		InfoDiv.innerHTML = `<i class="fa fa-github"></i> 
			<a href="https://github.com/sciyen/ResearchHelper" target="_blank" rel="noopener noreferrer">GitHub</a> © 2023 
			<a href="https://github.com/sciyen" target="_blank" rel="noopener noreferrer">sciyen</a>`;
		InfoDiv.classList.add('title_header');
		div.appendChild(InfoDiv);

		// #region Zotero UID and Key
		var UIDDiv = document.createElement('div');
		UIDDiv.innerHTML = '<label for="zotero_uid">Zotero UID    </label>';
		var UIDInput = document.createElement('input');
		UIDInput.setAttribute('id', 'zotero_uid');
		UIDInput.setAttribute('placeholder', 'Zotero UID');
		UIDInput.setAttribute('type', 'text');
		UIDInput.classList.add('default_input_box');
		UIDInput.style.width = '60%';
		var UIDDes = document.createElement('a');
		UIDDes.textContent = 'Look up';
		UIDDes.setAttribute('href', 'https://www.zotero.org/settings/keys');
		UIDDes.setAttribute('target', '_blank');
		UIDDes.setAttribute('rel', 'noopener noreferrer');
		
		var APIKeyDiv = document.createElement('div');
		APIKeyDiv.innerHTML = '<label for="zotero_key">Zotero Key    </label>';
		var APIKeyInput = document.createElement('input');
		APIKeyInput.setAttribute('id', 'zotero_key');
		APIKeyInput.setAttribute('placeholder', 'Zotero Key');
		APIKeyInput.setAttribute('type', 'password');
		APIKeyInput.classList.add('default_input_box');
		APIKeyInput.style.width = '60%';
		var APIKeyDes = document.createElement('a');
		APIKeyDes.textContent = 'Register';
		APIKeyDes.setAttribute('href', 'https://www.zotero.org/settings/keys/new');
		APIKeyDes.setAttribute('target', '_blank');
		APIKeyDes.setAttribute('rel', 'noopener noreferrer');
		
		if (localStorage.getItem(".configuration") != null){
			config = JSON.parse(localStorage.getItem(".configuration"));
			zotero_uid = parseInt(config['zotero_uid'], 10);
			UIDInput.value = config['zotero_uid'];
			APIKeyInput.value = config['zotero_api_key'];
		}

		UIDDiv.append(UIDInput);
		UIDDiv.append(UIDDes)
		APIKeyDiv.append(APIKeyInput);
		APIKeyDiv.append(APIKeyDes);
		div.appendChild(UIDDiv);
		div.appendChild(APIKeyDiv);
		// #endregion Zotero UID and Key

		var buttonsDiv = document.createElement('div');
		buttonsDiv.classList.add('btn_container');

		var updateBtn = document.createElement('button');
		updateBtn.textContent = 'Refresh'
		buttonsDiv.appendChild(updateBtn);
	
		var exportBtn = document.createElement('button');
		exportBtn.textContent = 'Export Selections'
		buttonsDiv.appendChild(exportBtn);
		div.append(buttonsDiv)
	
		// #region Searching by Title
		var filterInput = document.createElement('input');
		filterInput.setAttribute('placeholder', 'Search by Title');
		filterInput.setAttribute('type', 'text');
		filterInput.classList.add('default_input_box');
		filterInput.style.width = '100%';
		div.appendChild(filterInput);

		var searchResultDiv = document.createElement('div');
		searchResultDiv.setAttribute('id', 'search_results')
		searchResultDiv.classList.add('item_container');
		searchResultDiv.innerHTML = '<h4 style="padding:5px 0 5px 0;">Searching Results</h4>'
		div.appendChild(searchResultDiv);
		// #endregion Searching by Title

		// #region Reference Block
		var referenceDiv = document.createElement('div');
		referenceDiv.setAttribute('id', 'references')
		referenceDiv.classList.add('item_container');
		referenceDiv.innerHTML = '<h4 style="padding:5px 0 5px 0;">Collections</h4>'
		div.appendChild(referenceDiv);
		// #endregion Reference Block
		
		// #region Selector Dialog
		this.window = new mxWindow(mxResources.get('tagSelector'), div, x, y, w, h, true, true);
		this.window.destroyOnClose = false;
		this.window.setMaximizable(false);
		this.window.setResizable(true);
		this.window.setScrollable(true);
		this.window.setClosable(true);
		this.window.contentWrapper.style.overflowY = 'scroll';
		// #endregion Selector Dialog
	
		mxEvent.addListener(filterInput, 'keyup', function(evt){
			// Do something
			var keyword = evt.target.value.toLowerCase();

			function search_in_items(keyword){
				if (keyword.length <= 2) return;
				var results_div = document.getElementById('search_results');
				var root_div = document.getElementById('references');

				for (const [key, item] of Object.entries(item_list)) {
					// console.log(key, value);
					item_id = get_item_id(key);
					if (item.title.toLowerCase().indexOf(keyword) >= 0){
						// append in results
						if (results_div.querySelector(`#${item_id}`) == null){
							// search in collections
							var div_item = root_div.querySelector(`#${item_id}`).cloneNode(true);
							set_item_click_evt(div_item);
							results_div.append(div_item)
						}
					}
					else {
						// delete in results
						results = results_div.querySelector(`#${item_id}`);
						if (results != null){
							results.remove();
						}
					}
				}
			}

			search_in_items(keyword);
		});
	
		mxEvent.addListener(updateBtn, 'click', function(evt){
			evt.target.setAttribute('disabled', 'disabled')
		
			// load from Zotero Api and add them to the list of tags (tags for the root)
			zotero_uid = parseInt(div.querySelector('#zotero_uid').value, 10); //config['zotero_uid'];
			zotero_api_key = div.querySelector('#zotero_key').value; //config['zotero_api_key'];
			
			if (typeof(zotero_api_key) === 'undefined' || isNaN(zotero_uid))
				alert('Please fill the zotero user id and api key before using this plugin. For more details, please refer to https://github.com/sciyen/ResearchHelper/tree/feature/drawio_plugin')
			else{
				graph = ui.editor.graph;
				root = graph.model.getRoot();
			
				retreive_draw(zotero_api_key, zotero_uid, (citations) => {
					evt.target.removeAttribute('disabled')
				});

				// Permanently save keys
				config = {
					'zotero_uid': zotero_uid,
					'zotero_api_key': zotero_api_key
				}
				localStorage.setItem('.configuration', JSON.stringify(config));
			}
		});

		mxEvent.addListener(exportBtn, 'click', function(evt){
			tags_list = graph.getTagsForCells(graph.getSelectionCells());
			console.log(tags_list)
			citation = '<div>';
			tags_list.forEach((tag) => {
				info = get_citation_info(tag);
				citation += `<div>
						<span style="margin=0; padding=0; color="red";>${item_list[info.key].citation}</span>
						<span style="margin=0; padding=0; color="blue";>${item_list[info.key].title}</span>
					</div>`;
			})
			citation += '</div>'

			// copy to clipboard
			var data = [new ClipboardItem(
				{"text/html": Promise.resolve(
						new Blob([citation], { type: "text/html" })) })];
			navigator.clipboard.write(data).then(function() {
				console.log("Copied to clipboard successfully!" + citation);
				alert("Citation copied to clipboard!");
			}, function() {
				console.error("Unable to write to clipboard. :-(");
			});
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
				ui.tagSelectorWindow = new TagSelectorWindow(ui, document.body.offsetWidth - 380, 120, 300, 800);
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
			'title': token[1],
			'citation': citation_pretty_print(token),
			'key': token[2].replace(/[^A-Z0-9]/g, "")
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
				var p = ''
				info = get_citation_info(tag)
				if (typeof item_list[info.key] === 'undefined')
					p = `<p style="margin:0;background:#FFFF0088">${info.citation}</p>`
				else
					p = `<p style="margin:0;background:${(item_list[info.key].itemType == "journalArticle") ? '#FF8888AA' : '#55AAFFAA'}">${item_list[info.key].citation}</p>`;
				citation += p;
			})
		}

		var value = '<div style="padding:2px;border:1px solid gray;border-radius:2px;">'
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
