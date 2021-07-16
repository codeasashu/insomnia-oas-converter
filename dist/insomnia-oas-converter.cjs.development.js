'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var oas = require('openapi3-ts');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

var insomniaTemplateRegex = /(?<!\\){([^{}]+)(?<!\\)}/g;
var types = {
  REQUEST: 'request',
  FOLDER: 'request_group',
  ENVIRONMENT: 'environment',
  WORKSPACE: 'workspace',
  COOKIE: 'cookie_jar',
  SPEC: 'api_spec'
};
var headerTypes = {
  JSON: 'application/json',
  MULTIPART: 'multipart/form-data',
  FORM: 'application/x-www-form-urlencoded'
};
var getRequestFromFolder = function getRequestFromFolder(resource, resources) {
  var foundRequests = resources.filter(function (r) {
    return r.parentId == resource._id;
  });

  if (foundRequests.length) {
    return foundRequests.pop();
  }

  return null;
};
var getTemplateMatches = function getTemplateMatches(variable) {
  variable = variable.toString();
  var matches = variable.matchAll(insomniaTemplateRegex);
  return Array.from(matches).map(function (m) {
    return m[1].trim();
  });
};
/**
 * Converts insomnia defined variable holders to openapi variables
 * {{ xyz }} -> { xyz }
 * @param uri string The url to replace the variable
 */

var trimTemplate = function trimTemplate(variable, keepInsomniaFormat) {
  if (keepInsomniaFormat === void 0) {
    keepInsomniaFormat = false;
  }

  variable = variable.toString(); // console.log("trim1", variable)

  var matches = variable.matchAll(insomniaTemplateRegex);

  for (var _iterator = _createForOfIteratorHelperLoose(matches), _step; !(_step = _iterator()).done;) {
    var match = _step.value;
    var trimmedMatch = match[0].replace('{', '').replace('}', '').trim();
    var replaceWith = !!keepInsomniaFormat ? "{" + trimmedMatch + "}" : trimmedMatch;
    variable = variable.replace(match[0], replaceWith);
  }

  return variable;
};
var replaceInsomniaTemplateWithVars = function replaceInsomniaTemplateWithVars(variable, envVars) {
  if (envVars === void 0) {
    envVars = {};
  }

  variable = variable.toString();
  var matches = variable.matchAll(insomniaTemplateRegex);

  for (var match in matches) {
    var trimmedMatch = match[1].trim();
    variable = variable.replace(match[0], envVars[trimmedMatch] || match[0]);
  }

  return variable;
};
var hasHttp = function hasHttp(path) {
  return path.includes('http://') || path.includes('https://');
};
/**
 * Get a URL instance from insomnia url
 * @param path
 */

var urlFromPath = function urlFromPath(path) {
  if (hasHttp(path) === false) {
    path = "http://" + path;
  }

  return new URL(trimTemplate(path));
};
var parameterizeForm = function parameterizeForm(insomniaFormParams) {
  var bodyParams = {};

  for (var _iterator2 = _createForOfIteratorHelperLoose(insomniaFormParams), _step2; !(_step2 = _iterator2()).done;) {
    var param = _step2.value;
    bodyParams[param.name] = param.value;
  }

  return bodyParams;
};
var sanitizeRequestMethod = function sanitizeRequestMethod(method) {
  return method.toLowerCase().trim();
};

var yaml = /*#__PURE__*/require('js-yaml');

var SpecExporter = /*#__PURE__*/function () {
  function SpecExporter(spec) {
    this.spec = spec;
  }

  var _proto = SpecExporter.prototype;

  _proto.as_yaml = function as_yaml() {
    return yaml.dump(this.as_dict());
  };

  _proto.as_json = function as_json(formatted) {
    var specjson = this.spec.getSpecAsJson();

    if (formatted === true) {
      try {
        return JSON.stringify(JSON.parse(specjson), null, 2);
      } catch (error) {
        console.warn('[JSON parseerror]', error);
        return specjson;
      }
    }

    return specjson;
  };

  _proto.as_dict = function as_dict() {
    return this.spec.getSpec();
  };

  return SpecExporter;
}();

var GenerateSchema = /*#__PURE__*/require('generate-schema');

var insoRequestIdKey = 'x-request-id';

var OpenapiCollector = /*#__PURE__*/function () {
  function OpenapiCollector() {
    this.envVars = {};
    this.builder = new oas.OpenApiBuilder();
  }

  var _proto = OpenapiCollector.prototype;

  _proto.addInfo = function addInfo(config) {
    this.builder.addTitle(config.title);
    this.builder.addDescription(config.description);
    this.builder.addVersion(config.version);
    this.add_url(config.baseUrl);
    return this;
  };

  _proto.getRequestFromOas = function getRequestFromOas(path, method) {
    var oasPath = oas.getPath(this.builder.rootDoc.paths, path);
    return oasPath && oasPath[method] || null;
  };

  _proto.addFolderToRequest = function addFolderToRequest(folder, request) {
    if (request) {
      var folderName = {
        name: folder.name
      };
      this.builder.addTag(folderName);
      this.updateRequest(request, {
        tags: [folderName['name']]
      });
    }

    return this;
  };

  _proto.addEnvironment = function addEnvironment(env) {
    this.envVars = _extends({}, this.envVars, env);
    return this;
  };

  _proto.updateRequest = function updateRequest(request, args) {
    var sanitizedMethod = sanitizeRequestMethod(request.method);

    var _this$get_path_pathpa = this.get_path_pathparams(request.url),
        path = _this$get_path_pathpa.path;

    var oasRequest = this.getRequestFromOas(path, sanitizedMethod);

    if (oasRequest) {
      var _pathObject;

      var pathObject = (_pathObject = {}, _pathObject[sanitizedMethod] = Object.assign({}, oasRequest, _extends({}, args)), _pathObject);
      this.builder.addPath(path, pathObject);
    }
  };

  _proto.get_path_pathparams = function get_path_pathparams(url) {
    var pathInfo = this._get_oas_pathparams(url);

    if (pathInfo === null) {
      throw Error('Valid path is missing from request!');
    }

    return {
      path: pathInfo.path,
      params: pathInfo.params
    };
  };

  _proto.addRequest = function addRequest(request) {
    var pathItem = {
      summary: request.name,
      description: request.description
    };
    var methodName = sanitizeRequestMethod(request.method);
    var headers = this.insomnia_to_oas_params(request.headers, 'header');
    var pathInfo = this.get_path_pathparams(request.url);
    var queryParams = this.get_query_params(request);
    pathItem[methodName] = {
      parameters: [].concat(headers, pathInfo.params, queryParams)
    }; // If request belongs to folder
    // if(request.parentId && isFolder(request.parentId)) {
    //     // @TODO Use folder name instead of folder ids
    //     pathItem[methodName]['tags'] = [request.parentId]
    // }
    // Reference request Id

    pathItem[methodName][insoRequestIdKey] = request._id; // If the request has a non-empty body

    if (Object.keys(request.body).length !== 0) {
      pathItem[methodName].requestBody = this.get_request_body(request.body);
    } // Add the responses


    var responses = this.get_responses(request.examples || []);
    pathItem[methodName].responses = responses;
    this.builder.addPath(pathInfo.path, pathItem); // Add request body

    return this;
  };

  _proto.get_responses = function get_responses(examples) {
    if (examples === void 0) {
      examples = [];
    }

    var oasResponsesBody = {};
    var oasResponseBody = {
      content: {}
    };

    for (var _iterator = _createForOfIteratorHelperLoose(examples), _step; !(_step = _iterator()).done;) {
      var _exampleObj;

      var example = _step.value;
      // A base schema without any body
      var schema = void 0;
      var exampleBody = example.body;

      if (example.contentType === headerTypes.JSON) {
        var body = '';

        try {
          body = JSON.parse(exampleBody);
        } catch (e) {
          console.info('Response :: Error parsing json body. Using string instead');
          body = exampleBody;
        } finally {
          schema = this._get_schema(body);
        }
      } else {
        schema = this._get_schema(exampleBody);
      } // Make a copy


      var responseObject = Object.assign({}, oasResponseBody['content'][example.contentType]);
      var existingSchema = responseObject && responseObject.schema; // Use oneOf is there is existing schema for this contentType and
      // status code

      responseObject.schema = !!existingSchema ? {
        oneOf: [].concat(schema, existingSchema)
      } : schema;
      var exampleObj = (_exampleObj = {}, _exampleObj[example.id] = example.body, _exampleObj);
      responseObject.examples = _extends({}, exampleObj, responseObject.examples);
      oasResponseBody['content'][example.contentType] = responseObject;
      oasResponsesBody[example.statusCode.toString()] = oasResponseBody;
    }

    return oasResponsesBody;
  };

  _proto.get_request_body = function get_request_body(requestBody) {
    var oasRequestBody = {
      content: {}
    }; // A base schema without any body

    var schema, exampleBody; // JSON Type

    if (requestBody.mimeType === headerTypes.JSON) {
      var jsonBody = {};

      try {
        jsonBody = JSON.parse(requestBody.text);
      } catch (e) {
        // JSON parse error
        console.info('RequestBody :: Error parsing json body. Using string instead');
        jsonBody = requestBody.text;
      } finally {
        schema = this._get_schema(jsonBody);
        exampleBody = jsonBody;
      }
    } else if ( // Form type
    requestBody.mimeType === headerTypes.FORM || requestBody.mimeType === headerTypes.MULTIPART) {
      var bodyParams = parameterizeForm(requestBody.params); // @TODO beware: filetype uploads are not yet implemented

      schema = this._get_schema(bodyParams);
      exampleBody = bodyParams;
    } else {
      schema = {
        additionalProperties: true
      };
      exampleBody = requestBody['text'] || requestBody['params'] || {};
    }

    oasRequestBody['content'][requestBody.mimeType] = {
      schema: schema,
      example: exampleBody
    };
    return oasRequestBody;
  };

  _proto.get_query_params = function get_query_params(request) {
    var queryParamsFromurl = this._get_oas_query_params_from_url(request.url);

    var queryParamsFromParams = this.insomnia_to_oas_params(request.parameters, 'query');
    var urlQueryNames = queryParamsFromurl.map(function (q) {
      return q.name;
    }); // pick only those which arent already found in query params

    var queryParams = queryParamsFromParams.filter(function (q) {
      return urlQueryNames.indexOf(q.name) === -1;
    });
    return [].concat(queryParamsFromurl, queryParams);
  };

  _proto._get_from_env = function _get_from_env(key) {
    if (this.envVars[key]) return this.envVars[key];
    return null;
  };

  _proto.add_url = function add_url(url) {
    if (!url) {
      return this;
    }

    if (hasHttp(url) === false) {
      return this;
    }

    var servers = this.builder.rootDoc.servers;

    if (!servers) {
      this.builder.addServer({
        url: url
      });
      return this;
    }

    var hasPath = servers.filter(function (s) {
      return s.url === url;
    });
    if (hasPath.length === 0) this.builder.addServer({
      url: url
    });
    return this;
  };

  _proto._get_oas_pathparams = function _get_oas_pathparams(uri) {
    var parsedPath = '';
    var parsedPathParams = [];

    try {
      var path = urlFromPath(uri); // Add url to host if it is a quialified url

      this.add_url(path.origin);
      parsedPath = decodeURIComponent(path.pathname);
      var pathParams = getTemplateMatches(parsedPath);

      for (var _iterator2 = _createForOfIteratorHelperLoose(pathParams), _step2; !(_step2 = _iterator2()).done;) {
        var p = _step2.value;
        parsedPathParams.push({
          name: p,
          "in": 'path',
          example: replaceInsomniaTemplateWithVars(p, this.envVars),
          schema: this._get_schema(p)
        });
      }
    } catch (e) {
      console.error(e); // @TODO use regex to parse

      return null;
    }

    return {
      path: parsedPath,
      params: parsedPathParams
    };
  };

  _proto.insomnia_to_oas_params = function insomnia_to_oas_params(insomniaParams, _in) {
    var params = [];

    for (var _iterator3 = _createForOfIteratorHelperLoose(insomniaParams), _step3; !(_step3 = _iterator3()).done;) {
      var param = _step3.value;

      if (param.name && param.name != '') {
        var _key = replaceInsomniaTemplateWithVars(param.name, this.envVars);

        var _value = replaceInsomniaTemplateWithVars(param.value, this.envVars);

        var _param = {
          name: _key,
          "in": _in,
          example: _value,
          schema: this._get_schema(_value)
        };
        params.push(_param);
      }
    }

    return params;
  };

  _proto._get_oas_query_params_from_url = function _get_oas_query_params_from_url(path) {
    var params = [];

    try {
      var url = urlFromPath(path);

      for (var _iterator4 = _createForOfIteratorHelperLoose(url.searchParams), _step4; !(_step4 = _iterator4()).done;) {
        var _step4$value = _step4.value,
            key = _step4$value[0],
            value = _step4$value[1];
        params.push({
          name: decodeURIComponent(key),
          value: decodeURIComponent(value)
        });
      }
    } catch (e) {// @TODO use regex to parse
    } finally {
      return this.insomnia_to_oas_params(params, 'query');
    }
  };

  _proto._get_schema = function _get_schema(inputJsonObject) {
    var _GenerateSchema$json = GenerateSchema.json('insomnia', inputJsonObject),
        schema = _objectWithoutPropertiesLoose(_GenerateSchema$json, ["title", "$schema"]);

    return schema;
  };

  _proto.get_spec = function get_spec() {
    return new SpecExporter(this.builder);
  };

  return OpenapiCollector;
}();

var SchemaConventer = /*#__PURE__*/function () {
  function SchemaConventer(json, config) {
    this.config = {
      title: 'Api',
      description: '',
      version: '1.0.0'
    };
    this.validated = false;
    this.validationResult = {};
    this.json = {
      _type: 'export',
      __export_format: 4,
      __export_date: new Date().toString(),
      __export_source: 'openapi-converter-plugin',
      resources: []
    };
    this.json = json;
    this.config = this.getConfig(config);
    this.validated = false;
    this.validationResult = {};
  }

  var _proto = SchemaConventer.prototype;

  _proto.getConfig = function getConfig(config) {
    config = Object.assign({}, config || {});
    return _extends({}, this.config, config);
  };

  _proto.getInsomniaResources = function getInsomniaResources() {
    return this.sortInsomniaResources(this.json.resources);
  };

  _proto.sortInsomniaResources = function sortInsomniaResources(resources) {
    var environment = resources.filter(function (r) {
      return r._type == types.ENVIRONMENT;
    });
    var requests = resources.filter(function (r) {
      return r._type == types.REQUEST;
    });
    var folders = resources.filter(function (r) {
      return r._type == types.FOLDER;
    });
    var workspaces = resources.filter(function (r) {
      return r._type == types.WORKSPACE;
    });
    var cookies = resources.filter(function (r) {
      return r._type == types.COOKIE;
    });
    var specs = resources.filter(function (r) {
      return r._type == types.SPEC;
    }); // env > req > folder > workspace

    return [].concat(environment, requests, folders, workspaces, cookies, specs);
  };

  _proto.convert = function convert() {
    this.collector = new OpenapiCollector(); // Add openapi info

    this.collector.addInfo(this.config); // Json to insomnia classes

    var resources = this.getInsomniaResources();

    for (var _iterator = _createForOfIteratorHelperLoose(resources), _step; !(_step = _iterator()).done;) {
      var resource = _step.value;

      if (resource._type == types.FOLDER) {
        var linkedRequest = getRequestFromFolder(resource, resources); // We add the folder only if it is directly linked to request

        if (linkedRequest !== null) this.collector.addFolderToRequest(resource, linkedRequest);
      }

      if (resource._type == types.ENVIRONMENT) {
        this.collector.addEnvironment(resource);
      }

      if (resource._type == types.REQUEST) {
        try {
          this.collector.addRequest(resource);
        } catch (e) {
          console.error(resource._id, e);
          this.validationResult = {
            result: false,
            reason: e
          };
          return null;
        }
      }
    }

    return this.collector.get_spec();
  };

  return SchemaConventer;
}();

exports.default = SchemaConventer;
//# sourceMappingURL=insomnia-oas-converter.cjs.development.js.map
