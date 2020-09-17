import { OpenApiBuilder, OpenAPIObject } from 'openapi3-ts';
const yaml = require('js-yaml');

class SpecExporter {
  spec: OpenApiBuilder;

  constructor(spec: OpenApiBuilder) {
    this.spec = spec;
  }

  as_yaml(): string {
    return yaml.dump(this.as_dict());
  }

  as_json(formatted: Boolean): string {
    const specjson = this.spec.getSpecAsJson();
    if (formatted === true) {
      try {
        return JSON.stringify(JSON.parse(specjson), null, 2);
      } catch (error) {
        console.warn('[JSON parseerror]', error);
        return specjson;
      }
    }
    return specjson;
  }

  as_dict(): OpenAPIObject {
    return this.spec.getSpec();
  }
}

export default SpecExporter;
