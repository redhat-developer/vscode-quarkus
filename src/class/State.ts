import { DEFAULT_API_URL, 
  DEFAULT_GROUP_ID, 
  DEFAULT_ARTIFACT_ID, 
  DEFAULT_PROJECT_VERSION, 
  DEFAULT_PACKAGE_NAME, 
  DEFAULT_RESOURCE_NAME } from '../constants';
import { workspace, Uri } from 'vscode';
import { QExtension } from '../interface/QExtension';

const userHome = require('user-home');

/**
 * Class representing data required to generate project
 */
export class State {
  apiUrl: string;
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
  targetDir: Uri;

  constructor() {
    this.apiUrl = DEFAULT_API_URL;
    this.groupId = DEFAULT_GROUP_ID;
    this.artifactId = DEFAULT_ARTIFACT_ID;
    this.projectVersion = DEFAULT_PROJECT_VERSION;
    this.packageName = DEFAULT_PACKAGE_NAME;
    this.resourceName = DEFAULT_RESOURCE_NAME;
    this.extensions = [];
    this.targetDir = Uri.parse(userHome);

    const settings = workspace.getConfiguration('').get<SettingsJson>('quarkus.tools.starter');

    if (!settings) {
      return;
    }

    if (settings.apiUrl) {
      this.apiUrl = settings.apiUrl;
    }

    if (!settings.defaults) {
      return;
    }

    if (settings.defaults.groupId) {
      this.groupId = settings.defaults.groupId;
    }
  
    if (settings.defaults.artifactId) {
      this.artifactId = settings.defaults.artifactId;
    }

    if (settings.defaults.projectVersion) {
      this.projectVersion = settings.defaults.projectVersion;
    }

    if (settings.defaults.packageName) {
      this.packageName = settings.defaults.packageName;
    }

    if (settings.defaults.resourceName) {
      this.resourceName = settings.defaults.resourceName;
    }

    if (settings.defaults.extensions) {
      this.extensions = settings.defaults.extensions;
    }
  }

  save() {
    const defaults: Defaults = {
      groupId: this.groupId,
      artifactId: this.artifactId,
      projectVersion: this.projectVersion,
      packageName: this.packageName,
      resourceName: this.resourceName,
      extensions: this.extensions
    };
    workspace.getConfiguration().update('quarkus.tools.starter', {apiUrl: this.apiUrl, defaults: defaults}, true);
  }
}

/**
 * Relevant data from the user's settings.json
 * 
 * ie, contents of  workspace.getConfiguration('quarkus.tools.starter')
 */
interface SettingsJson {
  apiUrl: string;
  defaults: Defaults;
}

interface Defaults {
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
}