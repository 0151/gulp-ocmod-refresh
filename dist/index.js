"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var qs_1 = require("qs");
var PluginError = require("plugin-error");
var PLUGIN_NAME = "gulp-ocmod-refresh";
var ERRORS = {
    URL: "Url is required",
    USERNAME: "Username is required",
    PASSWORD: "Password is required"
};
var options = {
    url: "http://localhost",
    username: "user",
    password: "bitnami"
};
var getUserToken = function () {
    var username = options.username, password = options.password;
    var params = qs_1.stringify({
        route: "common/login",
        username: username,
        password: password
    });
    return axios_1["default"]
        .post("/admin/index.php", params, {
        baseURL: options.url,
        maxRedirects: 0,
        validateStatus: function (status) { return status === 302; }
    })
        .then(function (_a) {
        var headers = _a.headers;
        var token = qs_1.parse(headers.location).user_token;
        return Promise.resolve(token);
    });
};
var refreshModificationCache = function (token) {
    var params = {
        route: "marketplace/modification/refresh",
        user_token: token
    };
    return axios_1["default"].get("/admin/index.php", {
        params: params
    });
};
var OCMODRefresh = function (settings) {
    if (!options.url)
        throw new PluginError({ plugin: PLUGIN_NAME, message: ERRORS.URL });
    if (!options.username)
        throw new PluginError({ plugin: PLUGIN_NAME, message: ERRORS.USERNAME });
    if (!options.password)
        throw new PluginError({ plugin: PLUGIN_NAME, message: ERRORS.PASSWORD });
    options = Object.assign(options, settings);
    axios_1["default"].defaults.baseURL = options.url;
    getUserToken()
        .then(refreshModificationCache)["catch"](function (_a) {
        var message = _a.message;
        throw new PluginError({
            plugin: PLUGIN_NAME,
            message: message
        });
    });
};
exports["default"] = OCMODRefresh;
