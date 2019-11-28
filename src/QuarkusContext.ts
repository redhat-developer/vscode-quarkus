import { ExtensionContext } from 'vscode';
import {
  BuildToolName,
  DEFAULT_BUILD_TOOL,
  DEFAULT_GROUP_ID,
  DEFAULT_ARTIFACT_ID,
  DEFAULT_PROJECT_VERSION,
  DEFAULT_PACKAGE_NAME,
  DEFAULT_RESOURCE_NAME
} from './definitions/constants';

export namespace QuarkusContext {
  const BUILD_TOOL = 'quarkus.tools.starter.defaults.buildTool';
  const GROUP_ID = 'quarkus.tools.starter.defaults.groupId';
  const ARTIFACT_ID = 'quarkus.tools.starter.defaults.artifactId';
  const PROJECT_VERSION = 'quarkus.tools.starter.defaults.projectVersion';
  const PACKAGE_NAME = 'quarkus.tools.starter.defaults.packageName';
  const RESOURCE_NAME = 'quarkus.tools.starter.defaults.resourceName';
  const EXTENSIONS = 'quarkus.tools.starter.defaults.extensions';

  let context: ExtensionContext | undefined = undefined;

  export function setContext(extensionContext: ExtensionContext) {
    context = extensionContext;
  }

  export function getExtensionContext(): ExtensionContext {
    checkContext();
    return context;
  }

  export function getDefaultBuildTool(): BuildToolName {
    checkContext();
    return context.globalState.get<BuildToolName>(BUILD_TOOL, DEFAULT_BUILD_TOOL);
  }

  export function getDefaultGroupId(): string {
    checkContext();
    return context.globalState.get<string>(GROUP_ID, DEFAULT_GROUP_ID);
  }

  export function getDefaultArtifactId(): string {
    checkContext();
    return context.globalState.get<string>(ARTIFACT_ID, DEFAULT_ARTIFACT_ID);
  }

  export function getDefaultProjectVersion(): string {
    checkContext();
    return context.globalState.get<string>(PROJECT_VERSION, DEFAULT_PROJECT_VERSION);
  }

  export function getDefaultPackageName(): string {
    checkContext();
    return context.globalState.get<string>(PACKAGE_NAME, DEFAULT_PACKAGE_NAME);
  }

  export function getDefaultResourceName(): string {
    checkContext();
    return context.globalState.get<string>(RESOURCE_NAME, DEFAULT_RESOURCE_NAME);
  }

  export function getDefaultExtensions(): any[] {
    checkContext();
    return context.globalState.get<string[]>(EXTENSIONS, []);
  }

  export function setDefaults(defaults: Defaults): void {
    checkContext();
    context.globalState.update(BUILD_TOOL, defaults.buildTool);
    context.globalState.update(GROUP_ID, defaults.groupId);
    context.globalState.update(ARTIFACT_ID, defaults.artifactId);
    context.globalState.update(PROJECT_VERSION, defaults.projectVersion);
    context.globalState.update(PACKAGE_NAME, defaults.packageName);
    context.globalState.update(RESOURCE_NAME, defaults.resourceName);
    context.globalState.update(EXTENSIONS, defaults.extensions);
  }

  function checkContext(): void {
    if (!context) {
      throw "Error: ExtensionContext is not set";
    }
  }
}

interface Defaults {
  buildTool: string;
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: string[];
}
