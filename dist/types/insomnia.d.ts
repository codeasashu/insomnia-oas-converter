export interface InsomniaResource {
    _id: string;
    parentId: string | null;
    modified: BigInt;
    created: BigInt;
    _type: string;
}
export declare type FORM_CONTENT_TYPES = 'application/x-www-form-urlencoded' | 'multipart/form-data';
export declare type JSON_CONTENT_TYPE = 'application/json';
export declare type FormRequestBody = {
    mimeType: 'application/x-www-form-urlencoded' | 'multipart/form-data';
    params: Array<Parameter>;
};
export declare type JsonRequestBody = {
    mimeType: 'application/json';
    text: string;
};
export declare type Parameter = {
    name: string;
    value: string | number;
    id?: string;
    description?: string;
};
export declare type RequestHeader = Parameter;
export declare type ResponseExample = {
    title: string;
    body: string;
    statusCode: string | number;
    contentType: JSON_CONTENT_TYPE & FORM_CONTENT_TYPES;
    id: string;
};
export interface InsomniaRequest extends InsomniaResource {
    url: string;
    name: string;
    description: string;
    method: string;
    body: FormRequestBody | JsonRequestBody;
    parameters: Array<Parameter>;
    headers: Array<RequestHeader>;
    isPrivate: Boolean;
    examples: Array<ResponseExample>;
    settingStoreCookies: Boolean;
    settingSendCookies: Boolean;
    settingDisableRenderRequestBody: Boolean;
    settingEncodeUrl: Boolean;
    settingRebuildPath: Boolean;
    settingFollowRedirects: string;
}
export interface InsomniaWorkspace extends InsomniaResource {
    name: string;
    description: string;
}
export declare type InsomniaFolder = InsomniaWorkspace;
export interface InsomniaExport {
    _type: string;
    __export_format: number;
    __export_date: string;
    __export_source: string;
    resources: InsomniaResource[] | [];
}
export interface InsomniaEnvironment extends InsomniaResource {
    name: string;
    data: {
        [key: string]: any;
    };
}
export declare type InsomniaConfig = {
    title: string;
    description: string;
    version: string;
    baseUrl: string;
};
