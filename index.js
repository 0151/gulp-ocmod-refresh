const PLUGIN_NAME = 'gulp-ocmod-refresh'
const axios = require('axios')
const axiosCookieJarSupport = require('axios-cookiejar-support').default
axiosCookieJarSupport(axios)
const tough = require('tough-cookie')
const qs = require('qs')
const PluginError = require('plugin-error')


module.exports = options => {

    if (!options) {
        throw new PluginError(PLUGIN_NAME, 'Missing options')
    }
    if (!options.url) {
        throw new PluginError(PLUGIN_NAME, 'Missing url')
    }
    if (!options.username) {
        throw new PluginError(PLUGIN_NAME, 'Missing username')
    }
    if (!options.password) {
        throw new PluginError(PLUGIN_NAME, 'Missing password')
    }

    const transport = axios.create({
        baseURL: `${options.url}/admin/`,
        withCredentials: true,
        jar: new tough.CookieJar(),
        maxRedirects: 0,
        validateStatus: status => status == 302,
    })

    /**
     * 
     */
    const getUserToken = async () => {
        const params = { 
            route: 'common/login',
            username: options.username,
            password: options.password,
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

    getUserToken()
        .then(refreshCache)
        .then(logout)
        .then(() => {
            console.log('OCMOD cache updated')
        })
        .catch(error => {
            console.error(error)
        })
}