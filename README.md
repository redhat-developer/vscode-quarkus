# Quarkus Tools for Visual Studio Code

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/redhat.vscode-quarkus?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-quarkus)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/redhat.vscode-quarkus?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-quarkus)
[![Build Status](https://img.shields.io/github/actions/workflow/status/redhat-developer/vscode-quarkus/tests.yml?branch=master&style=for-the-badge&logo=github)](https://github.com/redhat-developer/vscode-quarkus/actions?query=branch%3Amaster)
[![License](https://img.shields.io/github/license/redhat-developer/vscode-quarkus?style=for-the-badge)](https://github.com/redhat-developer/vscode-quarkus/blob/master/LICENSE)

## Description

This Visual Studio Code extension provides support for :

 * [Quarkus](https://quarkus.io/) and [MicroProfile](https://github.com/eclipse/microprofile) development
by extending [Visual Studio Code extension for MicroProfile](https://github.com/redhat-developer/vscode-microprofile) with Quarkus features.

![](images/propertiesSupport.png)

 * [Qute support](docs/qute/README.md) to provide completion, validation, etc. for the [Qute template engine](https://quarkus.io/guides/qute-reference) inside Java and template files.

![](images/quteSupport.png)

 * [Renarde support](docs/renarde/README.md) to make sure that the Quarkus, MicroProfile, and Qute features work properly when working with a [Renarde](https://quarkiverse.github.io/quarkiverse-docs/quarkus-renarde/dev/index.html) application.

![](./docs/renarde/images/renarde-workspace-symbols.gif)

## Quarkus VS Code Commands
The following commands are supported for both Maven and Gradle Quarkus projects:

  * `Quarkus: Generate a Quarkus project`: Generate a Quarkus project, based on https://code.quarkus.io/
  * `Quarkus: Add extensions to current project`: Add Quarkus extensions to currently opened Quarkus project
  * `Quarkus: Debug current Quarkus project`: Launches the Maven `quarkus:dev` plugin or the Gradle `quarkusDev` command and automatically attaches a debugger
  * `Quarkus: Build executable`: Launches Maven or Gradle with the correct arguments to build an executable of the application (requires GraalVM or Mandrel to be configured)
  * `Quarkus: Deploy current Quarkus project to OpenShift (odo)`: Deploys the current project to a connected OpenShift cluster using [OpenShift Connector](https://github.com/redhat-developer/vscode-openshift-tools)

## Quarkus/MicroProfile `properties` Features

In `application.properties` and `microprofile-config.properties` files, you will benefit with:

  * Completion support for Quarkus/MicroProfile properties
  * Hover support for Quarkus/MicroProfile properties
  * Definition support for Quarkus/MicroProfile properties
  * Format support for Quarkus/MicroProfile properties
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
    * **qtrc** - Create a new Quarkus test resource class
    * **qitrc** - Create a new Quarkus integration test resource class
    * **qntrc** - Create a new Quarkus native test resource class (only works in older versions of Quarkus, since this testing method has been deprecated)
    * All the [snippets provided by vscode-microprofile](https://github.com/redhat-developer/vscode-microprofile#microprofile-java-features)

## Requirements

  * [Visual Studio Code extension for MicroProfile](https://github.com/redhat-developer/vscode-microprofile)
  * Java JDK (or JRE) 11 or more recent is required **except** on the following platforms : `win32-x64`, `linux-x64`, `linux-arm64`, `darwin-x64`, `darwin-arm64`. See [JDK Tooling](https://github.com/redhat-developer/vscode-java/#java-tooling-jdk) for details.
  * [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java)
  * [Debugger for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug)

## Supported VS Code settings

The following settings are supported:

* All [microprofile.tools.* settings](https://github.com/redhat-developer/vscode-microprofile#supported-vs-code-settings) from the [Visual Studio Code extension for MicroProfile](https://github.com/redhat-developer/vscode-microprofile)
* `quarkus.tools.debug.terminateProcessOnExit` : Determines whether to terminate the quarkus:dev task after closing the debug session. Default is `Ask`.
* `quarkus.tools.alwaysShowWelcomePage` : Determines whether to show the welcome page on extension startup. Default is `true`.
* `quarkus.tools.starter.api` : Quarkus API base URL. Default is `https://code.quarkus.io/api`.
* `quarkus.tools.starter.showExtensionDescriptions`: Determines whether to show the Quarkus extension descriptions when selecting Quarkus extensions. Default is `true`.
* `quarkus.tools.propertiesLanguageMismatch` : Action performed when detected Quarkus properties have an incorrect language. Default is `forceQuarkus`.

For `Qute settings`, please see [here](docs/qute/README.md#settings)

## Telemetry

With your approval, vscode-quarkus extension collects anonymous [usage data](USAGE_DATA.md) and sends it to Red Hat servers to help improve our products and services.
Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection) to learn more.
This extension respects the `redhat.telemetry.enabled` setting, which you can learn more about at https://github.com/redhat-developer/vscode-redhat-telemetry#how-to-disable-telemetry-reporting
Note that this extension abides by Visual Studio Code's telemetry level: if `telemetry.telemetryLevel` is set to off, then no telemetry events will be sent to Red Hat, even if `redhat.telemetry.enabled` is set to true. If `telemetry.telemetryLevel` is set to `error` or `crash`, only events containing an error or errors property will be sent to Red Hat.

## Articles

 * [New Features for Qute Templating Engine Support in Quarkus Tools for Visual Studio Code 1.13.0](https://quarkus.io/blog/vscode-quarkus-1.13.0-released/)
 * [Qute Templating Engine Support - Now Available for Quarkus Tools for Visual Studio Code](https://quarkus.io/blog/vscode-quarkus-1.10.0-qute/)
 * [Quarkus Tools for Visual Studio Code - 1.10.0 release](https://quarkus.io/blog/vscode-quarkus-1.10.0/)
 * [Quarkus Tools for Visual Studio Code - 1.4.0 release](https://quarkus.io/blog/vscode-quarkus-1.4.0/)
 * [Introducing 10 new features in Quarkus Tools for Visual Studio Code 1.3.0](https://quarkus.io/blog/vscode-quarkus-1.3.0/)
 * [Quarkus Tools for Visual Studio Code - 1.2.0 release](https://quarkus.io/blog/vscode-quarkus-1.2.0/)
 * [Quarkus Tools for Visual Studio Code - 1.1.0 release](https://quarkus.io/blog/vscode-quarkus-1.1.0/)
 * [Quarkus developer joy for VS Code](https://quarkus.io/blog/quarkus-developer-joy-for-vs-code/)

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
