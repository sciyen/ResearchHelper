// UMD bundle creates `ZoteroApiClient` global object
const { default: api } = ZoteroApiClient;

const str_token = '::'

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
function get_details(collection_name, title) {
    return collection_name + str_token + title
}

/* Retrieve library from Zotero API */
async function retreive(ApiKey, Uid) {
    $("#zotero_token").empty()
    $('#copy').css('display', 'none')
    $('#wait_msg').css('display', 'block')
    $("#references").empty()
    counter = 1
    drawio_token = ''
    const myapi = api(ApiKey, {
        'limit': 100
    }).library('user', Uid)

    try{
        const collectionsRes = await myapi.collections().get();

        collection_names = {}

        console.log(collectionsRes)
        promises = []

        collection_list = {}

        function get_collection_id(hash) {
            return 'collection_' + hash
        }

        root_id = "#references" //get_collection_id('root')
        function tree_build(target) {
            console.log(collection_list[target].name + '_enter')
            if (collection_list[target].build) return;

            new_collection_div = $('<div class="card-body"></div>').attr('id', get_collection_id(target))
                .append($('<h5></h5>').text(collection_list[target].name))

            if (collection_list[target].hasParent) {
                parent_hash = collection_list[target].parentCollection
                if (collection_list[parent_hash].build) {
                    $(root_id).find('#' + get_collection_id(parent_hash)).append(new_collection_div)
                }
                else {
                    // Parent haven't built
                    tree_build(parent_hash)
                    child_collection_div = $('<div class="card-body"></div>').attr('id', get_collection_id(target))
                        .append($('<h5></h5>').text(collection_list[target].name))
                    $(root_id).find('#' + get_collection_id(parent_hash)).append(child_collection_div)
                    console.log(target + '_' + parent_hash)
                }
            }
            else {
                // Append directly
                $(root_id).append(new_collection_div)
            }
            console.log(collection_list[target].name + ' call')
            collection_list[target].build = true
        }

        // Retrieve collection information
        for (const [i, c] of collectionsRes.raw.entries()) {
            console.log(c)
            collection_names[c.key] = c.data.name
            colleciton_id = 'collection_' + c.key
            div_collection = $("<div class='card-body'></div>")
                .attr('id', colleciton_id)
                .append($("<h5 class='card-title'></h5>").text(c.data.name))

            // Add promises to request for the items in collection
            promises.push(new Promise((resolve, reject) => {
                const itemRes = myapi.collections(c.key).items().get()
                resolve(itemRes)
            }))
            $("#references").append($("<div class='card'></div>").append(div_collection))
            console.log(c.data.name)
        }

        // Append the content when the data available
        for (const p of promises) {
            p.then((itemRes) => {
                const items = itemRes.getData()
                items.forEach(item => {
                    if (item.itemType != "attachment") {
                        console.log(item)
                        number = (typeof item.callNumber === 'undefined') ? ('') : (String(item.callNumber))
                        div_item = $("<div></div>")
                            .append($("<h6></h6>").text(item.title))
                            .append($("<p></p>").text(number)
                                .append($("<span></span>").text(": " + get_author(item.creators)))
                                .append($("<span></span>").text(" " + get_year(item.date))))
                        item.collections.forEach((ckey) => {
                            collection_id = 'collection_' + ckey
                            collection_name = collection_names[ckey]
                            $('#' + collection_id).append(div_item)

                            // Generate metadata for drawio plugin
                            kname = '[' + number + str_token
                                + get_details(collection_name, item.title) + str_token
                                + get_author(item.creators) + " "
                                + get_year(item.date) + str_token
                                + item.key + ']'
                            // \u4e00-\u9fa5 is used to match Chinese character
                            kname = kname.replace(/[^a-zA-Z0-9/.,&:\]\[\u4e00-\u9fa5]/g, "_")
                            drawio_token += kname + ' '
                        })
                        counter += 1
                    }
                })
            })
        }

        // Wait for all promise to finish no matter if it succeeded or rejected
        Promise.allSettled(promises).then(([result]) => {
            $("#zotero_token").append($("<p></p>").text(drawio_token))
            $('#go').text("Refresh")
            $('#copy').css('display', 'block')
            $('#wait_msg').css('display', 'none')

            navigator.clipboard.writeText(drawio_token).then(function () {
                $("#copy").text('Tokens copied!')
            }, function (err) {
                $("#copy_err_msg").text('Copy the tokens')
            });
        })   
    }
    catch (err){
        console.log(err)
        alert("Error: " + String(err) + '\nPlease check the UID and API key!')

        $('#copy').css('display', 'none')
        $('#wait_msg').css('display', 'none')
    }
}

$('#zotero_info').on('submit', (e) => {
    e.preventDefault();
    var formData = $('#zotero_info').serializeArray();
    uid_raw = formData[0].value
    key = formData[1].value
    if (key != "" && uid_raw != "") {
        uid = parseInt(uid_raw, 10)
        if (!isNaN(uid)) {
            $("#references").append($("<p id='message'>Loading...</p>"))
            retreive(key, uid)
        }
        else
            alert('Wrong UID format')
    }
    else
        alert('Please enter your API key and UID!')
})

$('#copy').click(() => {
    text = $("#zotero_token").text()
    navigator.clipboard.writeText(drawio_token).then(function () {
        $("#copy").text('Tokens copied!')
    }, function (err) {
        $("#copy_err_msg").text('Failed to copy')
    });
})