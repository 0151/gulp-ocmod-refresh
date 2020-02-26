const axios = require('axios')

const tough = require('tough-cookie')
const axiosCookieJarSupport = require('axios-cookiejar-support').default

axiosCookieJarSupport(axios)
const cookieJar = new tough.CookieJar()

const transport = axios.create({
    baseURL: 'http://localhost/admin/',
    withCredentials: true,
    jar: cookieJar,
    maxRedirects: 0,
    validateStatus: status => status == 302,
})

const qs = require('qs')
const PluginError = require('plugin-error')

const PLUGIN_NAME = 'gulp-ocmod-refresh'

/**
 * 
 */
const getUserToken = async () => {
    const params = { 
        route: 'common/login',
        username: 'admin',
        password: 'admin',
    }

    return new Promise((resolve, reject) => {
        transport.post('index.php', qs.stringify(params))
            .then(
                response => {
                    const location = response.headers.location
                    const queryString = location.split('?')[1]
                    const userToken = qs.parse(queryString).user_token

                    resolve(userToken)
                },
                () => {
                    reject('Login or password incorrect')
                }
            )
    })
}

/**
 * 
 * @param {*} userToken 
 */
const refreshCache = userToken => {
    const request = {
        params: {
            route: 'marketplace/modification/refresh',
            user_token: userToken,
        }
    }

    return transport.get('index.php', request)
}

/**
 * 
 */
const logout = () => {
    const request = {
        params: {
            route: 'common/logout'
        }
    }

    return transport.get('index.php', request)
}

/**
 * 
 */
const ocmodRefresh = async () => {
    getUserToken()
        .then(refreshCache)
        .then(logout)
        .catch(error => {
            throw new PluginError(PLUGIN_NAME, error)
        })
}

module.exports = ocmodRefresh