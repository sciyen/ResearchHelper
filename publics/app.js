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
    $("#references").empty()
    counter = 1
    drawio_token = ''
    const myapi = api(ApiKey, {
        'limit': 100
    }).library('user', Uid)
    const collectionsRes = await myapi.collections().get();

    console.log(collectionsRes)
    for (const c of collectionsRes.raw) {
        console.log(c)
        collection_name = c.data.name
        div_collection = $("<div class='card-body'></div>")
            .append($("<h5 class='card-title'></h5>").text(collection_name))

        const itemRes = await myapi.collections(c.key).items().get()
        const items = itemRes.getData()
        console.log(items)

        items.forEach(item => {
            if (item.itemType != "attachment") {
                number = (typeof item.callNumber === 'undefined') ? ('') : (String(item.callNumber))
                div_item = $("<div></div>")
                    .append($("<h6></h6>").text(item.title))
                    .append($("<p></p>").text(number)
                        .append($("<span></span>").text(": " + get_author(item.creators)))
                        .append($("<span></span>").text(" " + get_year(item.date))))
                div_collection.append(div_item)

                // Generate metadata for drawio plugin
                kname = '[' + number + str_token
                    + get_details(collection_name, item.title) + str_token
                    + get_author(item.creators) + " "
                    + get_year(item.date) + str_token
                    + item.key + ']'
                // \u4e00-\u9fa5 is used to match Chinese character
                kname = kname.replace(/[^a-zA-Z0-9/.,&:\]\[\u4e00-\u9fa5]/g, "_")
                drawio_token += kname + ' '

                counter += 1
            }
        })
        $("#references").append($("<div class='card'></div>").append(div_collection))
        console.log(c.data.name)
    }
    $("#zotero_token").append($("<p></p>").text(drawio_token))
    $('#message').text("")
    $('#go').text("Refresh")
    $('#copy').css('display', 'block')

    navigator.clipboard.writeText(drawio_token).then(function () {
        $("#copy").text('Tokens copied!')
    }, function (err) {
        $("#copy_err_msg").text('Copy the tokens')
    });
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