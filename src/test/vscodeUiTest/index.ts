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
import { ExTester, SetupOptions } from 'datho7561-vscode-extension-tester';
import { RunOptions } from 'datho7561-vscode-extension-tester/out/util/codeUtil';
import { FAILSAFE_SCHEMA } from 'js-yaml';

const setupOptions: SetupOptions = {
  installDependencies: true,
  useYarn: false,
};
const runOptions: RunOptions = {
  settings: "./settings.json"
};

const testExtensionsDir: string = 'out/test/vscodeUiTest/extensions';
const tester: ExTester = new ExTester(undefined, undefined, testExtensionsDir);
tester.setupAndRunTests(testExtensionsDir, 'latest', setupOptions, runOptions);
