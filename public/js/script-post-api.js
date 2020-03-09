window.onload = () => {
    readPost();
}

function readPost(id = null, evt = null) {
    if (evt) evt.preventDefault();
    if (id) url = "/post-api/api/" + id;
    else url = "/post-api/api";
    $.ajax({
        url,
        type: "GET", // GET cannot have body.
        success: function (res) {
            // console.log('sucess:', res);
            if (id) viewOne(res); // view one
            else viewAll(res); // view all
        },
        error: function (xhr, status, err) {
            console.log(xhr, err);
        },
    });
}

function viewOne(res) {
    console.log("viewOne", res);
    let v = res[0];
    let fm = document.apiForm;
    fm.id.value = v.id;
    fm.writer.value = v.writer;
    fm.title.value = v.title;
    fm.content.value = v.content;
}

function viewAll(res) {
    let html = '<table>';
    for (let v of res) {
        html += '<tr>';
        html += `<td>${v.id}</td>`;
        html += `<td>${v.writer}</td>`;
        html += `<td><a href="javascript:readPost(${v.id}, event);">${v.title}</a></td>`;
        html += `<td>${v.createdAt}</td>`;
        html += `<td><button onclick="deletePost(${v.id});">DEL</button></td>`;
        html += '</tr>';
    }
    html += '</table>';
    $('#root').html(html);
}

function sendPost() { // CREATE & UPDATE
    let fm = document.apiForm;
    let id = fm.id.value;
    let type = 'POST'; // create
    if (id) type = 'PUT'; // update
    $.ajax({
        url: '/post-api/api',
        type,
        dataType: "json",
        data: {
            id: id,
            writer: fm.writer.value,
            title: fm.title.value,
            content: fm.content.value
        },
        success: function (res) {
            fm.reset();
            readPost();
        },
        error: function (xhr, status, err) {
            console.log(xhr, err);
        }
    });
    return false;
}

function deletePost(id) { // DELETE
    let fm = document.apiForm;
    console.log(id);
    $.ajax({
        url: '/post-api/api',
        type: 'DELETE',
        dataType: "json",
        data: { id },
        success: function (res) {
            fm.reset();
            readPost();
        },
        error: function (xhr, status, err) {
            console.log(xhr, err);
        }
    });
}