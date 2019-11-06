[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/redhat.vscode-quarkus.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-quarkus)

# Quarkus Tools for Visual Studio Code

## Description

This Visual Studio Code extension provides support for Quarkus development via a 
[Quarkus language server](https://github.com/redhat-developer/quarkus-ls/tree/master/quarkus.ls)
and a [Quarkus jdt.ls extension](https://github.com/redhat-developer/quarkus-ls/tree/master/quarkus.jdt).

![](images/propertiesSupport.png)

## Quarkus project wizards
  * Generate a Quarkus project, based on https://code.quarkus.io/
    - Call `Quarkus: Generate a Quarkus project` from the VS Code command palette
  * Add Quarkus extensions to current Quarkus project
    - Call `Quarkus: Add extensions to current project` from the VS Code command palette

## Quarkus `application.properties` Features
  * Completion support for Quarkus properties
  * Hover support for Quarkus properties
  * Validation support for Quarkus properties 
  * Support for Quarkus profiles
  * Outline support (flat or tree view)

## Quarkus debug command
  Launches the Maven `quarkus:dev` plugin or the Gradle `quarkusDev` command and automatically attaches a debugger
  * Call `Quarkus: Debug current Quarkus project` from the VS Code command palette

## Quarkus code snippets
This extension provides several code snippets, available when editing Java files:

  * **qrc** - Create a new Quarkus resource class
  * **qrm** - Create a new Quarkus resource method
  * **qtrc** - Create a new Quarkus test resource class
  * **qntrc** - Create a new Quarkus native test resource class

When editing `application.properties` files, you have access to:

  * **qds** - Configure a Quarkus datasource
  * **qj** - Configure a Jaeger tracer


## Requirements

  * Java JDK (or JRE) 8 or more recent
  * [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java)
  * [Debugger for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug)

## Supported VS Code settings

The following settings are supported:
  
* `quarkus.tools.debug.terminateProcessOnExit` : Determines whether to terminate the quarkus:dev task after closing the debug session.
* `quarkus.tools.trace.server` : Trace the communication between VS Code and the Quarkus Language Server in the Output view.
* `quarkus.tools.symbols.showAsTree` : Show Quarkus properties as tree (Outline). Default is `true`.
* `quarkus.tools.validation.enabled` : Enables Quarkus validation. Default is `true`.
* `quarkus.tools.validation.duplicate.severity` : Validation severity for duplicate Quarkus properties.
Default is `warning`.
* `quarkus.tools.validation.syntax.severity` : Validation severity for Quarkus property syntax checking.
Default is `error`.
* `quarkus.tools.validation.unknown.severity` : Validation severity for unknown Quarkus properties. Default is `warning`.
* `quarkus.tools.validation.unknown.excluded` : Array of properties to ignore for unknown Quarkus properties validation. Patterns can be used ('*' = any string, '?' = any character). Default is `[]`.

Since 1.1.0:
* `quarkus.tools.alwaysShowWelcomePage` : Determines whether to show the welcome page on extension startup.
* `quarkus.tools.formatting.surroundEqualsWithSpaces` : Insert spaces around the equals sign when formatting the application.properties file. Default is `false`.
* `quarkus.tools.validation.required.severity` : Validation severity for required Quarkus properties.
Default is `none`.
        
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
