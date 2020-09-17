import { InsomniaResource, InsomniaRequest, Parameter } from '../types/insomnia';
export declare const types: {
    REQUEST: string;
    FOLDER: string;
    ENVIRONMENT: string;
    WORKSPACE: string;
    COOKIE: string;
    SPEC: string;
};
export declare const headerTypes: {
    JSON: string;
    MULTIPART: string;
    FORM: string;
};
export declare const getRequestFromFolder: (resource: InsomniaResource, resources: InsomniaResource[]) => InsomniaRequest | null;
export declare const filterRequestResource: (resource: InsomniaResource) => boolean;
export declare const isWorkspace: (resourceId: string) => boolean;
export declare const isFolder: (resourceId: string) => boolean;
export declare const getQueryStringParams: (query: string) => any;
export declare const getTemplateMatches: (variable: string | number) => Array<string>;
/**
 * Converts insomnia defined variable holders to openapi variables
 * {{ xyz }} -> { xyz }
 * @param uri string The url to replace the variable
 */
export declare const trimTemplate: (variable: string | number, keepInsomniaFormat?: boolean) => string;
export declare const replaceInsomniaTemplateWithVars: (variable: string | number, envVars?: any) => string;
export declare const hasHttp: (path: string) => boolean;
/**
 * Get a URL instance from insomnia url
 * @param path
 */
export declare const urlFromPath: (path: string) => URL;
export declare const parameterizeForm: (insomniaFormParams: Parameter[]) => {
    [key: string]: string;
};
export declare const sanitizeRequestMethod: (method: string) => string;
