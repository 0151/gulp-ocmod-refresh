import axios, { AxiosError } from "axios";
import { stringify, parse } from "qs";
import PluginError = require("plugin-error");

const PLUGIN_NAME = "gulp-ocmod-refresh";

const ERRORS = {
  URL: "Url is required",
  USERNAME: "Username is required",
  PASSWORD: "Password is required",
};

let options = {
  url: "http://localhost",
  username: "user",
  password: "bitnami",
};

const getUserToken = () => {
  const { username, password } = options;
  const params = stringify({
    route: "common/login",
    username,
    password,
  });

  return axios
    .post(`/admin/index.php`, params, {
      baseURL: options.url,
      maxRedirects: 0,
      validateStatus: (status) => status === 302,
    })
    .then(({ headers }) => {
      const token = parse(headers.location).user_token;

      return Promise.resolve(<string>token);
    });
};

const refreshModificationCache = (token: string) => {
  const params = {
    route: "marketplace/modification/refresh",
    user_token: token,
  };

  return axios.get("/admin/index.php", {
    params,
  });
};

const OCMODRefresh = (settings: typeof options) => {
  if (!options.url) throw new PluginError({ plugin: PLUGIN_NAME, message: ERRORS.URL });
  if (!options.username) throw new PluginError({ plugin: PLUGIN_NAME, message: ERRORS.USERNAME });
  if (!options.password) throw new PluginError({ plugin: PLUGIN_NAME, message: ERRORS.PASSWORD });

  options = Object.assign(options, settings);
  axios.defaults.baseURL = options.url;

  getUserToken()
    .then(refreshModificationCache)
    .catch(({ message }: AxiosError) => {
      throw new PluginError({
        plugin: PLUGIN_NAME,
        message,
      });
    });
};

export default OCMODRefresh;
