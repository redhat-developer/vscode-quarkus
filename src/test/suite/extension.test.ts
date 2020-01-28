import * as vscode from 'vscode';

import { VSCodeCommands } from '../../definitions/constants';

import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('VS Code extension tests', () => {

  it('should be present', () => {
    expect(vscode.extensions.getExtension('redhat.vscode-quarkus')).to.be.ok;
  });

  it('should have Quarkus commands as activation events', () => {
    const packageJSON = vscode.extensions.getExtension('redhat.vscode-quarkus').packageJSON;
    const QUARKUS_ACTIVATION_COMMANDS: string[] = [
      VSCodeCommands.CREATE_PROJECT,
      VSCodeCommands.DEBUG_QUARKUS_PROJECT,
      VSCodeCommands.QUARKUS_WELCOME
    ];
    QUARKUS_ACTIVATION_COMMANDS.forEach((command: string) => {
      expect(packageJSON.activationEvents).to.include(`onCommand:${command}`, `The ${command} command is not registered as an activation event in package.json`);
    });
  });

  it(`should not have the 'Add Extensions' command as an activation event`, () => {
    const packageJSON = vscode.extensions.getExtension('redhat.vscode-quarkus').packageJSON;
    expect(packageJSON.activationEvents).to.not.include(
      `onCommand:${VSCodeCommands.ADD_EXTENSIONS}`,
      `The ${VSCodeCommands.ADD_EXTENSIONS} command is registered as an activation event in package.json`);
  });
});
