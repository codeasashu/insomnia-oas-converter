# Insomnia Openapi Converter

This project converts [insomnia](https://insomnia.rest/) to openapi specification (3.0.0).
This package is an effort of improving the another package [Swaggymnia](https://github.com/mlabouardy/swaggymnia) 

so that I can use couple of extra features such as:
- Insomnia templates in path (`{{ }}` syntax in urls)
- Proper URL formatting and splitting query strings
- Supporting `oneOf`

[Insomnia](https://insomnia.rest/) being built on top of javascript framework, 
it is nice to have the converter in Javascript itself (you can use this as a plugin)

## Quickstart

Install this project using npm

```
npm i insomnia-openapi-converter
```

Once installed, you can access to converter in your javascript

```js
var SchemaConventer = require('insomnia-openapi-converter');

// Your openapi spec config
let openapiConfig = {
    "title": "My Api",
    "description": "A Very cool api",
    "version": "1.0.0",
    "baseUrl": "http://example.tld"
};

// Read insomnia exported (in v4 format) json file into a dict
let insomniaExportedInput = {
    "_type": "export",
    "__export_format": 4,
    "__export_date": "2020-09-03T15:26:50.615Z",
    "__export_source": "insomnia.desktop.app:v2020.4.0-beta.4",
    "resources": [
      ...
    ]
}

let schema = new SchemaConventer(insomniaExportedInput, openapiConfig)
let spec = schema.convert();

// Convert to yaml
let spec_in_yaml = spec.as_yaml()

// Convert to json
let spec_in_json = spec.as_json()

// Or you can simply get the spec is javascript object
let spec_dict = spec.as_dict()
```

## SchemaConventer

SchemaConventer is responsible for handling the insomnia input and perform some
validations on it. It also exposes a `convert` method, after the validations
has ran.

### convert

`convert` gives you a instance of `SpecExporter` which allows you to export the
specification as yaml, json or plain javascript object.

## SpecExporter

SpecExporter implements the yaml package to output the converted openapi spec
to yaml. It natively supports json and dict.

## Testing

TODO

## Author

- [Ashutosh Chaudhary](http://github.com/codeasashu)

## References

- [Swaggymnia](https://github.com/mlabouardy/swaggymnia) 
- [Insomnia](https://insomnia.rest/)