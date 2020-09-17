import * as types from './types/insomnia';
import OpenapiCollector from './collector';
import * as utils from './utils';
import SpecExporter from './exporter';

class SchemaConventer {
  config = {
    title: 'Api',
    description: '',
    version: '1.0.0',
    baseUrl: 'http://example.tld',
  };

  validated = false;
  validationResult = {};

  collector!: OpenapiCollector;

  json = {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toString(),
    __export_source: 'openapi-converter-plugin',
    resources: <types.InsomniaResource[]>[],
  };

  constructor(json: types.InsomniaExport, config: any) {
    this.json = json;
    this.config = this.getConfig(config);
    this.validated = false;
    this.validationResult = {};
  }

  getConfig(config: any): types.InsomniaConfig {
    config = Object.assign({}, config || {});
    return { ...this.config, ...config };
  }

  getInsomniaResources(): types.InsomniaResource[] {
    return this.sortInsomniaResources(this.json.resources);
  }

  sortInsomniaResources(
    resources: types.InsomniaResource[]
  ): types.InsomniaResource[] {
    let environment = resources.filter(
      (r) => r._type == utils.types.ENVIRONMENT
    );
    let requests = resources.filter((r) => r._type == utils.types.REQUEST);
    let folders = resources.filter((r) => r._type == utils.types.FOLDER);
    let workspaces = resources.filter((r) => r._type == utils.types.WORKSPACE);
    let cookies = resources.filter((r) => r._type == utils.types.COOKIE);
    let specs = resources.filter((r) => r._type == utils.types.SPEC);

    // env > req > folder > workspace
    return [
      ...environment,
      ...requests,
      ...folders,
      ...workspaces,
      ...cookies,
      ...specs,
    ];
  }

  convert(): SpecExporter | null {
    this.collector = new OpenapiCollector();

    // Add openapi info
    this.collector.addInfo(this.config);
    // Json to insomnia classes
    let resources = this.getInsomniaResources();

    for (let resource of resources) {
      if (resource._type == utils.types.FOLDER) {
        let linkedRequest = utils.getRequestFromFolder(resource, resources);
        // We add the folder only if it is directly linked to request
        if (linkedRequest !== null)
          this.collector.addFolderToRequest(
            <types.InsomniaFolder>resource,
            linkedRequest
          );
      }

      if (resource._type == utils.types.ENVIRONMENT) {
        this.collector.addEnvironment(<types.InsomniaEnvironment>resource);
      }

      if (resource._type == utils.types.REQUEST) {
        try {
          this.collector.addRequest(<types.InsomniaRequest>resource);
        } catch (e) {
          this.validationResult = {
            result: false,
            reason: e,
          };
          return null;
        }
      }
    }

    return this.collector.get_spec();
  }
}

export default SchemaConventer;
