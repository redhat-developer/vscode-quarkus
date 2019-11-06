'use strict';

import { workspace, Uri } from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const expandHomeDir = require('expand-home-dir');
const findJavaHome = require('find-java-home');
const isWindows = process.platform.indexOf('win') === 0;
const JAVA_FILENAME = 'java' + (isWindows?'.exe': '');

export interface RequirementsData {
    java_home: string;
    java_version: number;
}

/**
 * Resolves the requirements needed to run the extension.
 * Returns a promise that will resolve to a RequirementsData if
 * all requirements are resolved, it will reject with ErrorData if
 * if any of the requirements fails to resolve.
 *
 */
export async function resolveRequirements(): Promise<RequirementsData> {
    const javaHome = await checkJavaRuntime();
    const javaVersion = await checkJavaVersion(javaHome);
    return Promise.resolve({ java_home: javaHome, java_version: javaVersion});
}

function checkJavaRuntime(): Promise<string> {
    return new Promise((resolve, reject) => {
        let source: string;
        let javaHome: string|undefined = readJavaHomeConfig();

        if (javaHome) {
            source = 'The java.home variable defined in VS Code settings';
        } else {
            javaHome = process.env['JDK_HOME'];
            if (javaHome) {
                source = 'The JDK_HOME environment variable';
            } else {
                javaHome = process.env['JAVA_HOME'];
                source = 'The JAVA_HOME environment variable';
            }
        }

        if (javaHome) {
            javaHome = expandHomeDir(javaHome);
            if (!fs.existsSync(javaHome)) {
                openJDKDownload(reject, source+' points to a missing folder');
            } else if (!fs.existsSync(path.resolve(javaHome as string, 'bin', JAVA_FILENAME))) {
                openJDKDownload(reject, source+ ' does not point to a Java runtime.');
            }
            return resolve(javaHome);
        }
        // No settings, let's try to detect as last resort.
        findJavaHome({ allowJre: true }, (err: any, home: any) => {
            if (err) {
                openJDKDownload(reject, 'Java runtime could not be located.');
            }
            else {
                resolve(home);
            }
        });
    });
}

function readJavaHomeConfig(): string|undefined {
    const config = workspace.getConfiguration();
    return config.get<string>('java.home');
}

function checkJavaVersion(javaHome: string): Promise<number> {
    return new Promise((resolve, reject) => {
        cp.execFile(javaHome + '/bin/java', ['-version'], {}, (error, stdout, stderr) => {
            const javaVersion = parseMajorVersion(stderr);
            if (javaVersion < 8) {
                openJDKDownload(reject, 'Java 8 or more recent is required to run. Please download and install a recent JDK.');
            }
            else {
                resolve(javaVersion);
            }
        });
    });
}

export function parseMajorVersion(content: string): number {
    let regexp = /version "(.*)"/g;
    let match = regexp.exec(content);
    if (!match) {
        return 0;
    }
    let version = match[1];
    // Ignore '1.' prefix for legacy Java versions
    if (version.startsWith('1.')) {
        version = version.substring(2);
    }

    // look into the interesting bits now
    regexp = /\d+/g;
    match = regexp.exec(version);
    let javaVersion = 0;
    if (match) {
        javaVersion = parseInt(match[0]);
    }
    return javaVersion;
}

function openJDKDownload(reject: any, cause: string) {
    let jdkUrl = 'https://developers.redhat.com/products/openjdk/download/?sc_cid=701f2000000RWTnAAO';
    if (process.platform === 'darwin') {
        jdkUrl = 'http://www.oracle.com/technetwork/java/javase/downloads/index.html';
    }
    reject({
        message: cause,
        label: 'Get the Java Development Kit',
        openUrl: Uri.parse(jdkUrl),
        replaceClose: false
    });
}
