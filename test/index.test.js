import SchemaConventer from '../src';

const openapiConfig = {
  title: 'My Api',
  description: 'A Very cool api',
  version: '1.0.0',
  baseUrl: 'http://example.tld',
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
    servers: [{ url: 'http://example.tld' }],
  };
  expect(actualJson).toStrictEqual(JSON.stringify(expectedJson));
});
