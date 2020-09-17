import * as insomnia from './types/insomnia';
import * as oas from 'openapi3-ts';
import SpecExporter from './exporter';
declare class OpenapiCollector {
    builder: oas.OpenApiBuilder;
    envVars: any;
    constructor();
    addInfo(config: insomnia.InsomniaConfig): this;
    getRequestFromOas(path: string, method: string): oas.OperationObject | null;
    addFolderToRequest(folder: insomnia.InsomniaFolder, request: insomnia.InsomniaRequest | null): this;
    addEnvironment(env: insomnia.InsomniaEnvironment): this;
    updateRequest(request: insomnia.InsomniaRequest, args: any): void;
    get_path_pathparams(url: string): {
        path: string;
        params: oas.ParameterObject[];
    };
    addRequest(request: insomnia.InsomniaRequest): this;
    get_responses(examples: insomnia.ResponseExample[]): oas.ResponsesObject;
    get_request_body(requestBody: any): oas.RequestBodyObject;
    get_query_params(request: insomnia.InsomniaRequest): oas.ParameterObject[];
    _get_from_env(key: any): any;
    add_url(url: string): this;
    _get_oas_pathparams(uri: string): {
        path: string;
        params: oas.ParameterObject[];
    } | null;
    insomnia_to_oas_params(insomniaParams: insomnia.Parameter[], _in: string): oas.ParameterObject[];
    _get_oas_query_params_from_url(path: string): oas.ParameterObject[];
    _get_schema(inputJsonObject: any): any;
    get_spec(): SpecExporter;
}
export default OpenapiCollector;
