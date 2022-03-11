# Qute support

[Qute](https://quarkus.io/guides/qute-reference) is a template engine used in Quarkus applications.

[vscode-quarkus](https://github.com/redhat-developer/vscode-quarkus) provides `Qute` support in:

 * [templates files](TemplateSupport.md#template) : completion, validation etc. for Qute template.
 * [Java files](JavaSupport.md#java-file) : completion, validation etc. for Qute integration within Quarkus applications.

 ## Settings

 * `qute.trace.server`: Trace the communication between VS Code and the Qute language server in the Output view. Default is `off`.
 * `qute.codeLens.enabled`: Enable/disable Qute CodeLens. Default is `true`.
 * `qute.inlayHint.enabled`: Enable/disable Inlay Hint. Default is `true`.
 * `qute.inlayHint.showSectionParameterType`: Show section parameter type. Default is `true`.
 * `qute.inlayHint.showMethodParameterType`: Show method parameter type. Default is `true`. 
 * `qute.validation.enabled`: Enable/disable all Qute validation. Default is `false`.
 * `qute.validation.excluded`: Disable Qute validation for the given file name patterns.\n\nExample:\n```\n[\n \"**/*items.qute.*\"\n]```.
 * `qute.validation.undefinedObject.severity`: Validation severity for undefined object in Qute template files. Default is `warning`.
 * `qute.validation.undefinedNamespace.severity`: Validation severity for undefined namespace in Qute template files. Default is `warning`.
