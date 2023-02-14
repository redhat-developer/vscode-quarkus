import * as vscode from 'vscode';

import { VSCodeCommands } from '../../../definitions/constants';
import { QuteClientCommandConstants } from '../../../qute/commands/commandConstants';

import { expect } from 'chai';
import { describe, it } from 'mocha';

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
      // added by vscode, since all commands implicitly trigger extension activation
      // note that there are duplicate entries
      VSCodeCommands.CREATE_PROJECT,
      VSCodeCommands.ADD_EXTENSIONS,
      VSCodeCommands.DEBUG_QUARKUS_PROJECT,
      `${VSCodeCommands.DEBUG_QUARKUS_PROJECT}${VSCodeCommands.SHORT_SUFFIX}`,
      VSCodeCommands.BUILD_BINARY,
      VSCodeCommands.QUARKUS_WELCOME,
      VSCodeCommands.DEPLOY_TO_OPENSHIFT,
      `${VSCodeCommands.DEPLOY_TO_OPENSHIFT}${VSCodeCommands.SHORT_SUFFIX}`,
      QuteClientCommandConstants.QUTE_VALIDATION_ENABLED_TOGGLE_OFF,
      QuteClientCommandConstants.QUTE_VALIDATION_ENABLED_TOGGLE_ON,
      QuteClientCommandConstants.REFACTOR_SURROUND_WITH_COMMENTS,
      QuteClientCommandConstants.REFACTOR_SURROUND_WITH_CDATA,
      QuteClientCommandConstants.REFACTOR_SURROUND_WITH_SECTION,
    ];

    expect(activationCommands).to.have.members(QUARKUS_ACTIVATION_COMMANDS);
  });
});
