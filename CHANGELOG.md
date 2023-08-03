# Quarkus Tools for Visual Studio Code Changelog

## 1.15.0 (8 August, 2023)

### Enhancements

 * Handle `telemetry/event` coming from the Qute language server. See [#621](https://github.com/redhat-developer/vscode-quarkus/pull/621).
 * Support `completionList/itemDefaults` for Qute parameter declaration. See [quarkus-ls#900](https://github.com/redhat-developer/quarkus-ls/issues/900).

### Bug Fixes

 * Support `?` in parameter `let` section. See [#619](https://github.com/redhat-developer/vscode-quarkus/pull/619), [quarkus-ls#904](https://github.com/redhat-developer/quarkus-ls/issues/904), and [quarkus-ls#906](https://github.com/redhat-developer/quarkus-ls/issues/906).
 * Support Qute optional end tags for sections. See [quarkus-ls#879](https://github.com/redhat-developer/quarkus-ls/issues/879).
 * Deploy to OpenShift fails with 'command `openshift.component.deployRootWorkspaceFolder` not found'. See [#605](https://github.com/redhat-developer/vscode-quarkus/issues/605).
 * Don't report error when `javaType` is null. See [quarkus-ls#908](https://github.com/redhat-developer/quarkus-ls/issues/908).
 * Fix NPE with Qute resolve completion when data is not filled. See [quarkus-ls#903](https://github.com/redhat-developer/quarkus-ls/pull/903).
 * Detected path in plugin are not following renarde paths spec. See [quarkus-ls#892](https://github.com/redhat-developer/quarkus-ls/issues/892).
 * `{name. ?: "Qute"} ` doesn't report a validation error. See [quarkus-ls#884](https://github.com/redhat-developer/quarkus-ls/issues/884).

### Build

 * Bump word-wrap from `1.2.3` to `1.2.4`. See [#618](https://github.com/redhat-developer/vscode-quarkus/pull/618).
 * Bump semver from `5.7.1` to `5.7.2`. See [#616](https://github.com/redhat-developer/vscode-quarkus/pull/616).

### Documentation

 * Add usage data for extension recommendation telemetry collection. See [#617](https://github.com/redhat-developer/vscode-quarkus/pull/617).

## 1.14.0 (15 June, 2023)

### Enhancements

 * Initialize support for Qute Type-safe Message Bundles. See [quarkus-ls#800](https://github.com/redhat-developer/quarkus-ls/issues/800).
 * Improve completion performance in properties files (resolve support, and item defaults). See [eclipse/lsp4mp#389](https://github.com/eclipse/lsp4mp/issues/389).

### Bug Fixes

 * Improve information collected for selected extensions. See [#607](https://github.com/redhat-developer/vscode-quarkus/pull/607).
 * Fix URI Renarde description. See [quarkus-ls#877](https://github.com/redhat-developer/quarkus-ls/pull/877).
 * Missing required "title" property when starting Qute LS leads to NPE. See [quarkus-ls#865](https://github.com/redhat-developer/quarkus-ls/issues/865).
 * `ClassCastException` seen in `textDocument/codelens`. See [quarkus-ls#859](https://github.com/redhat-developer/quarkus-ls/issues/859).
 * `textDocument/inlayHint` fails when classpath is incorrect. See [quarkus-ls#858](https://github.com/redhat-developer/quarkus-ls/issues/858).
 * Code action to insert missing parameters overwrites optional parameter. See [quarkus-ls#856](https://github.com/redhat-developer/quarkus-ls/issues/856).
 * Quick fix to insert all missing attributes for user tag in Qute file adds a `nested-content` attribute. See [quarkus-ls#841](https://github.com/redhat-developer/quarkus-ls/issues/841).
 * NPE during Qute validation when project is not available. See [quarkus-ls#886](https://github.com/redhat-developer/quarkus-ls/issues/886).
 * Ignore `UndefinedObject` + `UndefinedNamespace` problem code action should appear only if LSP client can support update configuration. See [quarkus-ls#862](https://github.com/redhat-developer/quarkus-ls/pull/862).

## 1.13.0 (4 April, 2023)

### Enhancements

 * Quick fixes to resolve unclosed sections in Qute templates. See [redhat-developer/quarkus-ls#821](https://github.com/redhat-developer/quarkus-ls/issues/821).
 * Support for uri/uriabs Qute resolvers from Quarkus Renarde. See [redhat-developer/quarkus-ls#571](https://github.com/redhat-developer/quarkus-ls/issues/571).
 * Workspace symbols and CodeLens for Renarde application REST endpoints. See [redhat-developer/quarkus-ls#777](https://github.com/redhat-developer/quarkus-ls/issues/777).
 * CodeAction to insert expected `<input>` for Renarde `#form` section in Qute template. See [redhat-developer/quarkus-ls#778](https://github.com/redhat-developer/quarkus-ls/issues/778).
 * Show validation errors for all Qute templates in a project (even unopened ones). See [redhat-developer/quarkus-ls#813](https://github.com/redhat-developer/quarkus-ls/issues/813).
 * User tag snippets and completion in Qute templates account for the tag parameters. See [redhat-developer/quarkus-ls#784](https://github.com/redhat-developer/quarkus-ls/issues/784).
 * Validatation and go to definition for user tag parameters in Qute templates. See [redhat-developer/quarkus-ls#788](https://github.com/redhat-developer/quarkus-ls/issues/788), [redhat-developer/quarkus-ls#789](https://github.com/redhat-developer/quarkus-ls/issues/789).
 * CodeAction to insert required user tag parameters in Qute template. See [redhat-developer/quarkus-ls#797](https://github.com/redhat-developer/quarkus-ls/issues/797).
 * Make Java file snippets context-aware. See [redhat-developer/quarkus-ls#782](https://github.com/redhat-developer/quarkus-ls/issues/782).
 * Add support for Qute `#fragment` section. See [redhat-developer/quarkus-ls#768](https://github.com/redhat-developer/quarkus-ls/pull/768), [redhat-developer/quarkus-ls#769](https://github.com/redhat-developer/quarkus-ls/pull/769).
 * When applying the Qute template quick fix to generate a missing class member, generate the member at the end of the class. See [redhat-developer/quarkus-ls#692](https://github.com/redhat-developer/quarkus-ls/pull/692).
 * Support for validation, completion and document link for `#include` and `#insert` sections in Qute templates. See [#438](https://github.com/redhat-developeredhat-developer/quarkus-lsr/quarkus-ls/issues/438).
 * "Show references" CodeLens for `#insert` section in Qute templates. See [#595](https://github.com/redhat-developer/vscode-quarkus/pull/595).
 * Quarkus 3 support. See [redhat-developer/quarkus-ls#779](https://github.com/redhat-developer/quarkus-ls/issues/779).
 * Support surround with section/comments command for Qute templates. See [#581](https://github.com/redhat-developer/vscode-quarkus/issues/581).
 * Provide syntax coloration for #fragment. See [#570](https://github.com/redhat-developer/vscode-quarkus/pull/570).
 * Migrate from `find-java-home` to `jdk-utils`. See [#569](https://github.com/redhat-developer/vscode-quarkus/issues/569).
 * Move to vscode-languageclient 8.0.1 for Qute LS. See [#505](https://github.com/redhat-developer/vscode-quarkus/issues/505).

### Bug Fixes

 * Treat `CompletionStage` and `Uni` objects as their resolved type for validation and completion in Qute templates. See [redhat-developer/quarkus-ls#826](https://github.com/redhat-developer/quarkus-ls/issues/826).
 * `{#if}` sections in Qute templates of the form `{#if !inject:beanName}{/if}` are marked as invalid. See [redhat-developer/quarkus-ls#828](https://github.com/redhat-developer/quarkus-ls/issues/828).
 * Quick fix to generate a `@TemplateExtension` class from a Qute template might place the class in the wrong folder. See [redhat-developer/quarkus-ls#831](https://github.com/redhat-developer/quarkus-ls/issues/831).
 * "Create project" fails when there are no folders and one java file open. See [#559](https://github.com/redhat-developer/vscode-quarkus/issues/559).
 * Fix Quarkus debug configuration after maven wrapper is deleted. See [#572](https://github.com/redhat-developer/vscode-quarkus/issues/572).
 * qute-ls remains running after vscode-quarkus is stopped. See [#576](https://github.com/redhat-developer/vscode-quarkus/issues/576).
 * Prevent infinite loop when going to the definition of a user tag. See [#579](https://github.com/redhat-developer/vscode-quarkus/issues/579).
 * Prevent popups by reading files without triggering `onDidOpenTextDocument`. See [#584](https://github.com/redhat-developer/vscode-quarkus/pull/584).
 * Prevent errors while vscode-java is still starting. See [#586](https://github.com/redhat-developer/vscode-quarkus/issues/586).
 * Incomplete `{#if}` section with operator may generate `ClassCastException`. See [redhat-developer/quarkus-ls#816](https://github.com/redhat-developer/quarkus-ls/issues/816).
 * Use quarkus-ls's Qute parser for syntax validation in order to get consistent diagnostic positions and ranges. See [redhat-developer/quarkus-ls#812](https://github.com/redhat-developer/quarkus-ls/issues/812).
 * Completion in Qute template should generate only start section when an empty end section is found. See [redhat-developer/quarkus-ls#805](https://github.com/redhat-developer/quarkus-ls/issues/805).
 * Qute "Generate missing member" quick fix cannot generate new template extension when `TemplateExtensions` and `TemplateExtensions0` exist. See [redhat-developer/quarkus-ls#712](https://github.com/redhat-developer/quarkus-ls/issues/712).
 * Prevent resolving code actions that run commands. See [#598](https://github.com/redhat-developer/vscode-quarkus/issues/598).

### Build

 * Use `vsce` from the `@vscode` namespace. See [#571](https://github.com/redhat-developer/vscode-quarkus/pull/571).

## 1.12.0 (1 December, 2022)

### Enhancements

 * Provide HTML support for Qute HTML templates. See [#483](https://github.com/redhat-developer/vscode-quarkus/issues/483).
 * Add new snippet for `@QuarkusIntegrationTest`. See [quarkus-ls#754](https://github.com/redhat-developer/quarkus-ls/issues/754).
 * Generic support for Java data model in Qute templates. See [quarkus-ls#503](https://github.com/redhat-developer/quarkus-ls/issues/503).
 * Syntax coloration for operator of `#case`. See [#537](https://github.com/redhat-developer/vscode-quarkus/issues/537).
 * Show documentation on hover of operator for `#case`, `#is`. See [quarkus-ls#716](https://github.com/redhat-developer/quarkus-ls/issues/716).
 * Clickable inlay hint for Java type in Qute templates. See [#533](https://github.com/redhat-developer/vscode-quarkus/pull/533).
 * Validation, completion & definition support for enum in `#switch` section. See [quarkus-ls#689](https://github.com/redhat-developer/quarkus-ls/issues/689), [#690](https://github.com/redhat-developer/quarkus-ls/issues/690), [quarkus-ls#691](https://github.com/redhat-developer/quarkus-ls/issues/691).
  * Display property expression evaluation as inlay hint. See [vscode-microprofile#108](https://github.com/redhat-developer/vscode-microprofile/pull/108).
 * Added Qute code actions for similar text suggestions. See [quarkus-ls#602](https://github.com/redhat-developer/quarkus-ls/issues/602).
 * Code actions to create Java field / getter method / template extension. See [quarkus-ls#536](https://github.com/redhat-developer/quarkus-ls/issues/536), [quarkus-ls#676](https://github.com/redhat-developer/quarkus-ls/issues/676), [quarkus-ls#677](https://github.com/redhat-developer/quarkus-ls/issues/677).
 * Display Javadoc on hover for property/method . See [quarkus-ls#452](https://github.com/redhat-developer/quarkus-ls/issues/452).
 * Diagnostics for mp-reactive-messaging `@Incoming`/`@Outgoing` annotation. See [eclipse/lsp4mp#58](https://github.com/eclipse/lsp4mp/issues/58).

### Performance

 * Use `resolve` for code action in Qute templates. See [quarkus-ls#604](https://github.com/redhat-developer/quarkus-ls/issues/604).
 * Improve code action performance with `CodeAction#data` & `resolveCodeAction`. See [vscode-microprofile#124](https://github.com/redhat-developer/vscode-microprofile/pull/124), [eclipse/lsp4mp#171](https://github.com/eclipse/lsp4mp/issues/171).
 * Activation trigger should be more selective. See [quarkus-ls#497](https://github.com/redhat-developer/vscode-quarkus/issues/497).
 * Detect cyclical class hierarchy when calculating all fields and methods of an object. See [quarkus-ls#725](https://github.com/redhat-developer/quarkus-ls/issues/725).
 * Fix cancel support with `CompletableFuture` compose. See [quarkus-ls#679](https://github.com/redhat-developer/quarkus-ls/pull/679).

### Bug Fixes

 * Duplicate template data when using type safe expressions. See [quarkus-ls#750](https://github.com/redhat-developer/quarkus-ls/issues/750).
 * NPE when validating Qute template where a method is invoked. See [quarkus-ls#748](https://github.com/redhat-developer/quarkus-ls/issues/748).
 * Qute parser does not parse operator parameters with '=' correctly. See [quarkus-ls#742](https://github.com/redhat-developer/quarkus-ls/issues/742).
 * Indent snippet new line if LSP client doesn't support `InsertTextMode#AdjustIndentation`. See [quarkus-ls#727](https://github.com/redhat-developer/quarkus-ls/issues/727).
 * Inlay hints fails when re-opening vscode on a qute template. See [#503](https://github.com/redhat-developer/vscode-quarkus/issues/503).
 * Ignore synthetic methods in Qute templates. See [quarkus-ls#723](https://github.com/redhat-developer/quarkus-ls/issues/723).
 * `ClassCastException` with code action and method part. See [quarkus-ls#717](https://github.com/redhat-developer/quarkus-ls/issues/717).
 * `JavaFileTextDocumentService` doesn't gracefully handle lack of rename support. See [quarkus-ls#700](https://github.com/redhat-developer/quarkus-ls/issues/700).
 * Do not give code actions for stale diagnostics. See [quarkus-ls#694](https://github.com/redhat-developer/quarkus-ls/pull/694).
 * Update snippet activation based on API changes. See [#551](https://github.com/redhat-developer/vscode-quarkus/issues/551).
 * `AbstractQuteTemplateLinkCollector` wrongly identifies template fields. See [quarkus-ls#683](https://github.com/redhat-developer/quarkus-ls/issues/683).
 * Completion proposes invalid `{inject:*}` items. See [quarkus-ls#590](https://github.com/redhat-developer/quarkus-ls/issues/590).
 * Java source code not validated upon start. See [eclipse/lsp4mp#301](https://github.com/eclipse/lsp4mp/issues/301).
 * Improve handling of `@ConfigProperties` for validation. See [eclipse/lsp4mp#304](https://github.com/eclipse/lsp4mp/issues/304).
 * Support for the `config_ordinal` property in `microprofile-config.properties`. See [eclipse/lsp4mp#289](https://github.com/eclipse/lsp4mp/issues/289).
 * Property evaluation should support the environment variable default value notation. See [eclipse/lsp4mp#241](https://github.com/eclipse/lsp4mp/issues/241).
 * Display property value when hovering over a key that isn't defined in the application. See [eclipse/lsp4mp#285](https://github.com/eclipse/lsp4mp/issues/285).
 * REST client code lens only shows up for `GET` annotations. See [eclipse/lsp4mp#94](https://github.com/eclipse/lsp4mp/issues/94).
 * JAXRS code lens URL should always appear above method declaration. See [eclipse/lsp4mp#194](https://github.com/eclipse/lsp4mp/issues/194).
 * Support `microprofile-health` 3.0 and later. See [eclipse/lsp4mp#314](https://github.com/eclipse/lsp4mp/issues/314).
 * `@ConfigProperties` validation should check the annotation's fully qualified name. See [eclipse/lsp4mp#304](https://github.com/eclipse/lsp4mp/issues/304).
 * Fix typo in `mpirc` snippet. See [eclipse/lsp4mp#325](https://github.com/eclipse/lsp4mp/issues/325).
 * Disable JVM logging by default to avoid language server failure. See [#548](https://github.com/redhat-developer/vscode-quarkus/issues/548).

### Build

 * Add support for pre-releases. See [#539](https://github.com/redhat-developer/vscode-quarkus/pull/539).
 * Update node to 14 in CI and CD. See [#534](https://github.com/redhat-developer/vscode-quarkus/pull/534).
 * Update vscode-redhat-telemetry to 0.5.2. See [#558](https://github.com/redhat-developer/vscode-quarkus/pull/558).
 * Update Jenkinsfile to use Java 17. See [#538](https://github.com/redhat-developer/vscode-quarkus/pull/538).

## 1.11.0 (25 July, 2022)

### Enhancements

 * Support for `@TemplateGlobal` annotation. See [quarkus-ls#605](https://github.com/redhat-developer/quarkus-ls/issues/605).
 * Support CodeLens for parameter names (that are Java types) in Qute templates. See [#474](https://github.com/redhat-developer/vscode-quarkus/pull/474).
 * Improve syntax colouration for logical operators and bracket precedence. See [#478](https://github.com/redhat-developer/vscode-quarkus/issues/478), [#490](https://github.com/redhat-developer/vscode-quarkus/issues/490).
 * Improve Qute parameter declaration syntax colouration. See [#488](https://github.com/redhat-developer/vscode-quarkus/issues/488).
 * TextMate grammar support for property expressions. See [#272](https://github.com/redhat-developer/vscode-quarkus/issues/272).
 * Suppress undefined variable errors in certain contexts. See [quarkus-ls#548](https://github.com/redhat-developer/quarkus-ls/issues/548).
 * Add Rename support within Qute templates. See [quarkus-ls#492](https://github.com/redhat-developer/quarkus-ls/issues/492).
 * Support missing attributes for `@TemplateData` / `@RegisterForReflection`. See [quarkus-ls#631](https://github.com/redhat-developer/quarkus-ls/pull/631).
 * Provide `qute.native.enabled` setting. See [quarkus-ls#629](https://github.com/redhat-developer/quarkus-ls/issues/629).
 * Code action to add `??` at the end of the object part for `UndefinedObject`. See [quarkus-ls#613](https://github.com/redhat-developer/quarkus-ls/issues/613).
 * Completion for nested block section. See [quarkus-ls#497](https://github.com/redhat-developer/quarkus-ls/issues/497).
 * Display error when Quarkus application is built for Qute. See [#508](https://github.com/redhat-developer/vscode-quarkus/issues/508).

### Performance

 * Delay revalidation of Java files, Qute template files, and improve cancel checking. See [quarkus-ls#659](https://github.com/redhat-developer/quarkus-ls/pull/659), [quarkus-ls#666](https://github.com/redhat-developer/quarkus-ls/pull/666).
 * Improve memory and performance of Qute language server. See [quarkus-ls#654](https://github.com/redhat-developer/quarkus-ls/issues/654).

### Bug Fixes

 * Linked editing doesn't work if variable is used as a parameter into a section. See [#500](https://github.com/redhat-developer/vscode-quarkus/issues/500).
 * Auto-closing of curly brace fails under certain circumstances. See [#502](https://github.com/redhat-developer/vscode-quarkus/issues/502).
 * Update native mode setting description. See [#501](https://github.com/redhat-developer/vscode-quarkus/pull/501).
 * Changed Qute validation pop-up to appear only when a Qute template is opened. See [#479](https://github.com/redhat-developer/vscode-quarkus/pull/479).
 * Fix NPE with data model template. See [quarkus-ls#664](https://github.com/redhat-developer/quarkus-ls/pull/664).
 * Template validation complains about strings containing spaces. See [quarkus-ls#639](https://github.com/redhat-developer/quarkus-ls/issues/639).
 * Expression indexes are wrong. See [quarkus-ls#627](https://github.com/redhat-developer/quarkus-ls/issues/627).
 * Simplify the resolve signature logic. See [quarkus-ls#652](https://github.com/redhat-developer/quarkus-ls/pull/652).
 * `QuarkusConfigPropertiesProvider` void return type check doesn't work. See [quarkus-ls#650](https://github.com/redhat-developer/quarkus-ls/issues/650).

### Build

 * Migrate from TSLint to ESLint. See [#337](https://github.com/redhat-developer/vscode-quarkus/issues/337).
 * Avoid use of 'install' in favour of 'verify' in packaging scripts. See [#507](https://github.com/redhat-developer/vscode-quarkus/pull/507).
 * Bump EJS from 2.7.4 to 3.1.7. See [#498](https://github.com/redhat-developer/vscode-quarkus/pull/498).
 * Adapt to new version of m2e in JDT-LS. See [quarkus-ls#668](https://github.com/redhat-developer/quarkus-ls/pull/668).
 * Remove unnecessary Gson dependency in pom files. See [quarkus-ls#672](https://github.com/redhat-developer/quarkus-ls/pull/672).
 * Move to LSP4J 0.14.0. See [quarkus-ls#644](https://github.com/redhat-developer/quarkus-ls/issues/644).
 * Update Quarkus LS to use LSP4MP 0.5.0 Snapshots. See [quarkus-ls#621](https://github.com/redhat-developer/quarkus-ls/pull/621).

### Documentation

 * Added list of supported Qute default value resolvers to documentation. See [#521](https://github.com/redhat-developer/vscode-quarkus/pull/521).
 * Add inlay hint documentation. See [#516](https://github.com/redhat-developer/vscode-quarkus/pull/516).
 * Add DCO documentation. See [quarkus-ls#512](https://github.com/redhat-developer/vscode-quarkus/pull/512).

## 1.10.0 (24 March, 2022)

### Enhancements

 * Make the "Deploy to OpenShift" command more discoverable. See [#406](https://github.com/redhat-developer/vscode-quarkus/issues/406).
 * Add language support for Qute templates. See [#178](https://github.com/redhat-developer/vscode-quarkus/issues/178).
 * Create a Qute Language Server. See [quarkus-ls#176](https://github.com/redhat-developer/quarkus-ls/issues/176).
 * Promote experimental Qute validation. See [#438](https://github.com/redhat-developer/vscode-quarkus/issues/438).
 * Create separate setting for configuring language mismatch behaviour for Qute templates. See [#457](https://github.com/redhat-developer/vscode-quarkus/issues/457).
 * Automatically force Qute language for files under `src/main/resources/templates` of Quarkus projects. See [#450](https://github.com/redhat-developer/vscode-quarkus/issues/450).
 * When generating a project without starter code, the Resource name step should be skipped. See [#396](https://github.com/redhat-developer/vscode-quarkus/issues/396).
 * Provide completion for cache name in configuration file. See [quarkus-ls#404](https://github.com/redhat-developer/quarkus-ls/issues/404).
 * Definition & Validation support for `@Scheduled/cron`. See [quarkus-ls#377](https://github.com/redhat-developer/quarkus-ls/issues/377) & [quarkus-ls#378](https://github.com/redhat-developer/quarkus-ls/issues/378).
 * Support for `@ConfigMapping`. See [quarkus-ls#413](https://github.com/redhat-developer/quarkus-ls/issues/413) & [quarkus-ls#424](https://github.com/redhat-developer/quarkus-ls/issues/424).
 * Support `application-${profile}.properties`. See [quarkus-ls#411](https://github.com/redhat-developer/quarkus-ls/pull/411).
 * Support validation and code actions for `@ConfigProperty`. See [eclipse/lsp4mp#90](https://github.com/eclipse/lsp4mp/issues/90), [eclipse/lsp4mp#176](https://github.com/eclipse/lsp4mp/issues/176) and [eclipse/lsp4mp#147](https://github.com/eclipse/lsp4mp/issues/147).
 * Completion for properties defined using `@ConfigProperties`. See [eclipse/lsp4mp#80](https://github.com/eclipse/lsp4mp/issues/80).
 * Support validation for `@Retry` annotation and its member values. See [eclipse/lsp4mp#191](https://github.com/eclipse/lsp4mp/pull/191) and [eclipse/lsp4mp#196](https://github.com/eclipse/lsp4mp/issues/196).
 * Diagnostics for `@Asynchronous`, `@Bulkhead` & `@Timeout` annotations. See [eclipse/lsp4mp#74](https://github.com/eclipse/lsp4mp/issues/74), [eclipse/lsp4mp#184](https://github.com/eclipse/lsp4mp/pull/184), [eclipse/lsp4mp#185](https://github.com/eclipse/lsp4mp/pull/185).
 * Support the `@ApplicationPath` annotation to handle the project URL. See [eclipse/lsp4mp#179](https://github.com/eclipse/lsp4mp/issues/179).
 * Diagnostics for invalid annotation parameter values. See [eclipse/lsp4mp#77](https://github.com/eclipse/lsp4mp/issues/77).
 * Use redhat.java embedded JRE to launch the language servers. See [vscode-microprofile#84](https://github.com/redhat-developer/vscode-microprofile/issues/84), [#461](https://github.com/redhat-developer/vscode-quarkus/pull/461).
 * Add settings to disable CodeLens. See [quarkus-ls#472](https://github.com/redhat-developer/quarkus-ls/issues/472).

### Bug Fixes

 * CodeLens URL does not respect `quarkus.http.root-path property`. See [quarkus-ls#368](https://github.com/redhat-developer/quarkus-ls/issues/368) & [quarkus-ls#414](https://github.com/redhat-developer/quarkus-ls/pull/414).
 * Quarkus API URL should use HTTPS. See [#402](https://github.com/redhat-developer/vscode-quarkus/issues/402).
 * Fix support for HTTP for code.quarkus.io API endpoints. See [#422](https://github.com/redhat-developer/vscode-quarkus/pull/422).
 * Support for default value inside property expression. See [#392](https://github.com/redhat-developer/vscode-quarkus/issues/392).
 * Debugging no-starter code projects fails. See [#389](https://github.com/redhat-developer/vscode-quarkus/issues/389).
 * "Add to current workspace" creates duplicate project. See [#380](https://github.com/redhat-developer/vscode-quarkus/issues/380).
 * Use SafeConstructor for Yaml parser instantation. See [quarkus-ls#527](https://github.com/redhat-developer/quarkus-ls/pull/527).

### Build

 * Tests time out on macOS on GitHub Actions. See [#379](https://github.com/redhat-developer/vscode-quarkus/issues/379).
 * Run vscode-quarkus build & test suite at fixed intervals. See [#429](https://github.com/redhat-developer/vscode-quarkus/pull/429).

### Other

 * Provide more telemetry granularity for the create project event. See [#405](https://github.com/redhat-developer/vscode-quarkus/issues/405).
 * Fix the npm-watch task. See [#417](https://github.com/redhat-developer/vscode-quarkus/pull/417).
 * Add launch configuration for also debugging MicroProfile extension. See [#388](https://github.com/redhat-developer/vscode-quarkus/pull/388).
 * Add documentation for Qute support. See [#427](https://github.com/redhat-developer/vscode-quarkus/issues/427).
 * Add `qute.trace.server` as setting in package.json. See [#425](https://github.com/redhat-developer/vscode-quarkus/issues/425).
 * Mention required NodeJS 14.x in CONTRIBUTING.md. See [#357](https://github.com/redhat-developer/vscode-quarkus/pull/357).

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
