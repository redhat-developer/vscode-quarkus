import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as vscode from 'vscode';
import { VSCodeCommands } from '../../../definitions/constants';



describe('VS Code extension tests', () => {

  it('should be present', () => {
    expect(vscode.extensions.getExtension('redhat.vscode-quarkus')).to.be.ok;
  });

  it('should have Quarkus commands as activation events', () => {
    const packageJSON = vscode.extensions.getExtension('redhat.vscode-quarkus').packageJSON;
    const activationCommands = packageJSON.activationEvents.filter((s) => s.startsWith('onCommand:'))
        .map((s) => s.substring('onCommand:'.length));
    const QUARKUS_ACTIVATION_COMMANDS: string[] = [
      // from package.json
      VSCodeCommands.CREATE_PROJECT,
      VSCodeCommands.QUARKUS_WELCOME,
    ];

    expect(activationCommands).to.have.members(QUARKUS_ACTIVATION_COMMANDS);
  });
});
