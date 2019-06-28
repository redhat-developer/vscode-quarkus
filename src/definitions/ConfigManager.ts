import { QUARKUS_CONFIG_NAME, DEFAULT_API_URL } from './constants';
import { workspace } from 'vscode';
import { QExtension } from './QExtension';

// import { 
//   DEFAULT_GROUP_ID, 
//   DEFAULT_ARTIFACT_ID, 
//   DEFAULT_PROJECT_VERSION, 
//   DEFAULT_PACKAGE_NAME, 
//   DEFAULT_RESOURCE_NAME } from './constants';

/**
 * This class manages the extension's interaction with 
 * settings.json
 */

export class ConfigManager {

  apiUrl: string;
  defaults: Partial<Defaults>;

  constructor() {
    this.apiUrl = DEFAULT_API_URL;
    this.defaults = {};

    const settings = workspace.getConfiguration('').get<SettingsJson>(QUARKUS_CONFIG_NAME);

    if (!settings) {
      return;
    }

    if (settings.apiUrl) {
      this.apiUrl = settings.apiUrl;
    }

    if (settings.defaults) {
      this.defaults = settings.defaults;
    }
  }

  getSettingsJson(): SettingsJson{
    return {
      apiUrl: this.apiUrl,
      defaults: this.defaults
    } as SettingsJson;
  }

  saveDefaultsToConfig(defaults: Defaults) {
    workspace.getConfiguration().update('quarkus.tools.starter', {apiUrl: this.apiUrl, defaults: defaults}, true);
  }
}

/**
 * Relevant data from the user's settings.json
 * 
 * ie, contents of  workspace.getConfiguration('quarkus.tools.starter')
 */
export interface SettingsJson {
  apiUrl: string;
  defaults: Partial<Defaults>;
}

interface Defaults {
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
}