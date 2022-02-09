import { commands, ConfigurationTarget, ExtensionContext, languages, TextDocument, window, workspace } from "vscode";
import { ProjectLabelInfo } from "../definitions/ProjectLabelInfo";

export abstract class LanguageMismatch {
  static ignore: string = "ignore";
  static force: string = "force";
  static prompt: string = "prompt";

  static setLanguageMismatch(configName: string, value: string): Thenable<void> {
    return this.saveToConfig(configName, value);
  }

  static saveToConfig<T>(configName: string, value: T): Thenable<void> {
    return workspace.getConfiguration().update(configName, value, ConfigurationTarget.Global);
  }
}

/**
 * Try to force the document language ID to the given language ID.
 *
 * @param document the text document.
 * @param languageId the language ID.
 * @param notifyUser if a notification should appear when the language ID is updated
 */
export function tryToForceLanguageId(context: ExtensionContext, document: TextDocument, fileName: string, propertiesLanguageMismatch: LanguageMismatch, languageId: string, notifyUser: boolean, popupFlag: string, mismatchSetting: string): Promise<void> {
  // Get project label information for the given file URI
  const labelInfo = ProjectLabelInfo.getProjectLabelInfo(document.uri.toString());
  return labelInfo.then(l => {
    if (l.isQuarkusProject()) {
      if (propertiesLanguageMismatch === LanguageMismatch.prompt) {
        const YES = "Yes", NO = "No";
        const supportType = languageId.indexOf('qute') > -1 ? 'Qute' : 'Quarkus';
        const response: Thenable<string> = window.showInformationMessage(`The language ID for '${fileName}' must be '${languageId}' to receive '${supportType}' support. Set the language ID to '${languageId}?'`, YES, NO);
        response.then(result => {
          if (result === YES) {
            // The file belongs to a Quarkus project, force a corresponding language
            languages.setTextDocumentLanguage(document, languageId);
          }
        });
      } else if (propertiesLanguageMismatch === LanguageMismatch.force || propertiesLanguageMismatch === "forceQuarkus") {
        // The file belongs to a Quarkus project, force a corresponding language
        const oldLanguageId: string = document.languageId;
        languages.setTextDocumentLanguage(document, languageId);
        if (notifyUser) {
          if (!hasShownSetLanguagePopUp(context, popupFlag)) {
            const CONFIGURE_IN_SETTINGS = "Configure in Settings";
            const DISABLE_IN_SETTINGS = "Disable Language Updating";
            const response: Thenable<string> = window.showInformationMessage(
              `Quarkus Tools for Visual Studio Code automatically switched the language ID of '${fileName}' `
              + `to be '${languageId}' in order to provide language support. `
              + `This behavior can be configured in settings.`, DISABLE_IN_SETTINGS, CONFIGURE_IN_SETTINGS);
            response.then(result => {
              if (result === CONFIGURE_IN_SETTINGS) {
                commands.executeCommand('workbench.action.openSettings', mismatchSetting);
              } else if (result === DISABLE_IN_SETTINGS) {
                LanguageMismatch.setLanguageMismatch(mismatchSetting, LanguageMismatch.ignore).then(() => {
                  languages.setTextDocumentLanguage(document, oldLanguageId);
                });
              }
            });
            context.globalState.update(popupFlag, 'true');
          }
        }
      }
    }
  });
}

function hasShownSetLanguagePopUp(context: ExtensionContext, flag: string): boolean {
  return context.globalState.get(flag, false);
}
