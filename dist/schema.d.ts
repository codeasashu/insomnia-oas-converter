import * as types from './types/insomnia';
import OpenapiCollector from './collector';
import SpecExporter from './exporter';
declare class SchemaPack {
    config: {
        title: string;
        description: string;
        version: string;
        baseUrl: string;
    };
    validated: boolean;
    validationResult: {};
    collector: OpenapiCollector;
    json: {
        _type: string;
        __export_format: number;
        __export_date: string;
        __export_source: string;
        resources: types.InsomniaResource[];
    };
    constructor(json: types.InsomniaExport, config: any);
    getConfig(config: any): types.InsomniaConfig;
    getInsomniaResources(): types.InsomniaResource[];
    sortInsomniaResources(resources: types.InsomniaResource[]): types.InsomniaResource[];
    convert(): SpecExporter | null;
}
export default SchemaPack;
