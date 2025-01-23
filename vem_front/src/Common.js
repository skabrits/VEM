export const ACTIVE="active"
export const STOPPED="stopped"
export const READY="ready"
export const UNREADY="unready"

export class Api {
  static basePath() { return process.env.REACT_APP_API_BASE_URL + process.env.REACT_APP_API_PREFIX }
  static resourcePath(resource) { return this.basePath() + process.env.REACT_APP_API_RESOURCE_ENDPOINT + "/" + resource }
  static resourceGetPath(resource, oid) { return this.resourcePath(resource) + "/" + oid }
  static launcherPath(oid, status) { return this.basePath() + process.env.REACT_APP_API_LAUNCHER_ENDPOINT + "/" + oid + "?start=" + (status === ACTIVE ? '0' : '1') }
  static envEPPath(oid) { return this.basePath() + process.env.REACT_APP_API_ENDPOINT_ENDPOINT + "/" + oid }
  static schemaPath(resource) { return this.basePath() + process.env.REACT_APP_API_SCHEMA_ENDPOINT + "/" + resource }
  static extraPath(resource) { return this.basePath() + process.env.REACT_APP_API_EXTRA_ENDPOINT + "/" + resource }

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

  static fetchApiSchema(resource, { callbackOnSuccessLoad  = (data) => {}, callbackOnFailedLoad = (response) => {}, callbackOnLoad = (response) => {} }, params = {}) {
    return this.fetchApi(this.schemaPath(resource), params, { callbackOnSuccessLoad, callbackOnFailedLoad, callbackOnLoad })
  }

  static fetchApiExtra(resource, { callbackOnSuccessLoad  = (data) => {}, callbackOnFailedLoad = (response) => {}, callbackOnLoad = (response) => {} }, params = {}) {
    return this.fetchApi(this.extraPath(resource), params, { callbackOnSuccessLoad, callbackOnFailedLoad, callbackOnLoad })
  }
}
