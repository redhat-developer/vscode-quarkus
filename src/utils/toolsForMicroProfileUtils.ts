/**
 * Copyright 2021 Red Hat, Inc. and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { extensions } from "vscode";

const TOOLS_FOR_MICRO_PROFILE_ID = 'redhat.vscode-microprofile';

/**
 * Returns when lsp4mp is ready
 *
 * @returns when lsp4mp is ready
 */
export async function toolsForMicroProfileReady(): Promise<void> {
  const api: ToolsForMicroProfileAPI = await extensions.getExtension(TOOLS_FOR_MICRO_PROFILE_ID).activate();
  await api.languageServerReady();
}

interface ToolsForMicroProfileAPI {
  languageServerReady(): Promise<void>;
}
