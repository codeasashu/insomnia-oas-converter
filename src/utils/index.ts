import {
  InsomniaResource,
  InsomniaRequest,
  Parameter,
} from '../types/insomnia';

const insomniaTemplateRegex = /(?<!\\){([^{}]+)(?<!\\)}/g;

export const types = {
  REQUEST: 'request',
  FOLDER: 'request_group',
  ENVIRONMENT: 'environment',
  WORKSPACE: 'workspace',
  COOKIE: 'cookie_jar',
  SPEC: 'api_spec',
};

const regexes = {
  workspace: RegExp(/^wrk_[\w]+$/, 'g'),
  folder: RegExp(/^fld_[\w]+$/, 'g'),
  environment: RegExp(/^env_[\w]+$/, 'g'),
};

export const headerTypes = {
  JSON: 'application/json',
  MULTIPART: 'multipart/form-data',
  FORM: 'application/x-www-form-urlencoded',
};

export const getRequestFromFolder = (
  resource: InsomniaResource,
  resources: InsomniaResource[]
): InsomniaRequest | null => {
  let foundRequests = resources.filter((r) => r.parentId == resource._id);
  if (foundRequests.length) {
    return <InsomniaRequest>foundRequests.pop();
  }
  return null;
};

export const filterRequestResource = (resource: InsomniaResource): boolean => {
  return resource._type == types.REQUEST;
};

export const isWorkspace = (resourceId: string): boolean =>
  regexes.workspace.test(resourceId);

export const isFolder = (resourceId: string): boolean =>
  regexes.folder.test(resourceId);

export const getQueryStringParams = (query: string) => {
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params: any, param) => {
          // @TODO Fix this "any" type
          let [key, value] = param.split('=');
          params[key] = value
            ? decodeURIComponent(value.replace(/\+/g, ' '))
            : '';
          return params;
        }, {})
    : {};
};

export const getTemplateMatches = (
  variable: string | number
): Array<string> => {
  variable = variable.toString();
  let matches = variable.matchAll(insomniaTemplateRegex);
  return Array.from(matches).map((m) => m[1].trim());
};

/**
 * Converts insomnia defined variable holders to openapi variables
 * {{ xyz }} -> { xyz }
 * @param uri string The url to replace the variable
 */
export const trimTemplate = (
  variable: string | number,
  keepInsomniaFormat: boolean = false
): string => {
  variable = variable.toString();
  // console.log("trim1", variable)
  let matches = variable.matchAll(insomniaTemplateRegex);
  for (let match of matches) {
    let trimmedMatch = match[0].replace('{', '').replace('}', '').trim();
    let replaceWith = !!keepInsomniaFormat ? `{${trimmedMatch}}` : trimmedMatch;
    variable = variable.replace(match[0], replaceWith);
  }
  return variable;
};

export const replaceInsomniaTemplateWithVars = (
  variable: string | number,
  envVars: any = {}
): string => {
  variable = variable.toString();
  let matches = variable.matchAll(insomniaTemplateRegex);
  for (let match in matches) {
    const trimmedMatch = match[1].trim();
    variable = variable.replace(match[0], envVars[trimmedMatch] || match[0]);
  }
  return variable;
};

export const hasHttp = (path: string): boolean =>
  path.includes('http://') || path.includes('https://');

/**
 * Get a URL instance from insomnia url
 * @param path
 */
export const urlFromPath = (path: string): URL => {
  if (hasHttp(path) === false) {
    path = `http://${path}`;
  }
  return new URL(trimTemplate(path));
};

export const parameterizeForm = (
  insomniaFormParams: Parameter[]
): {
  [key: string]: string;
} => {
  let bodyParams: any = {};
  for (let param of insomniaFormParams) {
    bodyParams[param.name] = param.value;
  }
  return bodyParams;
};

export const sanitizeRequestMethod = (method: string): string =>
  method.toLowerCase().trim();
