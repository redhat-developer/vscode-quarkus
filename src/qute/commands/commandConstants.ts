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
   * Client command to go to the definition of Java data model (field, method, method invokation of "data" method).
   */
  export const JAVA_DEFINTION = 'qute.command.java.definition';
}

/**
 * Qute Language Server commands.
 */
export namespace QuteServerCommandConstants {

  /**
   * Qute LS Server command to generate template content on the Qute Language Server
   */
  export const GENERATE_TEMPLATE_CONTENT = 'qute.command.generate.template.content';

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
