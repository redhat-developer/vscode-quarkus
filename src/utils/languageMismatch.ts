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
 * Try to force the document language ID to the given expected language ID.
 *
 * @param document the text document.
 * @param expectedLanguageId the expected language ID.
 * @param notifyUser if a notification should appear when the language ID is updated
 */
export async function tryToForceLanguageId(context: ExtensionContext, document: TextDocument, fileName: string, propertiesLanguageMismatch: LanguageMismatch, expectedLanguageId: string, notifyUser: boolean, popupFlag: string, mismatchSetting: string): Promise<void> {
  // Get project label information for the given file URI
  const labelInfo = await ProjectLabelInfo.getProjectLabelInfo(document.uri.toString());
  if (!labelInfo.isQuarkusProject()) {
    return;
  }
  const oldLanguageId: string = document.languageId;
  if (oldLanguageId === expectedLanguageId) {
    // The document language id has the expected language id, don't update it to avoid

    // The call of languages.setTextDocumentLanguage reports a didOpen notification even
    // if the language id of the document is the same than the expected language id.
    // To avoid having an infinite didOpen, we stop the process here.
    return;
  }
  if (propertiesLanguageMismatch === LanguageMismatch.prompt) {
    const YES = "Yes", NO = "No";
    const supportType = expectedLanguageId.indexOf('qute') > -1 ? 'Qute' : 'Quarkus';
    const result = await window.showInformationMessage(`The language ID for '${fileName}' must be '${expectedLanguageId}' to receive '${supportType}' support. Set the language ID to '${expectedLanguageId}?'`, YES, NO);
    if (result === YES) {
      // The file belongs to a Quarkus project, force a corresponding language
      languages.setTextDocumentLanguage(document, expectedLanguageId);
    }
  } else if (propertiesLanguageMismatch === LanguageMismatch.force || propertiesLanguageMismatch === "forceQuarkus") {
    // The file belongs to a Quarkus project, force a corresponding language
    languages.setTextDocumentLanguage(document, expectedLanguageId);
    if (notifyUser) {
      if (!hasShownSetLanguagePopUp(context, popupFlag)) {
        const CONFIGURE_IN_SETTINGS = "Configure in Settings";
        const DISABLE_IN_SETTINGS = "Disable Language Updating";
        const result = await window.showInformationMessage(
          `Quarkus Tools for Visual Studio Code automatically switched the language ID of '${fileName}' `
          + `to be '${expectedLanguageId}' in order to provide language support. `
          + `This behavior can be configured in settings.`, DISABLE_IN_SETTINGS, CONFIGURE_IN_SETTINGS);

        if (result === CONFIGURE_IN_SETTINGS) {
          commands.executeCommand('workbench.action.openSettings', mismatchSetting);
        } else if (result === DISABLE_IN_SETTINGS) {
          LanguageMismatch.setLanguageMismatch(mismatchSetting, LanguageMismatch.ignore).then(() => {
            languages.setTextDocumentLanguage(document, oldLanguageId);
          });
        }
        context.globalState.update(popupFlag, 'true');
      }
    }
  }
}

function hasShownSetLanguagePopUp(context: ExtensionContext, flag: string): boolean {
  return context.globalState.get(flag, false);
}
