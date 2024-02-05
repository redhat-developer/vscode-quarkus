import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as vscode from 'vscode';

describe('VS Code extension tests', () => {

  it('should be present', () => {
    expect(vscode.extensions.getExtension('redhat.vscode-quarkus')).to.be.ok;
  });
});
