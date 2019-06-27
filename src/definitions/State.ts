// import { DEFAULT_API_URL, 
//   DEFAULT_GROUP_ID, 
//   DEFAULT_ARTIFACT_ID, 
//   DEFAULT_PROJECT_VERSION, 
//   DEFAULT_PACKAGE_NAME, 
//   DEFAULT_RESOURCE_NAME } from './constants';
import { Uri } from 'vscode';
import { QExtension } from './QExtension';

// const userHome = require('user-home');

/**
 * Class representing data required to generate project
 */
export interface State {
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
  targetDir: Uri;
}

// /**
//  * Relevant data from the user's settings.json
//  * 
//  * ie, contents of  workspace.getConfiguration('quarkus.tools.starter')
//  */
// interface SettingsJson {
//   apiUrl: string;
//   defaults: Defaults;
// }

// interface Defaults {
//   groupId: string;
//   artifactId: string;
//   projectVersion: string;
//   packageName: string;
//   resourceName: string;
//   extensions: QExtension[];
// }