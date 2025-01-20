export const ACTIVE="active"
export const STOPPED="stopped"

class Api {
  static basePath() { return process.env.REACT_APP_API_BASE_URL + process.env.REACT_APP_API_PREFIX }
  static resourcePath(resource) { return this.basePath() + resource }
  static resourceGetPath(resource, oid) { return this.resourcePath(resource) + "/" + oid }
  static launcherPath(oid, status) { return this.basePath() + process.env.REACT_APP_API_LAUNCHER_ENDPOINT + "/" + oid + "?start=" + (status === ACTIVE ? '0' : '1') }
  static envEPPath(oid) { return this.basePath() + process.env.REACT_APP_API_ENDPOINT_ENDPOINT + "/" + oid }

  static fetchApi(path, params, { callbackOnSuccessLoad  = (data) => {}, callbackOnFailedLoad = (response) => {}, callbackOnLoad = (response) => {} }) {
    return fetch(path, params).then((response) => {
      callbackOnLoad(response);
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then((data) => {
      callbackOnSuccessLoad(data);
    }).catch((response) => {
      callbackOnFailedLoad(response);
      console.log(response.status, response.statusText);
      response.json().then((json: any) => {
        console.log(json);
      });
    });
  }

  static fetchApiResource(resource, { callbackOnSuccessLoad  = (data) => {}, callbackOnFailedLoad = (response) => {}, callbackOnLoad = (response) => {} }, params = {}) {
    return this.fetchApi(this.resourcePath(resource), params, { callbackOnSuccessLoad, callbackOnFailedLoad, callbackOnLoad })
  }

  static fetchApiResourceGet(resource, oid, { callbackOnSuccessLoad  = (data) => {}, callbackOnFailedLoad = (response) => {}, callbackOnLoad = (response) => {} }, params = {}) {
    return this.fetchApi(this.resourceGetPath(resource, oid), params, { callbackOnSuccessLoad, callbackOnFailedLoad, callbackOnLoad })
  }

  static fetchApiLauncher(oid, status, { callbackOnSuccessLoad  = (data) => {}, callbackOnFailedLoad = (response) => {}, callbackOnLoad = (response) => {} }, params = {}) {
    return this.fetchApi(this.launcherPath(oid, status), params, { callbackOnSuccessLoad, callbackOnFailedLoad, callbackOnLoad })
  }

  static fetchApiEnvEP(oid, { callbackOnSuccessLoad  = (data) => {}, callbackOnFailedLoad = (response) => {}, callbackOnLoad = (response) => {} }, params = {}) {
    return this.fetchApi(this.envEPPath(oid), params, { callbackOnSuccessLoad, callbackOnFailedLoad, callbackOnLoad })
  }
}

export { Api }