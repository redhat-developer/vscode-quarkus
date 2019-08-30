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

// Quarkus language server request and notifications
export const QUARKUS_PROJECT_REQUEST = 'quarkus/projectInfo';

// Quarkus jdt.ls extension commands
export const JDTLS_PROJECT_INFO_COMMAND = 'quarkus.java.projectInfo';

// Constants related to project generation
export const DEFAULT_API_URL: string = 'https://code.quarkus.io/api';
export const DEFAULT_GROUP_ID: string = 'org.my.group';
export const DEFAULT_ARTIFACT_ID: string = 'MyQuarkusProject';
export const DEFAULT_PROJECT_VERSION: string = '1.0-SNAPSHOT';
export const DEFAULT_PACKAGE_NAME: string = 'PackageName';
export const DEFAULT_RESOURCE_NAME: string = 'ResourceName';
export const INPUT_TITLE: string = 'Quarkus Tools';

// Quarkus extension default groupId
export const QUARKUS_GROUP_ID: string = 'io.quarkus';