// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { Uri, workspace } from "vscode";

export namespace Settings {

    export namespace External {
        export function javaHome(): string | undefined {
            return workspace.getConfiguration("java").get<string>("home");
        }
    }

    export namespace Terminal {
        export function useJavaHome(): boolean {
            return !!_getMavenSection("terminal.useJavaHome");
        }

        export function customEnv(): {
            environmentVariable: string;
            value: string;
        }[] | undefined {
            return _getMavenSection("terminal.customEnv");
        }
    }

    function _getMavenSection<T>(section: string, resourceOrFilepath?: Uri | string): T | undefined {
        let resource: Uri | undefined;
        if (typeof resourceOrFilepath === "string") {
            resource = Uri.file(resourceOrFilepath);
        } else if (resourceOrFilepath instanceof Uri) {
            resource = resourceOrFilepath;
        }
        return workspace.getConfiguration("maven", resource).get<T>(section);
    }

    export function getEnvironment(): { [key: string]: string } {
        const customEnv: any = _getJavaHomeEnvIfAvailable();
        type EnvironmentSetting = {
            environmentVariable: string;
            value: string;
        };
        const environmentSettings: EnvironmentSetting[] | undefined = Terminal.customEnv();
        if (environmentSettings) {
            environmentSettings.forEach((s: EnvironmentSetting) => {
                customEnv[s.environmentVariable] = s.value;
            });
        }
        return customEnv;
    }

    function _getJavaHomeEnvIfAvailable(): {} {
        // Look for the java.home setting from the redhat.java extension.  We can reuse it
        // if it exists to avoid making the user configure it in two places.
        const useJavaHome: boolean = Terminal.useJavaHome();
        const javaHome: string | undefined = External.javaHome();
        if (useJavaHome && javaHome) {
            return { JAVA_HOME: javaHome };
        } else {
            return {};
        }
    }
}