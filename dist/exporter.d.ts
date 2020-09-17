import { OpenApiBuilder, OpenAPIObject } from 'openapi3-ts';
declare class SpecExporter {
    spec: OpenApiBuilder;
    constructor(spec: OpenApiBuilder);
    as_yaml(): string;
    as_json(formatted: Boolean): string;
    as_dict(): OpenAPIObject;
}
export default SpecExporter;
