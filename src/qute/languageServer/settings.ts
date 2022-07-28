import { workspace } from 'vscode';
import { LanguageMismatch } from '../../utils/languageMismatch';
/**
 * VScode Qute settings.
 */
export namespace QuteSettings {

  /**
   * Experimental Qute validation in global state
   */
  export const EXPERIMENTAL_QUTE_VALIDATION_FLAG = 'qute.validation';

  /**
   * Enable/disable all Qute validation settings.
   */
  export const QUTE_VALIDATION_ENABLED = 'qute.validation.enabled';

  /**
   * Disable Qute validation for the given file name patterns settings.
   */
  export const QUTE_VALIDATION_EXCLUDED = 'qute.validation.excluded';

  /**
   * Action performed when detected Qute templates have an incorrect language.
   */
  export const QUTE_TEMPLATES_LANGUAGE_MISMATCH = "qute.templates.languageMismatch";

  /**
   * Flag for enabling forcing Qute language id setting
   */
  export const QUTE_OVERRIDE_LANGUAGE_ID = 'qute.templates.override.languageId';

  /**
  * Qute inlay hint setting.
  */
  export const QUTE_INLAY_HINT = 'qute.inlayHint.enabled';

  export function getQuteTemplatesLanguageMismatch(): QuteTemplateLanguageMismatch {
    return workspace.getConfiguration().get<QuteTemplateLanguageMismatch>(QUTE_TEMPLATES_LANGUAGE_MISMATCH);
  }
}

export class QuteTemplateLanguageMismatch extends LanguageMismatch {}
