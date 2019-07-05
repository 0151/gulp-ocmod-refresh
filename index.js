const request = require('request').defaults({
    jar: true
});

let ocmodRefresh = (params) => {

    params = params || {};

    let getToken = () => {
        return new Promise((resolve, reject) => {
            request
                .post({
                    url: `${params.url}/admin/index.php?route=common/login`,
                    form: {
                        username: params.username,
                        password: params.password
                    }
                }, (err, resp) => {
                    if (err) {
                        reject('😵');
                    }
                    if (resp) {
                        const location = resp.headers.location;
                        const token = location.match(/(?<=&)[\w|=]+$/);
                        params.token = token;
                        resolve();
                    }
                })
        });
    }

    let getVersion = () => {
        return new Promise((resolve, reject) => {
            request
                .post({
                    url: `${params.url}/admin/index.php?route=common/dashboard&${params.token}`,
                }, (err, resp, body) => {
                    if (err) {
                        reject('🙁');
                    }
                    if (body) {
                        const version = body.match(/[\d\.]{7}/)[0];
                        resolve(version);
                    }
                });
        });
    }

    let refresh = (version) => {
        
        let url = `${params.url}/admin/index.php?route=`;
        
        if (version > '3') {
            url+= `marketplace/modification/refresh&${params.token}`;
        } else if (version > '2.3') {
            url+= `extension/modification/refresh&${params.token}`;
        }

        request
            .post(url)
            .on('response', () => {
                console.log('🙂');
            })
            .on('error', err => {
                throwErr('😬');
            });
    }

    let throwErr = (err) => {
        console.error(err);
    }

    getToken().then(getVersion, throwErr).then(refresh);

} 

module.exports = ocmodRefresh;