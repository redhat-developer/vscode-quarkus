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
  export const QUARKUS_WELCOME = 'quarkusTools.welcome';
}

// Constants related to project generation
export const enum BuildToolName {
  Maven = 'Maven',
  Gradle = 'Gradle'
}

export const DEFAULT_API_URL: string = 'https://code.quarkus.io/api';
export const DEFAULT_BUILD_TOOL: BuildToolName = BuildToolName.Maven;
export const DEFAULT_GROUP_ID: string = 'org.acme';
export const DEFAULT_ARTIFACT_ID: string = 'quarkus-getting-started';
export const DEFAULT_PROJECT_VERSION: string = '1.0.0-SNAPSHOT';
export const DEFAULT_PACKAGE_NAME: string = DEFAULT_GROUP_ID;
export const DEFAULT_RESOURCE_NAME: string = 'GreetingResource';
export const INPUT_TITLE: string = 'Quarkus Tools';

// Quarkus extension default groupId
export const QUARKUS_GROUP_ID: string = 'io.quarkus';
