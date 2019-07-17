import { Uri } from 'vscode';
import { QExtension } from './qExtension';

/**
 * Class representing data required to generate project
 */
export interface State {
  totalSteps: number;
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
  targetDir: Uri;
}