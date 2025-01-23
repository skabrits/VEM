import LocalizedStrings from 'react-localization';

export const localizedStrings = new LocalizedStrings({
  "en": {
    "envsHeader": "Virtual Environments",
    "pvsHeader": "Persistent Volumes",
    "errorEndpointStart": "Environment",
    "errorEndpointEnd": "missing endpoint",
    "loadEndpoint": "Loading environment",
    "loadEndpointSuccess": "Environment loaded",
    "loadEndpointError": "Environment failed to load",
    "loadingEnv": "Environment is being created",
    "save": "Save",
    "editor": {
      "types": {
        "settings": "Settings",
        "pvs": "Persistent Volume",
        "environments": "Virtual Environment",
      },
      "name": "Name",
      "image": "Docker Image",
      "settings_id": "Settings",
      "selectOption": "Select an option",
      "desired_status": "Launch on creation",
    },
  },
  "ru": {
    "envsHeader": "Удалённые Рабочие Места",
    "pvsHeader": "Хранилища Файлов",
    "errorEndpointStart": "Среда",
    "errorEndpointEnd": "не имеет ссылки для запуска",
    "loadEndpoint": "Загрузка среды",
    "loadEndpointSuccess": "Среда загружена",
    "loadEndpointError": "Загрузка среды вызвала ошибку",
    "loadingEnv": "Среда создаётся",
    "save": "Сохранить",
    "editor": {
      "types": {
        "settings": "Настройки",
        "pvs": "Хранилище файлов",
        "environments": "Удалённое рабочее место",
      },
      "name": "Название",
      "image": "Докер Образ",
      "settings_id": "Настройки",
      "selectOption": "Выбирите вариант",
      "desired_status": "Запустить после создания",
    },
  }
 });