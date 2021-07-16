import * as insomnia from './types/insomnia';
import * as oas from 'openapi3-ts';
import * as utils from './utils';
import SpecExporter from './exporter';

var GenerateSchema = require('generate-schema');

const insoRequestIdKey = 'x-request-id';

class OpenapiCollector {
  builder: oas.OpenApiBuilder;
  envVars: any = {};

  constructor() {
    this.builder = new oas.OpenApiBuilder();
  }

  addInfo(config: insomnia.InsomniaConfig): this {
    this.builder.addTitle(config.title);
    this.builder.addDescription(config.description);
    this.builder.addVersion(config.version);
    this.add_url(config.baseUrl);
    return this;
  }

  getRequestFromOas(path: string, method: string): oas.OperationObject | null {
    let oasPath = oas.getPath(this.builder.rootDoc.paths, path);
    return (oasPath && oasPath[method]) || null;
  }

  addFolderToRequest(
    folder: insomnia.InsomniaFolder,
    request: insomnia.InsomniaRequest | null
  ): this {
    if (request) {
      let folderName: oas.TagObject = { name: folder.name };
      this.builder.addTag(folderName);
      this.updateRequest(request, { tags: [folderName['name']] });
    }
    return this;
  }

  addEnvironment(env: insomnia.InsomniaEnvironment): this {
    this.envVars = { ...this.envVars, ...env };
    return this;
  }

  updateRequest(request: insomnia.InsomniaRequest, args: any): void {
    let sanitizedMethod = utils.sanitizeRequestMethod(request.method);
    let { path } = this.get_path_pathparams(request.url);
    let oasRequest = this.getRequestFromOas(path, sanitizedMethod);
    if (oasRequest) {
      let pathObject: oas.PathItemObject = {
        [sanitizedMethod]: Object.assign({}, oasRequest, { ...args }),
      };
      this.builder.addPath(path, pathObject);
    }
  }

  get_path_pathparams(
    url: string
  ): {
    path: string;
    params: oas.ParameterObject[];
  } {
    let pathInfo = this._get_oas_pathparams(url);
    if (pathInfo === null) {
      throw Error('Valid path is missing from request!');
    }
    return {
      path: pathInfo.path,
      params: pathInfo.params,
    };
  }

  addRequest(request: insomnia.InsomniaRequest): this {
    let pathItem: oas.PathItemObject = {
      summary: request.name,
      description: request.description,
    };

    let methodName = utils.sanitizeRequestMethod(request.method);
    let headers = this.insomnia_to_oas_params(request.headers, 'header');
    let pathInfo = this.get_path_pathparams(request.url);
    let queryParams = this.get_query_params(request);

    pathItem[methodName] = {
      parameters: [...headers, ...pathInfo.params, ...queryParams],
    };

    // If request belongs to folder
    // if(request.parentId && isFolder(request.parentId)) {
    //     // @TODO Use folder name instead of folder ids
    //     pathItem[methodName]['tags'] = [request.parentId]
    // }

    // Reference request Id
    pathItem[methodName][insoRequestIdKey] = request._id;

    // If the request has a non-empty body
    if (Object.keys(request.body).length !== 0) {
      pathItem[methodName].requestBody = this.get_request_body(request.body);
    }

    // Add the responses
    let responses = this.get_responses(request.examples || []);
    pathItem[methodName].responses = responses;

    this.builder.addPath(pathInfo.path, pathItem);

    // Add request body
    return this;
  }

  get_responses(
    examples: insomnia.ResponseExample[] = []
  ): oas.ResponsesObject {
    let oasResponsesBody = <oas.ResponsesObject>{};
    let oasResponseBody = { content: <oas.ResponseObject>{} };

    for (let example of examples) {
      // A base schema without any body
      let schema;
      let exampleBody = example.body;
      if (example.contentType === utils.headerTypes.JSON) {
        let body = '';
        try {
          body = JSON.parse(exampleBody);
        } catch (e) {
          console.info(
            'Response :: Error parsing json body. Using string instead'
          );
          body = exampleBody;
        } finally {
          schema = this._get_schema(body);
        }
      } else {
        schema = this._get_schema(exampleBody);
      }

      // Make a copy
      let responseObject = Object.assign(
        {},
        oasResponseBody['content'][example.contentType]
      );

      let existingSchema = responseObject && responseObject.schema;

      // Use oneOf is there is existing schema for this contentType and
      // status code
      responseObject.schema = !!existingSchema
        ? {
            oneOf: [...schema, ...existingSchema],
          }
        : schema;

      let exampleObj = { [example.id]: example.body };

      responseObject.examples = {
        ...exampleObj,
        ...responseObject.examples,
      };

      oasResponseBody['content'][example.contentType] = responseObject;
      oasResponsesBody[example.statusCode.toString()] = oasResponseBody;
    }

    return oasResponsesBody;
  }

  get_request_body(requestBody: any): oas.RequestBodyObject {
    let oasRequestBody = { content: <oas.SchemaObject>{} };

    // A base schema without any body
    let schema, exampleBody;

    // JSON Type
    if (requestBody.mimeType === utils.headerTypes.JSON) {
      let jsonBody = {};
      try {
        jsonBody = JSON.parse(requestBody.text);
      } catch (e) {
        // JSON parse error
        console.info(
          'RequestBody :: Error parsing json body. Using string instead'
        );
        jsonBody = requestBody.text;
      } finally {
        schema = this._get_schema(jsonBody);
        exampleBody = jsonBody;
      }
    } else if (
      // Form type
      requestBody.mimeType === utils.headerTypes.FORM ||
      requestBody.mimeType === utils.headerTypes.MULTIPART
    ) {
      let bodyParams = utils.parameterizeForm(requestBody.params);
      // @TODO beware: filetype uploads are not yet implemented
      schema = this._get_schema(bodyParams);
      exampleBody = bodyParams;
    } else {
      schema = { additionalProperties: true };
      exampleBody = requestBody['text'] || requestBody['params'] || {};
    }

    oasRequestBody['content'][requestBody.mimeType] = {
      schema,
      example: exampleBody,
    };

    return oasRequestBody;
  }

  get_query_params(request: insomnia.InsomniaRequest): oas.ParameterObject[] {
    let queryParamsFromurl = this._get_oas_query_params_from_url(request.url);
    let queryParamsFromParams = this.insomnia_to_oas_params(
      request.parameters,
      'query'
    );

    let urlQueryNames = queryParamsFromurl.map((q) => q.name);

    // pick only those which arent already found in query params
    let queryParams = queryParamsFromParams.filter(
      (q) => urlQueryNames.indexOf(q.name) === -1
    );

    return [...queryParamsFromurl, ...queryParams];
  }

  _get_from_env(key: any): any {
    if (this.envVars[key]) return this.envVars[key];
    return null;
  }

  add_url(url: string | undefined): this {
    if (!url) {
      return this;
    }
    if (utils.hasHttp(url) === false) {
      return this;
    }

    const servers = this.builder.rootDoc.servers;
    if (!servers) {
      this.builder.addServer({ url });
      return this;
    }

    const hasPath = servers.filter((s) => s.url === url);
    if (hasPath.length === 0) this.builder.addServer({ url });
    return this;
  }

  _get_oas_pathparams(
    uri: string
  ): {
    path: string;
    params: oas.ParameterObject[];
  } | null {
    let parsedPath: string = '';
    let parsedPathParams = [];
    try {
      const path = utils.urlFromPath(uri);

      // Add url to host if it is a quialified url
      this.add_url(path.origin);

      parsedPath = decodeURIComponent(path.pathname);
      let pathParams = utils.getTemplateMatches(parsedPath);
      for (let p of pathParams) {
        parsedPathParams.push(<oas.ParameterObject>{
          name: p,
          in: 'path',
          example: utils.replaceInsomniaTemplateWithVars(p, this.envVars),
          schema: this._get_schema(p),
        });
      }
    } catch (e) {
      console.error(e);
      // @TODO use regex to parse
      return null;
    }
    return { path: parsedPath, params: parsedPathParams };
  }

  insomnia_to_oas_params(
    insomniaParams: insomnia.Parameter[],
    _in: string
  ): oas.ParameterObject[] {
    let params = [];
    for (let param of insomniaParams) {
      if (param.name && param.name != '') {
        const _key = utils.replaceInsomniaTemplateWithVars(
          param.name,
          this.envVars
        );
        const _value = utils.replaceInsomniaTemplateWithVars(
          param.value,
          this.envVars
        );
        let _param = <oas.ParameterObject>{
          name: _key,
          in: _in,
          example: _value,
          schema: this._get_schema(_value),
        };
        params.push(_param);
      }
    }
    return params;
  }

  _get_oas_query_params_from_url(path: string): oas.ParameterObject[] {
    let params = [];
    try {
      const url = utils.urlFromPath(path);
      for (const [key, value] of url.searchParams) {
        params.push(<insomnia.Parameter>{
          name: decodeURIComponent(key),
          value: decodeURIComponent(value),
        });
      }
    } catch (e) {
      // @TODO use regex to parse
    } finally {
      return this.insomnia_to_oas_params(params, 'query');
    }
  }

  _get_schema(inputJsonObject: any) {
    let { title, $schema, ...schema } = GenerateSchema.json(
      'insomnia',
      inputJsonObject
    );
    return schema;
  }

  get_spec(): SpecExporter {
    return new SpecExporter(this.builder);
  }
}

export default OpenapiCollector;
