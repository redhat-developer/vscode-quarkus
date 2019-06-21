import { workspace, Uri } from 'vscode';
import { QExtension } from '../interface/QExtension';
import { State } from '../interface/State';

/**
 * Class representing data required to generate project
 */
export class Config {
  apiUrl: undefined|string;
  groupId: undefined|string;
  artifactId: undefined|string;
  projectVersion: undefined|string;
  packageName: undefined|string;
  resourceName: undefined|string;
  extensions: QExtension[];
  targetDir: undefined|Uri;

  constructor() {
    this.extensions = [];
    const settings = workspace.getConfiguration('').get<SettingsJson>('quarkus.tools.starter');

    if (settings) {
      this.apiUrl = settings.apiUrl;
    }

    if (settings && settings.defaults) {
      this.groupId = settings.defaults.groupId;
      this.artifactId = settings.defaults.artifactId;
      this.projectVersion = settings.defaults.projectVersion;
      this.packageName = settings.defaults.packageName;
      this.resourceName = settings.defaults.resourceName;
      this.extensions = settings.defaults.extensions;
    }
  }

  /**
   * Sets the parameters to this Config object's this.defaults, then saves to the user's settings.json
   */
  set(state: State) {
    this.groupId = state.groupId;
    this.artifactId = state.artifactId;
    this.projectVersion = state.projectVersion;
    this.packageName = state.packageName;
    this.resourceName = state.resourceName;
    this.extensions = state.extensions;
    this.targetDir = state.targetDir;

    const defaults: Defaults = {
      groupId: this.groupId,
      artifactId: this.artifactId,
      projectVersion: this.projectVersion,
      packageName: this.packageName,
      resourceName: this.resourceName,
      extensions: this.extensions
    }

    workspace.getConfiguration().update('quarkus.tools.starter', {apiUrl: this.apiUrl, defaults: defaults}, true);
  }
}

/**
 * Relevant data from the user's settings.json
 * 
 * ie, contents of  workspace.getConfiguration('quarkus.tools.starter')
 */
interface SettingsJson {
  apiUrl: undefined|string;
  defaults: Defaults;
}

interface Defaults {
  groupId: undefined|string;
  artifactId: undefined|string;
  projectVersion: undefined|string;
  packageName: undefined|string;
  resourceName: undefined|string;
  extensions: QExtension[];
}