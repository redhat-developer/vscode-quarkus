# Qute Template support

Qute support provides `completions`, `validation`, `hover`, `definition`, `highlight`, `linked editing` in Qute templates.

To benefit from this support, HTML, Text, YAML and JSON files in `**/resources/templates/**` are automatically opened as Qute templates. You can disable that behavior by setting the `quarkus.tools.propertiesLanguageMismatch` property to `ignore`, or `prompt` if you prefer being asked to change the type when opening the file. 

## Parameter declaration support

A `parameter declaration` is used to declare the expected model in a Qute template:

```
{@java.util.List<org.acme.qute.Item> items}
```

The Qute support helps to easily write this declaration with the completion, hover and definition support.

### Completion for Java types

The Qute support provides completion to easily write parameter declaration:

![Completion for Java types](images/QuteTemplateParameterDeclarationCompletion.gif)

### Validate Java type

The Qute support validates Java types:

![Validate Java type](images/QuteTemplateParameterDeclarationValidation.png)

### Jump to Java type definition

You can jump to the proper Java type:

![Jump to Java type definition](images/QuteTemplateParameterDeclarationDefinition.gif)

## Section support

### Completion for Qute section

Qute support provides snippets to quickly generate `Qute` sections. Here is a sample for the `#for` section:

![Completion for Qute section](images/QuteTemplateSectionSnippetCompletion.gif)

### Linked editing

Linked editing is supported, allowing for simultaneous renaming of a parameter expression.

To enable this feature, the setting `editor.linkedEditing` must be set to `true` in your `settings.json`.

![Linked EditingRange](images/QuteTemplateLinkedEditingRange.gif)

## Tag Name Highlighting

When placing the cursor on a Qute section tag, the corresponding opening/closing tag will be highlighted with their nested block:

![Highlight Corresponding Tag](images/QuteTemplateSectionHighlighting.gif)

## Expression support

A Qute expression is declared inside `{|}` or inside a section (ex : `{#for item in |}`).

### Completion for Java data model

Completion is available for allowed Java `fields`, `methods` and `virtual methods` (coming from the Qute core like `orEmpty` or coming from @TemplateExtension):

![Completion for Java data model](images/QuteTemplateCompletionForJavaDataModel.gif)

### Validation for Java data model

Validation highlights unknown Java fields or methods as an error:

![Validation for Java data model](images/QuteTemplateValidationForJavaDataModel.png)

### Hover for Java data model

When you hover over an object, property or method or virtual method (for `@TemplateExtension`), you can see the Java type:

![Hover for Java data model](images/QuteTemplateHoverForJavaDataModel.gif)

When you hover over a [Built-in Resolvers](https://quarkus.io/guides/qute-reference#built-in-resolvers) you can see the relevant documentation, with a link to the [Qute reference guide](https://quarkus.io/guides/qute-reference):

![Hover for Built-in Resolvers](images/QuteTemplateHoverForBuildInResolver.png)

### Jump to Java field, method definition

`Ctrl+Click` on a property or method to jump to the definition of the matching Java field, method or virtual method (for `@TemplateExtension`):

![Definition for Java data model](images/QuteTemplateDefinitionForJavaDataModel.gif)

### Jump to the declared object

A variable can be declared inside a Qute template (with parameter declaration, or #let section) or declared from the Java side.

`Ctrl+Click` on an object part jumps to the declared object in the Qute template (with parameter declaration, or #let section) or to the Java code (method parameter or data method invocation):

![Definition for Java data model](images/QuteTemplateDefinitionForObject.gif)

## User tags support

The [User tags](https://quarkus.io/guides/qute-reference#user_tags) are loaded from `src/main/resources/templates/tags`. The parameters and presence of `{nested-content}` in the user tag declared in the tag template is used to provide support for completion, definition, and validation in the Qute template:

![User tags support](images/QuteUserTag.gif)

## Quarkus integration for Qute

When the template is used in a Quarkus application and it is bound with a Java Template field or a method annotated with `@CheckedTemplate`, you can see the expected model as CodeLens:

![CodeLens for Java data model](images/QuteTemplateCodeLensJavaDataModel.png)

In this case, you don't need to declare parameter declaration to benefit from Qute completion, validation, etc. of the Java data model.

CodeLens are clickable to jump to the proper Java type, method or field.

## Inlay Hint for Qute

Qute support displays the Java type of the parameter names as an inlay hint.

![Inlay Hints for Qute](images/QuteTemplateInlayHint.gif)

All inlay hints can be turned off by disabling `qute.inlayHints.enabled` in settings. To remove inlay hints on section parameter types only, disable `qute.inlayHints.showSectionParameterType` in settings.
