# Quarkus Tools for Visual Studio Code Changelog

## 1.9.0 (28 July, 2021)

### Enhancements

 * Drop dependency on vscode-commons by updating `@redhat-developer/vscode-redhat-telemetry` to 0.2.0. See [#365](https://github.com/redhat-developer/vscode-quarkus/issues/365).
 * Add a command to deploy a Quarkus app to OpenShift using OpenShift Connector. See [#313](https://github.com/redhat-developer/vscode-quarkus/issues/313).
 * Emit telemetry events for command executions. See [#344](https://github.com/redhat-developer/vscode-quarkus/issues/344).
 * Add a command to build a binary of a Quarkus app. See [#341](https://github.com/redhat-developer/vscode-quarkus/pull/341).
 * RESTEasy JAX-RS is no longer added by default in the project generator wizard. See [#322](https://github.com/redhat-developer/vscode-quarkus/issues/322).
 * Add a step to the project generator to specify if example code should be generated. See [#301](https://github.com/redhat-developer/vscode-quarkus/issues/301).

### Bug Fixes

 * Fixed debugger start-up failure in Quarkus projects that contain a `node_modules` folder. See [#339](https://github.com/redhat-developer/vscode-quarkus/issues/339).

### Build

 * Consistently reference the main npm registry in `package-lock.json`. See [#355](https://github.com/redhat-developer/vscode-quarkus/pull/355).
 * Fix the UI tests. See [#351](https://github.com/redhat-developer/vscode-quarkus/issues/351).
 * Migrate CI to GitHub Actions. See [#375](https://github.com/redhat-developer/vscode-quarkus/issues/375).

## 1.8.0 (8 April, 2021)

### Enhancements

 * Hover support for `@Scheduled/cron`. See [redhat-developer/quarkus-ls#376](https://github.com/redhat-developer/quarkus-ls/issues/376).
 * Startup and shutdown telemetry. See [#342](https://github.com/redhat-developer/vscode-quarkus/issues/342).
 * `quarkus.hibernate-orm.database.generation` values should be enumerated. See [#317](https://github.com/redhat-developer/vscode-quarkus/issues/317).
 * Extension status is not visible when creating a project. See [#219](https://github.com/redhat-developer/vscode-quarkus/issues/219).

### Bug Fixes

 * Schedule properties are shown as unknown. See [#319](https://github.com/redhat-developer/vscode-quarkus/issues/319).
 * REST endpoint codelenses should be computed from `%dev.quarkus.http.port` by default. See [#311](https://github.com/redhat-developer/vscode-quarkus/issues/311).
 * Wrong/Missing Log Levels in application.properties. See [#315](https://github.com/redhat-developer/vscode-quarkus/issues/315).
 * `mp.messaging` properties now work for Emitters. See [redhat-developer/quarkus-ls#369](https://github.com/redhat-developer/quarkus-ls/issues/369).
 * Move "show welcome page" checkbox to the top of the welcome page. See [#328](https://github.com/redhat-developer/vscode-quarkus/issues/328).
 * Set the default directory to the current workspace folder when selecting a location for generating a project. See [#310](https://github.com/redhat-developer/vscode-quarkus/pull/310).

## 1.7.0 (September 21, 2020)

Since `1.7.0`, vscode-quarkus becomes an extension of [vscode-microprofile](https://github.com/redhat-developer/vscode-microprofile), see [vscode-microprofile CHANGELOG](https://github.com/redhat-developer/vscode-microprofile/blob/master/CHANGELOG.md#010-september-21-2020).

[vscode-microprofile](https://github.com/redhat-developer/vscode-microprofile) will be automatically installed alongside vscode-quarkus.

### Enhancements

 * Notification when the `quarkus.tools.propertiesLanguageMismatch` setting is set to `forceQuarkus`. See [#285](https://github.com/redhat-developer/vscode-quarkus/issues/285).
 * Spawn vscode-microprofile extension out of vscode-quarkus . See [#248](https://github.com/redhat-developer/vscode-quarkus/issues/248).

### Bug Fixes

 * Debug quarkus project command doesn't appear on Quarkus projects after going from lightweight mode to standard mode. See [#299](https://github.com/redhat-developer/vscode-quarkus/issues/299).
 * Generating a Gradle project without adding any extra extensions adds duplicate entry in build.gradle. See [#298](https://github.com/redhat-developer/vscode-quarkus/issues/298).
 * Investigate why `quarkus-properties` appears twice when registering `textDocument/rangeFormatting`. See [#296](https://github.com/redhat-developer/vscode-quarkus/issues/296).
 * Textmate grammar support for indexed properties . See [#283](https://github.com/redhat-developer/vscode-quarkus/issues/283).
 * Quarkus container-image incorrect default value highlighting. See [quarkus-ls#351](https://github.com/redhat-developer/quarkus-ls/issues/351).

### Build

 * Contribute lsp4mp.ls jars. See [#290](https://github.com/redhat-developer/vscode-quarkus/issues/290).
 * Build quarkus jdt extension. See [#276](https://github.com/redhat-developer/vscode-quarkus/pull/276).

### Other

 * Define Quarkus document selector and TextMate grammar. See [#294](https://github.com/redhat-developer/vscode-quarkus/pull/294).
 * Fix links in README. See [#287](https://github.com/redhat-developer/vscode-quarkus/pull/287).
 * Remove jax-rs snippets. See [quarkus-ls#362](https://github.com/redhat-developer/quarkus-ls/pull/362).

## 1.6.0 (July 9, 2020)

### Enhancements

 * Add welcome page icon. See [#260](https://github.com/redhat-developer/vscode-quarkus/issues/260).
 * Update Java version on the welcome page. See [#258](https://github.com/redhat-developer/vscode-quarkus/issues/258).
 * Mitigate vscode-quarkus & vscode-spring-boot competing for application.properties. See [#254](https://github.com/redhat-developer/vscode-quarkus/issues/254).
 * Display project name when adding extensions. See [#215](https://github.com/redhat-developer/vscode-quarkus/issues/215).

### Bug fixes

 * Fix welcome page typos. See [#259](https://github.com/redhat-developer/vscode-quarkus/pull/259).
 * Quarkus datasource snippet creates an invalid prop. for 1.5. See [#255](https://github.com/redhat-developer/vscode-quarkus/issues/255).
 * vscode-quarkus should not be a Java formatter. See [#166](https://github.com/redhat-developer/vscode-quarkus/issues/166).
 * Missing support for container-image properties. See [LS#315](https://github.com/redhat-developer/quarkus-ls/issues/315).
 * Filter properties snippet with properties instead of dependency. See [LS#312](https://github.com/redhat-developer/quarkus-ls/issues/312).

### Build

 * Publish releases to open-vsx.org. See [#278](https://github.com/redhat-developer/vscode-quarkus/pull/278).
 * Provide an extension directory when running UI tests. See [#267](https://github.com/redhat-developer/vscode-quarkus/issues/267).
 * Migrate vscode-extension-tester to 3.x. See [#266](https://github.com/redhat-developer/vscode-quarkus/issues/266).
 * Adjusting test after naming update of 'Camel Quarkus Core' to 'Camel'. See [#263](https://github.com/redhat-developer/vscode-quarkus/pull/263).
 * Use RHEL 8 instead for RHEL 7 to workaround bug in VS Code 1.46.0. See [#261](https://github.com/redhat-developer/vscode-quarkus/pull/261).

## 1.5.0 (April 30, 2020)

### Enhancements

 * Code snippets for MicroProfile fault tolerance annotations. See [LS#307](https://github.com/redhat-developer/quarkus-ls/issues/307)
 * Support for MicroProfile Context Propagation properties. See [LS#242](https://github.com/redhat-developer/quarkus-ls/issues/242)
 * Update Quarkus datasource snippet. See [#227](https://github.com/redhat-developer/vscode-quarkus/issues/227)

### Bug fixes

 * Fix terminal not appearing when adding extensions with the Add Extensions command. See [#252](https://github.com/redhat-developer/vscode-quarkus/pull/252)
 * `quarkus.banner.enabled` marked as error. See [#249](https://github.com/redhat-developer/vscode-quarkus/issues/249)
 * Completion in non-Quarkus and non-MicroProfile project causes errors. See [#247](https://github.com/redhat-developer/vscode-quarkus/issues/247)

## 1.4.0 (April 15, 2020)

### Enhancements

 * Show artifactId in the extensions picker. See [#197](https://github.com/redhat-developer/vscode-quarkus/issues/197)
 * Add support for MicroProfile Fault Tolerance. See [#174](https://github.com/redhat-developer/vscode-quarkus/issues/174)
 * Manage client snippet on server side. See [#119](https://github.com/redhat-developer/vscode-quarkus/issues/119)
 * Determine if current project is a Quarkus project before adding Quarkus extensions. See [#45](https://github.com/redhat-developer/vscode-quarkus/issues/45)
 * Hover support for `@ConfigProperty` name bounded to method parameters. See [LS#286](https://github.com/redhat-developer/quarkus-ls/pull/286)
 * Filter for Java (server) snippets. See [LS#265](https://github.com/redhat-developer/quarkus-ls/issues/265)
 * Support for `java.math.BigDecimal` values. See [LS#261](https://github.com/redhat-developer/quarkus-ls/issues/261)
 * Support for MicroProfile RestClient CodeAction. See [LS#255](https://github.com/redhat-developer/quarkus-ls/issues/255)
 * Manage client snippet on server side. See [LS#251](https://github.com/redhat-developer/quarkus-ls/pull/251)
 * Code complete snippets for Open API Annotations. See [LS#246](https://github.com/redhat-developer/quarkus-ls/issues/246)
 * Support for MicroProfile LRA properties. See [LS#243](https://github.com/redhat-developer/quarkus-ls/issues/243)
 * Support for MicroProfile Metrics properties. See [LS#241](https://github.com/redhat-developer/quarkus-ls/issues/241)
 * Support for MicroProfile OpenTracing properties. See [LS#240](https://github.com/redhat-developer/quarkus-ls/issues/240)
 * CodeAction to Generate Open API Annotations. See [LS#239](https://github.com/redhat-developer/quarkus-ls/issues/239)
 * Support for MicroProfile Health CodeAction. See [LS#236](https://github.com/redhat-developer/quarkus-ls/issues/236)
 * Provide codeLens participant. See [LS#232](https://github.com/redhat-developer/quarkus-ls/pull/232)
 * Provide hover participant. See [LS#231](https://github.com/redhat-developer/quarkus-ls/pull/231)
 * Support for MicroProfile RestClient/Health Diagnostics. See [LS#217](https://github.com/redhat-developer/quarkus-ls/issues/217)
 * Support for MicroProfile Open API properties. See [LS#216](https://github.com/redhat-developer/quarkus-ls/issues/216)

### Bug Fixes

 * Bad performance when working with non Quarkus/MP projects. See [#240](https://github.com/redhat-developer/vscode-quarkus/issues/240)
 * Excluding unknown properties from validation no longer work. See [#237](https://github.com/redhat-developer/vscode-quarkus/issues/237)
 * Improve application.properties TextMate grammar. See [#233](https://github.com/redhat-developer/vscode-quarkus/issues/233)
 * Update application.properties TextMate grammar for multi-line properties values. See [#229](https://github.com/redhat-developer/vscode-quarkus/issues/229)
 * Qute Syntax coloration problem with quote. See [#221](https://github.com/redhat-developer/vscode-quarkus/issues/221)
 * When pasting, the comments gets duplicated when "editor.formatOnPaste":true. See [#220](https://github.com/redhat-developer/vscode-quarkus/issues/220)
 * Cannot select which project to debug when multiple workspace folders are open. See [#74](https://github.com/redhat-developer/vscode-quarkus/issues/74)
 * Remove duplicate Quarkus outputs in the "Tasks" dropdown. See [#17](https://github.com/redhat-developer/vscode-quarkus/issues/17)
 * Duplicate static properties after saving Java files. See [LS#301](https://github.com/redhat-developer/quarkus-ls/issues/301)
 * Hide OpenAPI source action if it is not applicable. See [LS#280](https://github.com/redhat-developer/quarkus-ls/issues/280)
 * Parse PropertyValue when spanning multiple lines. See [LS#254](https://github.com/redhat-developer/quarkus-ls/pull/254)
 * Classpath changed sends too many microprofile/propertiesChanged notifications. See [LS#235](https://github.com/redhat-developer/quarkus-ls/pull/235)
 * Empty completion after an error from microprofile/projectInfo. See [LS#228](https://github.com/redhat-developer/quarkus-ls/issues/228)

### Build

* Fix for vulnerable minimist dependency. See [#238](https://github.com/redhat-developer/vscode-quarkus/pull/238)

### Others

 * Update contributing guide. See [#208](https://github.com/redhat-developer/vscode-quarkus/pull/208)

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
 * Add a progress bar/visual clue when loading completion is too long. See [#58](https://github.com/redhat-developer/vscode-quarkus/issues/58)

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
