import * as vscode from 'vscode';

import { VSCodeCommands } from '../../definitions/constants';

import { expect } from 'chai';
import { before, describe, it } from 'mocha';

describe('VS Code extension tests', () => {

  const QUARKUS_COMMANDS: string[] = [
    VSCodeCommands.ADD_EXTENSIONS,
    VSCodeCommands.CREATE_PROJECT,
    VSCodeCommands.DEBUG_QUARKUS_PROJECT,
    VSCodeCommands.QUARKUS_WELCOME
  ];

  before(() => {
    vscode.window.showInformationMessage('Start all tests.');
  });

  it('should be present', () => {
    expect(vscode.extensions.getExtension('redhat.vscode-quarkus')).to.be.ok;
  });

  it('should have Quarkus commands as activation events', () => {
    const packageJSON = vscode.extensions.getExtension('redhat.vscode-quarkus').packageJSON;

    QUARKUS_COMMANDS.forEach((command: string) => {
      expect(packageJSON.activationEvents).to.include(`onCommand:${command}`, `The ${command} command is not registered as an activation event in package.json`);
    });
  });
});
