import SchemaConventer from '../src';

const openapiConfig = {
  title: 'My Api',
  description: 'A Very cool api',
  version: '1.0.0',
};

const insomniaExportedInput = {
  _type: 'export',
  __export_format: 4,
  __export_date: '2020-09-03T15:26:50.615Z',
  __export_source: 'insomnia.desktop.app:v2020.4.0-beta.4',
  resources: [],
};

test('It generates empty schema on empty exports', () => {
  const schema = new SchemaConventer(insomniaExportedInput, openapiConfig);
  let spec = schema.convert();
  const actualJson = spec.as_json();
  const expectedJson = {
    openapi: '3.0.0',
    info: { title: 'My Api', version: '1.0.0', description: 'A Very cool api' },
    paths: {},
    components: {
      schemas: {},
      responses: {},
      parameters: {},
      examples: {},
      requestBodies: {},
      headers: {},
      securitySchemes: {},
      links: {},
      callbacks: {},
    },
    tags: [],
    servers: [],
  };
  expect(actualJson).toStrictEqual(JSON.stringify(expectedJson));
});

test('It generates correct servers with given baseurl', () => {
  let _openapiConfig = Object.assign({}, openapiConfig, {
    baseUrl: 'http://example.tld',
  });
  const schema = new SchemaConventer(insomniaExportedInput, _openapiConfig);
  let spec = schema.convert();
  const actualJson = spec.as_json();
  const expectedJson = {
    openapi: '3.0.0',
    info: { title: 'My Api', version: '1.0.0', description: 'A Very cool api' },
    paths: {},
    components: {
      schemas: {},
      responses: {},
      parameters: {},
      examples: {},
      requestBodies: {},
      headers: {},
      securitySchemes: {},
      links: {},
      callbacks: {},
    },
    tags: [],
    servers: [{ url: 'http://example.tld' }],
  };
  expect(actualJson).toStrictEqual(JSON.stringify(expectedJson));
});

test('It fixes #3', () => {
  let insomniaExportedInput = {
    _type: 'export',
    __export_format: 4,
    __export_date: '2021-07-14T19:51:51.736Z',
    __export_source: 'insomnia.desktop.app:v2021.4.1',
    resources: [
      {
        _id: 'req_0aeb8573659a492ab4028726e03a1696',
        parentId: 'fld_9801f91f2f9e4537a12a73f953f1deee',
        modified: 1626287396908,
        created: 1626287357111,
        url: 'https://hello.world/goodbye/world',
        name: 'world',
        description: '',
        method: 'GET',
        body: {
          mimeType: 'multipart/form-data',
          params: [
            {
              id: 'pair_6b664b7a8d2a451eabeb11e15b4f8769',
              name: 'name',
              value: 'Megatron',
              description: '',
            },
            {
              id: 'pair_0315d148eba343408ad76277b1108bfb',
              name: 'age',
              value: '21',
              description: '',
            },
          ],
        },
        parameters: [],
        headers: [
          {
            name: 'Content-Type',
            value: 'multipart/form-data',
            id: 'pair_262c30b58f014fac873a9ade3dabfc17',
          },
        ],
        authentication: {},
        metaSortKey: -1626287357111,
        isPrivate: false,
        settingStoreCookies: true,
        settingSendCookies: true,
        settingDisableRenderRequestBody: false,
        settingEncodeUrl: true,
        settingRebuildPath: true,
        settingFollowRedirects: 'global',
        _type: 'request',
      },
      {
        _id: 'fld_9801f91f2f9e4537a12a73f953f1deee',
        parentId: 'wrk_aac7134f6f2d48438d027978bd6064d0',
        modified: 1626287353256,
        created: 1626287353256,
        name: 'goodbye',
        description: '',
        environment: {},
        environmentPropertyOrder: null,
        metaSortKey: -1626287353256,
        _type: 'request_group',
      },
      {
        _id: 'wrk_aac7134f6f2d48438d027978bd6064d0',
        parentId: null,
        modified: 1626287344161,
        created: 1626287344161,
        name: 'test',
        description: '',
        scope: 'collection',
        _type: 'workspace',
      },
      {
        _id: 'env_57227cd827cc9c7ea3d58f94345b578b4e8e8792',
        parentId: 'wrk_aac7134f6f2d48438d027978bd6064d0',
        modified: 1626287344579,
        created: 1626287344579,
        name: 'Base Environment',
        data: {},
        dataPropertyOrder: null,
        color: null,
        isPrivate: false,
        metaSortKey: 1626287344579,
        _type: 'environment',
      },
      {
        _id: 'jar_57227cd827cc9c7ea3d58f94345b578b4e8e8792',
        parentId: 'wrk_aac7134f6f2d48438d027978bd6064d0',
        modified: 1626287344586,
        created: 1626287344586,
        name: 'Default Jar',
        cookies: [],
        _type: 'cookie_jar',
      },
      {
        _id: 'spc_d7f2d07af61044d5a78167fc5d039199',
        parentId: 'wrk_aac7134f6f2d48438d027978bd6064d0',
        modified: 1626287344164,
        created: 1626287344164,
        fileName: 'test',
        contents: '',
        contentType: 'yaml',
        _type: 'api_spec',
      },
    ],
  };
  const schema = new SchemaConventer(insomniaExportedInput, openapiConfig);
  let spec = schema.convert();
  const actualJson = spec.as_json();
  const expectedJson = {
    openapi: '3.0.0',
    info: { title: 'My Api', version: '1.0.0', description: 'A Very cool api' },
    paths: {
      '/goodbye/world': {
        get: {
          parameters: [
            {
              name: 'Content-Type',
              in: 'header',
              example: 'multipart/form-data',
              schema: { type: 'string' },
            },
          ],
          'x-request-id': 'req_0aeb8573659a492ab4028726e03a1696',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    age: { type: 'string' },
                  },
                },
                example: {
                  name: 'Megatron',
                  age: '21',
                },
              },
            },
          },
          responses: {},
          tags: ['goodbye'],
        },
      },
    },
    components: {
      schemas: {},
      responses: {},
      parameters: {},
      examples: {},
      requestBodies: {},
      headers: {},
      securitySchemes: {},
      links: {},
      callbacks: {},
    },
    tags: [{ name: 'goodbye' }],
    servers: [{ url: 'https://hello.world' }],
  };
  expect(actualJson).toStrictEqual(JSON.stringify(expectedJson));
});
