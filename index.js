"use strict";
/// <reference path='redux.d.ts' />
function getxml() {
    const _url_json = 'https://raw.githubusercontent.com/DukSon1224/mypublish/main/publish.json';
    $.ajax({
        url: _url_json,
        success: jsontext => {
            let _json = JSON.parse(jsontext);
            store.dispatch({ type: 'JSON_LOADED', jsonobj: _json });
        },
        error: xhr => store.dispatch({ type: 'Error', error: xhr, errorText: xhr.responseText })
    });
    // .catch((xhr, error, string) => {
    //     console.log(xhr)
    //     console.log(error)
    //     console.log(string)
    // })
}
class myAppInfo {
    constructor(name, id, currentVersion) {
        this.files = [];
        this.name = name;
        this.id = id;
        this.currentVersion = currentVersion;
    }
    get currentFile() {
        return this.files.find((file, index, obj) => {
            return file.version === this.currentVersion;
        });
    }
}
function jsonTranslate(obj) {
    // if (xml == null) return []
    console.log(obj);
    let apps = [];
    let elApps = obj['MyApps'];
    for (const info of elApps) {
        let app = new myAppInfo(info['Name'], info['Id'], info['CurrentVersion']);
        for (const finfo of info['Files']) {
            app.files.push({
                version: finfo['Version'],
                path: finfo['Path'],
            });
        }
        app.files.sort();
        apps.push(app);
    }
    return apps;
}
function showAppList() {
    let state = store.getState();
    if (state.page != 'front')
        return;
    let nav = `
    <nav><ul class='nav-menu'>
    <li><a href='https://haanipublish.github.io/MyPublish/'>Haani</a></li>
    <li><a href='https://dukson1224.github.io/mypublish/'>DukSon</a></li>
    </ul></nav>`;
    let title = `${nav}<h1>DukSon Publish</h1>`;
    let apps = state.apps;
    let rows = [];
    apps.forEach(info => {
        var _a;
        rows.push(`<tr>
        <td><a href="#!${info.name}" onclick="event.preventDefault(); store.dispatch({ type: 'APP_SELECTED', selectedAppId: '${info.id}' })">${info.name}</a></td>
        <td><a href="${(_a = info.currentFile) === null || _a === void 0 ? void 0 : _a.path}">down</a></td>
        </tr>
        `);
    });
    let table = `<table><caption><h2>App list</h2></caption>
    <tr><th>Name</th></tr>
    ${rows.join('')}
    </table>
    `;
    $('#myHeading').html(title);
    $('#myContent').html(table);
}
function showAppDetail() {
    let state = store.getState();
    if (state.page != 'detail')
        return;
    let info = state.apps.find(ai => ai.id == state.selectedAppId);
    if (!info)
        return;
    let nav = `
    <nav><ul class='nav-menu'>
    <li><a href='https://haanipublish.github.io/MyPublish/'>Haani</a></li>
    <li><a href='https://dukson1224.github.io/mypublish/'>DukSon</a></li>
    </ul></nav>`;
    let title = `${nav}<h1><a href="#!applist" class="backbutton" onclick="event.preventDefault(); store.dispatch({ type: 'APP_SELECTED', selectedAppId: undefined })">a</a></h1><h1>${info.name}</h1>`;
    let rows = [];
    info.files.forEach(fi => {
        rows.push(`<tr>
        <td style="text-align:center">${fi.version == info.currentVersion ? '○' : ''}</td>
        <td>${fi.version}</td>
        <td><a href="${fi.path}">down</a></td>
        </tr>`);
    });
    let table = `<table>
    <tr>
    <th>Current</th>
    <th>Version</th>
    </tr>
    ${rows.join('')}
    </table>
    `;
    // let heading = document.getElementById('myHeading') as HTMLDivElement
    // let content = document.getElementById('myContent') as HTMLDivElement
    // if (heading && content) {
    //     heading.innerHTML = title
    //     content.innerHTML = table
    // }
    $('#myHeading').html(title);
    $('#myContent').html(table);
}
function showError() {
    let state = store.getState();
    if (state.page != 'error')
        return;
    let error = `<h1>${state.errorText}</h1>`;
    $('#myHeading').html(error);
    $('#myContent').html('');
}
function reducer(state, action) {
    if (state == undefined) {
        getxml();
        return {
            apps: [], selectedAppId: undefined,
            error: undefined, errorText: '',
            page: 'front' // detail, error
        };
    }
    let newState = Object.assign({}, state);
    switch (action.type) {
        case 'JSON_LOADED':
            if (action.jsonobj instanceof Object) {
                newState.apps = jsonTranslate(action.jsonobj);
                if (newState.apps.length > 0) {
                    newState.page = 'front';
                }
                else {
                    newState.page = 'error';
                    newState.errorText = 'There is no application';
                }
            }
            break;
        case 'APP_SELECTED':
            newState.selectedAppId = action.selectedAppId;
            newState.page = newState.selectedAppId ? 'detail' : 'front';
            break;
        case 'Error':
            newState.error = action.error;
            newState.page = 'error';
            newState.errorText = action.errorText;
            break;
        default:
            newState.error = action.error;
            newState.page = 'error';
            newState.errorText = 'Unknown Error';
            break;
    }
    return newState;
}
let store = Redux.createStore(reducer);
store.subscribe(showAppList);
store.subscribe(showAppDetail);
store.subscribe(showError);
