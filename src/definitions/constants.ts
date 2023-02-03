/**
 * Copyright 2019 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// VSCode Quarkus Tools commands
export namespace VSCodeCommands {
  export const CREATE_PROJECT = 'quarkusTools.createProject';
  export const ADD_EXTENSIONS = 'quarkusTools.addExtension';
  export const DEBUG_QUARKUS_PROJECT = 'quarkusTools.debugQuarkusProject';
  export const BUILD_BINARY = 'quarkusTools.buildBinary';
  export const QUARKUS_WELCOME = 'quarkusTools.welcome';
  export const DEPLOY_TO_OPENSHIFT = 'quarkusTools.deployToOpenShift';

  export const SHORT_SUFFIX = '.short';
}

export namespace JavaVSCodeCommands {
  export const WORKSPACE_LABELS_COMMAND_ID = 'microprofile/java/workspaceLabels';
  export const PROJECT_LABELS_COMMAND_ID = 'microprofile/java/projectLabels';
}

// Constants related to project generation
export const enum BuildToolName {
  Maven = 'Maven',
  Gradle = 'Gradle'
}

export const VSCODE_QUARKUS_EXTENSION_NAME = "redhat.vscode-quarkus";
export const DEFAULT_API_URL = 'https://code.quarkus.io/api';
export const DEFAULT_BUILD_TOOL: BuildToolName = BuildToolName.Maven;
export const DEFAULT_GROUP_ID = 'org.acme';
export const DEFAULT_ARTIFACT_ID = 'quarkus-getting-started';
export const DEFAULT_PROJECT_VERSION = '1.0.0-SNAPSHOT';
export const DEFAULT_PACKAGE_NAME: string = DEFAULT_GROUP_ID;
export const DEFAULT_RESOURCE_NAME = 'GreetingResource';
export const INPUT_TITLE = 'Quarkus Tools';

// Quarkus extension default groupId
export const QUARKUS_GROUP_ID = 'io.quarkus';
