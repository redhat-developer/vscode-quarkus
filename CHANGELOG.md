# Quarkus Tools for Visual Studio Code Changelog

## 1.1.1 (October 23, 2019)

### Enhancements

 * Support glob pattern to exclude unknown validation. See [#118](https://github.com/redhat-developer/vscode-quarkus/pull/118)
 * Welcome page opens on the side. See [#120](https://github.com/redhat-developer/vscode-quarkus/pull/120)

### Bug Fixes

 * Preserve focus when welcome page is displayed. See [#73](https://github.com/redhat-developer/vscode-quarkus/issues/73)

### Others

* Change "Quarkus: Generate a Maven Project" command ID. See [#123](https://github.com/redhat-developer/vscode-quarkus/pull/123)

## 1.1.0 (October 17, 2019)

### Enhancements

 * Improve documentation for default profiles. See [quarkus-ls#89](https://github.com/redhat-developer/quarkus-ls/issues/89)
 * Validate application.properties: type value. See [quarkus-ls#33](https://github.com/redhat-developer/quarkus-ls/issues/33)
 * Support for `textDocument/formatting`. See [quarkus-ls#24](https://github.com/redhat-developer/quarkus-ls/issues/24)
 * Validate application.properties: required properties. See [quarkus-ls#21](https://github.com/redhat-developer/quarkus-ls/issues/21)
 * Support for `textDocument/definition` for Java fields which have Config* annotation. See [quarkus-ls#4](https://github.com/redhat-developer/quarkus-ls/issues/4)
  * Debug startup command to uses mvn if mvnw does not exist. See [#95](https://github.com/redhat-developer/vscode-quarkus/issues/95)
 * Add snippet for Jaeger properties configuration. See [#93](https://github.com/redhat-developer/vscode-quarkus/issues/93)
 * Add snippets for configuring Panache. See [#90](https://github.com/redhat-developer/vscode-quarkus/issues/90)
 * Add welcome page with Quarkus information. See [#53](https://github.com/redhat-developer/vscode-quarkus/issues/53)

### Bug Fixes

 * Fix duplicate completion options for ConfigProperty. See [quarkus-ls#101](https://github.com/redhat-developer/quarkus-ls/issues/101)
 * Fix issue where boolean completion for optional boolean value was not working. See [quarkus-ls#88](https://github.com/redhat-developer/quarkus-ls/issues/88)
 * Fix issue where PropertiesModel start offset is -1. See [quarkus-ls#51](https://github.com/redhat-developer/quarkus-ls/issues/51)
 * Ignore/include properties in application.properties depending on test scope. See [quarkus-ls#5](https://github.com/redhat-developer/quarkus-ls/issues/5)
 * Corrected filename for mvnw.cmd (windows only). See [#105](https://github.com/redhat-developer/vscode-quarkus/pull/105)
 * Validate initial input value, offer context on invalid values. See [#84](https://github.com/redhat-developer/vscode-quarkus/issues/84)

### Others

 * Update lsp4j version to 0.8.1. See [quarkus-ls#107](https://github.com/redhat-developer/quarkus-ls/pull/107)
 * Freeze API for enumeration (String -> EnumItem). See [quarkus-ls#99](https://github.com/redhat-developer/quarkus-ls/issues/99)
 * Use logo compatible with both light and dark modes. See [#96](https://github.com/redhat-developer/vscode-quarkus/issues/96)
