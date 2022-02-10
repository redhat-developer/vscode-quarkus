'use strict';

/**
 * VScode client commands.
 */
export namespace QuteClientCommandConstants {

  /**
   * Client command to open Qute template by file Uri.
   */
  export const OPEN_URI = 'qute.command.open.uri';

  /**
   * Client command to generate a Qute template file.
   */
  export const GENERATE_TEMPLATE_FILE = 'qute.command.generate.template.file';

  /**
   * Client command to go to the definition of Java data model (field, method, method invocation of "data" method).
   */
  export const JAVA_DEFINTION = 'qute.command.java.definition';

  /**
   * Client command to update client configuration settings.
   */
  export const COMMAND_CONFIGURATION_UPDATE = 'qute.command.configuration.update';

  /**
   * Toggle on extension for Qute validation setting.
   */
  export const QUTE_VALIDATION_ENABLED_TOGGLE_ON = 'qute.validation.enabled.toggle.on';

  /**
   * Toggle off extension for Qute validation setting.
   */
  export const QUTE_VALIDATION_ENABLED_TOGGLE_OFF = 'qute.validation.enabled.toggle.off';

  /**
  * Client command to execute an XML command on XML Language Server side.
  */
  export const EXECUTE_WORKSPACE_COMMAND = 'qute.workspace.executeCommand';
}

/**
 * Qute Language Server commands.
 */
export namespace QuteServerCommandConstants {

  /**
   * Qute LS Server command to generate template content on the Qute Language Server
   */
  export const GENERATE_TEMPLATE_CONTENT = 'qute.command.generate.template.content';

  /**
 * Check if a Qute template is excluded from validation.
 */
  export const QUTE_VALIDATION_TEMPLATE_STATUS = 'qute.command.validation.template.status';

}

/**
* Qute JDT LS Language Server commands.
*/
export namespace QuteJdtLsServerCommandConstants {

  /**
   * JDT LS command to execute a workspace command registered on JDT LS language server.
   */
  export const JAVA_EXECUTE_WORKPACE_COMMAND = 'java.execute.workspaceCommand';

  /**
   * JDT LS Commands to go to the definition of Java data model (field, method, method invokation of "data" method).
   */
  export const JAVA_DEFINTION = 'qute/template/javaDefinition';

}
