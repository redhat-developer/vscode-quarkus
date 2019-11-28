/**
 * Copyright 2019 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as ejs from 'ejs';
import * as path from 'path';
import * as vscode from 'vscode';
import { QuarkusConfig } from "../QuarkusConfig";

export class WelcomeWebview {

  public static currentPanel: WelcomeWebview | undefined;

  private readonly RESOURCE_FOLDER: string = 'assets/webviews';
  private _context: vscode.ExtensionContext;
  private _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (WelcomeWebview.currentPanel) {
      WelcomeWebview.currentPanel._panel.reveal(column);
      return;
    }

    WelcomeWebview.currentPanel = new WelcomeWebview(context);
  }

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._panel = this.createPanel();
    this.setPanelHtml();
    this.setCheckboxListener();
    this.setConfigListener();
  }

  private createPanel(): vscode.WebviewPanel {
    const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
      'welcome', // Identifies the type of the webview. Used internally
      `Quarkus Tools for ${vscode.env.appName}`, // Title of the panel displayed to the user
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, // Editor column to show the new webview panel in.
      {
        enableCommandUris: true,
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(this._context.extensionPath, this.RESOURCE_FOLDER))]
      }
    );
    panel.onDidDispose(() => this.dispose(), null, this._disposables);
    return panel;
  }

  private async setPanelHtml(): Promise<void> {
    this._panel.webview.html = await this.getWebviewContent();
  }

  private async getWebviewContent(): Promise<string> {

    const htmlTemplatePath: string = this.getHtmlTemplateUri().fsPath;

    const data = {
      appName: vscode.env.appName,
      checkboxValue: QuarkusConfig.getAlwaysShowWelcomePage(),
      cssUri: this.getCssUri(),
      cspSource: this._panel.webview.cspSource,
      jsUri: this.getJsUri(),
    };

    return await new Promise((resolve: any, reject: any): any => {
      ejs.renderFile(htmlTemplatePath, data, { async: true }, (error: any, data: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  private getCssUri(): vscode.Uri {
    const css: vscode.Uri = vscode.Uri.file(
      path.join(this._context.extensionPath, this.RESOURCE_FOLDER, 'styles', 'welcome.css')
    );

    return this._panel.webview.asWebviewUri(css);
  }

  private getJsUri(): vscode.Uri {
    const css: vscode.Uri = vscode.Uri.file(
      path.join(this._context.extensionPath, this.RESOURCE_FOLDER, 'scripts', 'welcome.js')
    );

    return this._panel.webview.asWebviewUri(css);
  }

  private getHtmlTemplateUri(): vscode.Uri {
    return vscode.Uri.file(
      path.join(this._context.extensionPath, this.RESOURCE_FOLDER, 'templates', 'welcome.ejs')
    );
  }

  private setCheckboxListener() {
    this._panel.webview.onDidReceiveMessage(
      message => {
        if (message.command === 'checkbox-changed') {
          const checkboxValue: boolean = message.newValue;
          QuarkusConfig.setAlwaysShowWelcomePage(checkboxValue);
        }
      },
      undefined,
      this._disposables
    );
  }

  private setConfigListener() {
    vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration(QuarkusConfig.ALWAYS_SHOW_WELCOME_PAGE) && WelcomeWebview.currentPanel) {
        this.setPanelHtml();
      }
    },
      undefined,
      this._disposables);
  }

  private dispose() {
    WelcomeWebview.currentPanel = undefined;
    while (this._disposables.length) {
      const x: vscode.Disposable = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
