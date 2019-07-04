const request = require('request').defaults({
    jar: true
});

let getToken = (config, cb) => {
    request
        .post(`${config.url}/admin/index.php?route=common/login`)
        .form({
            username: config.username,
            password: config.password
        })
        .on('response', resp => {
            const location = resp.headers.location;
            const userToken = location.match(/\b[\w-]+$/)[0];
            cb(userToken);
        })
        .on('error', err => {
            console.error(err);
        })
}

let refresh = (config, userToken) => {
    request
        .get(`${config.url}/admin/index.php?route=marketplace/modification/refresh&user_token=${userToken}`)
        .on('error', err => {
            console.error(err);
        });
}

module.exports = (config) => {
    getToken(config, (userToken) => {
        refresh(config, userToken);
    })
}