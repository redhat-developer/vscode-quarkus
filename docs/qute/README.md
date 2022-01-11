# Qute support

[Qute](https://quarkus.io/guides/qute-reference) is a template engine used in Quarkus applications.

[vscode-quarkus](https://github.com/redhat-developer/vscode-quarkus) provides `Qute` support in:

 * [templates files](TemplateSupport.md#template) : completion, validation etc. for Qute template.
 * [Java files](JavaSupport.md#java-file) : completion, validation etc. for Qute integration within Quarkus applications.

 ## Settings
 
 * `qute.trace.server`: Trace the communication between VS Code and the Qute language server in the Output view. Default is `off`.
 * `quarkus.tools.qute.validation.enabled` : Enable/disable all Qute validation. Default is `true`.