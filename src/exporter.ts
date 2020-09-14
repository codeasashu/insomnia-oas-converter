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

  as_json(): string {
    return this.spec.getSpecAsJson();
  }

  as_dict(): OpenAPIObject {
    return this.spec.getSpec();
  }
}

export default SpecExporter;
