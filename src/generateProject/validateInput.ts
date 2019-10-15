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

// For validation functions, return error message if there is an error
// return undefined otherwise

export async function validateGroupId(userInput: string): Promise<string | undefined> {
  // regex referenced from
  // https://github.com/quarkusio/code.quarkus.io/blob/master/src/main/frontend/src/code-quarkus/pickers/info-picker.tsx
  const re = new RegExp('^([a-zA-Z_$][a-zA-Z\\d_$]*\\.)*[a-zA-Z_$][a-zA-Z\\d_$]*$');
  if (!re.test(userInput)) {
    if (!/^[a-zA-Z_$]/.test(userInput)) {
      return 'Invalid groupId: A valid groupId must start with a character from A to z, or one of the following symbols: _$';
    } else if (!/[a-zA-Z\\d_$]$/.test(userInput)) {
      return 'Invalid groupId: A valid groupId must end with a character from A to z, a number, or one of the following symbols: _$';
    }
    return 'Invalid groupId: A valid groupId can only contain characters from A to z, and the following symbols: ._$';
  }
  return undefined;
}

export async function validateArtifactId(userInput: string): Promise<string | undefined> {
  // regex referenced from
  // https://github.com/quarkusio/code.quarkus.io/blob/master/src/main/frontend/src/code-quarkus/pickers/info-picker.tsx
  const re = new RegExp('^[a-z][a-z0-9-._]*$');
  if (!re.test(userInput)) {
    if (!/^[a-z]/.test(userInput)) {
      return 'Invalid artifactId: A valid artifactId must start with a character from a-z';
    }
    return 'Invalid artifactId: A valid artifactId can only contain characters from a-z, numbers, and the following symbols: -._';
  }
  return undefined;
}

export async function validateVersion(userInput: string): Promise<string | undefined> {
  return undefined;
}

export async function validatePackageName(userInput: string): Promise<string | undefined> {
  // regex referenced from
  // https://github.com/quarkusio/code.quarkus.io/blob/master/src/main/frontend/src/code-quarkus/pickers/info-picker.tsx
  const re = new RegExp('^([a-zA-Z_$][a-zA-Z\\d_$]*\\.)*[a-zA-Z_$][a-zA-Z\\d_$]*$');
  if (!re.test(userInput)) {
    if (!/^[a-zA-Z_$]/.test(userInput)) {
      return 'Invalid package name: A valid package name must start with a character from A to z, or one of the following symbols: _$';
    } else if (!/[a-zA-Z\\d_$]$/.test(userInput)) {
      return 'Invalid package name: A valid package name must end with characters from A to z, a number, or the following symbols: _$';
    }
    return 'Invalid package name: A valid package name can only contain characters from A to z and the following symbols: ._$';
  }
  return undefined;
}

export async function validateResourceName(userInput: string): Promise<string | undefined> {
  const re = new RegExp('^[A-Za-z]+[A-Za-z0-9_]*$');
  if (!re.test(userInput)) {
    if (!/^[A-Za-z]/.test(userInput)) {
      return 'Invalid resource name: A valid resource name must start with a character from A to z';
    }
    return 'Invalid resource name: A valid resource name can only contain characters from A to z, numbers, and underscores';
  }
  return undefined;
}