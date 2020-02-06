# Quarkus Tools for Visual Studio Code Changelog

## 1.3.0 (February 6, 2020)

### Enhancements

 * Add new `quarkus.tools.validation.value.severity` preference to disable application.properties value validation. See [#201](https://github.com/redhat-developer/vscode-quarkus/issues/201)
 * Add Qute TextMate grammar and language configuration for HTML files. See [#182](https://github.com/redhat-developer/vscode-quarkus/issues/182)
 * Add Qute TextMate grammar and language configuration for JSON, YAML and txt files. See [#194](https://github.com/redhat-developer/vscode-quarkus/pull/194)
 * Add support for YAML configuration files. See [#189](https://github.com/redhat-developer/vscode-quarkus/pull/189)
 * Update language server to support microprofile-config.properties. See [#181](https://github.com/redhat-developer/vscode-quarkus/issues/181)
 * Use API to check if tasks.json and launch.json exist. See [#180](https://github.com/redhat-developer/vscode-quarkus/pull/180)
 * Add extension description and toggle button to extensions list. See [#164](https://github.com/redhat-developer/vscode-quarkus/issues/164)
 * Provide option to add created new project folder to multi-root VS Code workspace. See [#157](https://github.com/redhat-developer/vscode-quarkus/issues/157)
 * Improve the QuickPick for choosing extensions . See [#141](https://github.com/redhat-developer/vscode-quarkus/issues/141)
 * Add support for MicroProfile REST properties. See [#104](https://github.com/redhat-developer/vscode-quarkus/issues/104)
 * Add a progress bar / visual clue when loading completion is too long. See [#58](https://github.com/redhat-developer/vscode-quarkus/issues/58)

### Bug Fixes

 * Fix npm vulnerability. See [#175](https://github.com/redhat-developer/vscode-quarkus/pull/175)
 * Overwrite existing project prompt not appearing on Windows. See [#167](https://github.com/redhat-developer/vscode-quarkus/issues/167)
 * User is asked if Quarkus dev task should be terminated even if it has already been terminated. See [#132](https://github.com/redhat-developer/vscode-quarkus/issues/132)
 * Kubernetes properties don't show up. See [#129](https://github.com/redhat-developer/vscode-quarkus/issues/129)

### Others

 * Publish sources [#177](https://github.com/redhat-developer/vscode-quarkus/pull/177). See [#187](https://github.com/redhat-developer/vscode-quarkus/pull/187)
 * Register `quarkus.command.configuration.update` command. See [#152](https://github.com/redhat-developer/vscode-quarkus/pull/152)
 * Remove unused npm dependencies. See [#47](https://github.com/redhat-developer/vscode-quarkus/issues/47)

## 1.2.0 (November 20, 2019)

### Enhancements

 * Support for `@ConfigProperties`. See [quarkus-ls#136](https://github.com/redhat-developer/quarkus-ls/issues/136)
 * CodeAction to fix value property by proposing similar value. See [quarkus-ls#130](https://github.com/redhat-developer/quarkus-ls/issues/130) 
 * CodeAction to add required properties. See [quarkus-ls#111](https://github.com/redhat-developer/quarkus-ls/issues/111)
 * CodeAction to fix unknown property by proposing similar name. See [quarkus-ls#80](https://github.com/redhat-developer/quarkus-ls/issues/80)
 * Provide a better support for Quarkus property value. See [quarkus-ls#69](https://github.com/redhat-developer/quarkus-ls/issues/69)
 * Use language instead of pattern for documentSelector. See [#145](https://github.com/redhat-developer/vscode-quarkus/pull/145)
 * Use context global state to store defaults. See [#140](https://github.com/redhat-developer/vscode-quarkus/pull/140)
 * Add quarkus extension to a Gradle project. See [#112](https://github.com/redhat-developer/vscode-quarkus/issues/112)
 * Create a new Gradle project. See [#108](https://github.com/redhat-developer/vscode-quarkus/issues/108)
 * Generate launch config for Gradle based projects. See [#83](https://github.com/redhat-developer/vscode-quarkus/issues/83)

### Bug Fixes

 * Duplicate completion options in Gradle projects. See [quarkus-ls#137](https://github.com/redhat-developer/quarkus-ls/issues/137)
 * Fix uri comparison. See [#149](https://github.com/redhat-developer/vscode-quarkus/pull/149)
 * Build broken on Jenkins The SUID sandbox helper binary was found, but is not configured correctly. See [#147](https://github.com/redhat-developer/vscode-quarkus/issues/147)
 * Correct step number when adding extensions. See [#139](https://github.com/redhat-developer/vscode-quarkus/pull/139)
 * Change Gradle debug preLaunchTask's command and startPattern. See [#134](https://github.com/redhat-developer/vscode-quarkus/issues/134)

### Others

 * Add disposables to context.subscriptions. See [#150](https://github.com/redhat-developer/vscode-quarkus/pull/150)
 * Add new header parameters when calling code.quarkus.io. See [#130](https://github.com/redhat-developer/vscode-quarkus/issues/130)

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
