import { describe, it } from 'mocha';
import * as vscode from 'vscode';
import * as assert from 'assert/strict';

describe('VS Code extension tests', () => {

  it('should be present', () => {
    assert.ok(vscode.extensions.getExtension('redhat.vscode-quarkus'));
  });
});
