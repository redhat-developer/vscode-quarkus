[![Build Status](https://travis-ci.org/redhat-developer/vscode-quarkus.svg?branch=master)](https://travis-ci.org/github/redhat-developer/vscode-quarkus)
[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/redhat.vscode-quarkus.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-quarkus)

# Quarkus Tools for Visual Studio Code

## Description

This Visual Studio Code extension provides support for [Quarkus](https://quarkus.io/) and [MicroProfile](https://github.com/eclipse/microprofile) development via:

 * a [MicroProfile language server](https://github.com/redhat-developer/quarkus-ls/tree/master/microprofile.ls).
 * a [MicroProfile jdt.ls extension](https://github.com/redhat-developer/quarkus-ls/tree/master/microprofile.jdt/com.redhat.microprofile.jdt.core).
 * a [Quarkus jdt.ls extension](https://github.com/redhat-developer/quarkus-ls/tree/master/microprofile.jdt/com.redhat.microprofile.jdt.quarkus).

![](images/propertiesSupport.png)

## Quarkus VS Code Commands
The following commands are supported for both Maven and Gradle Quarkus projects:

  * `Quarkus: Generate a Quarkus project`: Generate a Quarkus project, based on https://code.quarkus.io/
  * `Quarkus: Add extensions to current project`: Add Quarkus extensions to currently opened Quarkus project
  * `Quarkus: Debug current Quarkus project`: Launches the Maven `quarkus:dev` plugin or the Gradle `quarkusDev` command and automatically attaches a debugger  

## Quarkus/MicroProfile `properties` Features

In `application.properties` and `microprofile-config.properties` files, you will benefit with:

  * Completion support for Quarkus/MicroProfile properties
  * Hover support for Quarkus/MicroProfile properties
  * Validation and Quick Fix support for Quarkus/MicroProfile properties 
  * Support for Quarkus profiles
  * Outline support (flat or tree view)
  * Code snippets:
    * **qds** - Configure a Quarkus datasource
    * **qj** - Configure a Jaeger tracer
  
## Quarkus `yaml` Features

In `application.yaml` and `application.yml` files, you will benefit with:

  * Completion support for Quarkus/MicroProfile properties
  * Hover support for Quarkus/MicroProfile properties
  * Validation support for Quarkus/MicroProfile properties 
  * Support for Quarkus profiles
  * Outline support

## Quarkus/MicroProfile `Java` Features

In `Java` files, you will benefit with:

  * Completion support for MicroProfile
  * Hover support for MicroProfile
  * Validation and Quick Fix support for MicroProfile
  * Code Lens support for Quarkus/MicroProfile
  * Code snippets:
    * **qrc** - Create a new Quarkus resource class
    * **qrm** - Create a new Quarkus resource method
    * **qtrc** - Create a new Quarkus test resource class
    * **qntrc** - Create a new Quarkus native test resource class
    * snippets for MicroProfile annotations.

## Requirements

  * Java JDK (or JRE) 8 or more recent
  * [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java)
  * [Debugger for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug)

## Supported VS Code settings

The following settings are supported:
  
* `quarkus.tools.alwaysShowWelcomePage` : Determines whether to show the welcome page on extension startup.
* `quarkus.tools.debug.terminateProcessOnExit` : Determines whether to terminate the quarkus:dev task after closing the debug session.
* `quarkus.tools.formatting.surroundEqualsWithSpaces` : Insert spaces around the equals sign when formatting the application.properties file. Default is `false`.
* `quarkus.tools.trace.server` : Trace the communication between VS Code and the Quarkus Language Server in the Output view.
* `quarkus.tools.symbols.showAsTree` : Show Quarkus properties as tree (Outline). Default is `true`.
* `quarkus.tools.validation.enabled` : Enables Quarkus validation. Default is `true`.
* `quarkus.tools.validation.duplicate.severity` : Validation severity for duplicate properties for Quarkus/MicroProfile `*.properties` files.
Default is `warning`.
* `quarkus.tools.validation.syntax.severity` : Validation severity for property syntax checking for Quarkus/MicroProfile `*.properties` files.
Default is `error`.
* `quarkus.tools.validation.required.severity` : Validation severity for required properties for Quarkus/MicroProfile `*.properties` files.
Default is `none`.
* `quarkus.tools.validation.unknown.severity` : Validation severity for unknown properties for Quarkus/MicroProfile `*.properties` files. Default is `warning`.
* `quarkus.tools.validation.unknown.excluded` : Array of properties to ignore for unknown Quarkus properties validation. Patterns can be used ('*' = any string, '?' = any character).
Default is `["*/mp-rest/providers/*/priority", "mp.openapi.schema.*"]`.


Since 1.3.0:
* `quarkus.tools.codeLens.urlCodeLensEnabled` : Enable/disable the URL code lenses for REST services. Default is`true`.
* `quarkus.tools.starter.showExtensionDescriptions`: Determines whether to show the Quarkus extension descriptions when selecting Quarkus extensions. Default is `true`.
* `quarkus.tools.validation.value.severity`: Validation severity for property values for Quarkus/MicroProfile `*.properties` files. Default is `error`.

### **Note for MicroProfile Rest Client properties**:

Due to [this issue](https://github.com/redhat-developer/quarkus-ls/issues/203), the MP Rest property: `<mp-rest-client-class>/mp-rest/providers/<mp-rest-provider-class>/priority` reports an unknown error. 

To avoid having this error, you must configure the following in `settings.json`:

```json
"quarkus.tools.validation.unknown.excluded": [
    "*/mp-rest/providers/*/priority"
]
```

This settings is set by default.

## Articles

 * [Quarkus developer joy for VS Code](https://quarkus.io/blog/quarkus-developer-joy-for-vs-code/)
 * [Quarkus Tools for Visual Studio Code - 1.1.0 release](https://quarkus.io/blog/vscode-quarkus-1.1.0/)
 * [Quarkus Tools for Visual Studio Code - 1.2.0 release](https://quarkus.io/blog/vscode-quarkus-1.2.0/)
 * [Introducing 10 new features in Quarkus Tools for Visual Studio Code 1.3.0](https://quarkus.io/blog/vscode-quarkus-1.3.0/)
 * [Quarkus Tools for Visual Studio Code - 1.4.0 release](https://quarkus.io/blog/vscode-quarkus-1.4.0/)

## Contributing

This is an open source project open to anyone. Contributions are extremely welcome!

For information on getting started, refer to the [CONTRIBUTING instructions](CONTRIBUTING.md).

CI builds can be installed manually by following these instructions:

  1) Download the latest development VSIX archive [from here](https://download.jboss.org/jbosstools/vscode/snapshots/vscode-quarkus/?C=M;O=D). `(vscode-quarkus-XXX.vsix)`

  2) Click `View/Command Palette` 
  
  3) Type 'VSIX'

  4) Select 'Install from VSIX...' and choose the `.vsix` file.

## Feedback

File a bug in [GitHub Issues](https://github.com/redhat-developer/vscode-quarkus/issues).

## License

Apache License 2.0.
See [LICENSE](LICENSE) file.
