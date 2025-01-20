import LocalizedStrings from 'react-localization';

export const localizedStrings = new LocalizedStrings({
  "en": {
    "envsHeader": "Virtual Environments",
    "pvsHeader": "Persistent Volumes",
    "errorEndpointStart": "Environment",
    "errorEndpointEnd": "missing endpoint",
    "loadEndpoint": "Loading environment",
    "loadEndpointSuccess": "Environment loaded",
    "loadEndpointError": "Environment failed to load"
  },
  "ru": {
    "envsHeader": "Удалённые Рабочие Места",
    "pvsHeader": "Хранилища Файлов",
    "errorEndpointStart": "Среда",
    "errorEndpointEnd": "не имеет ссылки для запуска",
    "loadEndpoint": "Загрузка среды",
    "loadEndpointSuccess": "Среда загружена",
    "loadEndpointError": "Загрузка среды вызвала ошибку"
  }
 });