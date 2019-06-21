import { QExtension } from './QExtension';
import { Uri } from 'vscode';

export interface State {
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  targetDir: Uri;
  extensions: QExtension[];
}