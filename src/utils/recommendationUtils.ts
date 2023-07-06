/**
 * Copyright 2023 Red Hat, Inc. and others.

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
import {
  IRecommendationService,
  RecommendationCore,
} from "@redhat-developer/vscode-extension-proposals";
import { TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";
import { ExtensionContext } from "vscode";

const OPENSHIFT_TOOLKIT_ID = "redhat.vscode-openshift-connector";

let recommendationService: IRecommendationService;

/**
 * Initialize the recommendation service
 *
 * @param context the extension context
 */
export function initRecommendationService(context: ExtensionContext, telemetryService: TelemetryService) {
  if (!recommendationService) {
    recommendationService = RecommendationCore.getService(context, telemetryService);
    const recommendations = [
      recommendationService.create(
        OPENSHIFT_TOOLKIT_ID,
        "OpenShift Toolkit",
        "Debug your Quarkus application on an OpenShift or Kubernetes cluster from within VS Code",
        false
      ),
    ];
    recommendationService.register(recommendations);
  }
}

/**
 * Show a recommendation message for OpenShift Toolkit.
 *
 * @throws Error if the recommendation service has not been initialized
 */
export function recommendOpenShiftToolkit() {
  if (!recommendationService) {
    throw new Error("recommendation service has not been initialized");
  }
  void recommendationService.show("redhat.vscode-openshift-connector");
}
