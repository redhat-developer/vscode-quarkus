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
import * as fs from 'fs-extra';
import * as g2js from 'gradle-to-js/lib/parser';
import * as _ from 'lodash';
import * as path from 'path';
import { XMLParser } from "fast-xml-parser";
import { env } from 'process';
import { By, InputBox, Key, VSBrowser, WebDriver, WebElement, Workbench } from 'vscode-extension-tester';
import { ProjectGenerationWizard, QuickPickItemInfo } from '../ProjectGenerationWizard';
import * as assert from 'assert/strict';

/**
 * This file contains tests for the project generation wizard
 * from the 'Quarkus: Generate a new Quarkus project' command
 */
describe('Project generation tests', function () {
  this.bail(true);
  this.retries(2);

  let driver: WebDriver;
  const tempDir: string = path.join(__dirname, 'temp');

  process.env['VSCODE_QUARKUS_API_URL'] = 'https://stage.code.quarkus.io/api';

  before('get the driver', async function (): Promise<void> {
    this.timeout(120000);
    driver = VSBrowser.instance.driver;
  });

  // tslint:disable-next-line: only-arrow-functions
  beforeEach('clear temp dir', async function (): Promise<void> {
    if (fs.existsSync(tempDir)) {
      fs.removeSync(tempDir);
    }
    fs.mkdirSync(tempDir);
  });

  // tslint:disable-next-line: only-arrow-functions
  after('remove temp dir', async function (): Promise<void> {
    if (fs.existsSync(tempDir)) {
      fs.removeSync(tempDir);
    }
  });

  /**
   * Tests if the project generation wizard opens after
   * calling the 'Quarkus: Generate a Quarkus project command'
   * in the command palette
   */
  it('should open project generation wizard', async function () {
    this.timeout(60000);
    const wizard: ProjectGenerationWizard = await ProjectGenerationWizard.openWizard(driver);
    assert.ok(await wizardExists(), 'wizard did not open');
    await wizard.cancel();
  });

  /**
   * Tests if the project generation wizard contains correct
   * default values for the groupId, artifactId etc.
   */
  it('should have correct default values when going through the wizard', async function () {
    this.timeout(60000);
    const wizard: ProjectGenerationWizard = await ProjectGenerationWizard.openWizard(driver);

    assert.equal(await wizard.getNthQuickPickItemLabel(0), 'Maven', 'default should be Maven');
    await wizard.next();

    await wizard.sendKeys(Key.DOWN, Key.UP);
    const quickPickPlatform: QuickPickItemInfo = await wizard.getNthQuickPickItemInfo(0);
    assert.match(quickPickPlatform.label, /\(recommended\)/);
    await wizard.next();

    const javaVersion = await wizard.getNthQuickPickItemInfo(0);
    //expects the java version label to be a number maybe followed by `(recommended)`
    assert.match(javaVersion.label, /^\d+(\.\d+)*(\.\d+)?( \(recommended\))?$/);
    await wizard.next();

    const groupId = await wizard.getText();
    assert.equal(groupId, 'org.acme');
    await wizard.next();

    const artifactId = await wizard.getText();
    assert.equal(artifactId, 'quarkus-getting-started');
    await wizard.next();

    const projectVersion = await wizard.getText();
    assert.equal(projectVersion, '1.0.0-SNAPSHOT');
    await wizard.next();

    const packageName = await wizard.getText();
    assert.equal(packageName, 'org.acme');
    await wizard.next();

    await wizard.getNthQuickPickItemInfo(0);
    // expect(shouldGenerateCode).equals('Include starter code');
    await wizard.focusQuickPick(0);
    await wizard.next();

    const resourceName = await wizard.getText();
    assert.equal(resourceName, 'GreetingResource');
    await wizard.next();

    await wizard.focusQuickPick(0);
    assert.match(await wizard.getNthQuickPickItemLabel(0), /0 extensions selected/);
    await wizard.focusQuickPick(2);
    await wizard.confirm();
    assert.match(await wizard.getNthQuickPickItemLabel(0), /1 extension selected/);
    await wizard.focusQuickPick(3);
    await wizard.confirm();
    assert.match(await wizard.getNthQuickPickItemLabel(0), /2 extensions selected/);
    await wizard.focusQuickPick(1);
    await wizard.confirm();
    assert.match(await wizard.getNthQuickPickItemLabel(0), /1 extension selected/);
    await wizard.focusQuickPick(1);
    await wizard.confirm();
    assert.match(await wizard.getNthQuickPickItemLabel(0), /0 extensions selected/);
    await wizard.cancel();
  });

  /**
   * Tests if the project generation wizard has correct
   * step values at the wizard's title bar: (1/8), (2/8)
   */
  it('should have correct step values', async function () {
    this.timeout(60000);
    const wizard: ProjectGenerationWizard = await ProjectGenerationWizard.openWizard(driver);
    assert.match(await wizard.getInputBoxTitle(), /1\/10/);
    assert.equal(await wizard.getBackButton(), undefined);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /2\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /3\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /4\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /5\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /6\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /7\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /8\/10/);
    await wizard.focusQuickPick(0);//starter code
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /9\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /10\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /9\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /8\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /7\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /6\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /5\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /4\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /3\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /2\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /1\/10/);
    assert.equal(await wizard.getBackButton(), undefined);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /2\/10/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /1\/10/);
    assert.equal(await wizard.getBackButton(), undefined);

    await wizard.cancel();
  });

  /**
   * Tests if the project generation wizard has correct
   * step values at if generate starter code is skipped:
   * (8/8) for extensions step
   */
   it('should have correct step value when starter code skipped', async function () {
    this.timeout(60000);
    const wizard: ProjectGenerationWizard = await ProjectGenerationWizard.openWizard(driver);
    assert.match(await wizard.getInputBoxTitle(), /1\/10/);
    assert.equal(await wizard.getBackButton(), undefined);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /2\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /3\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /4\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /5\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /6\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /7\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /8\/10/);
    await wizard.focusQuickPick(1);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /9\/9/);
    await wizard.prev();

    assert.match(await wizard.getInputBoxTitle(), /8\/10/);
    await wizard.focusQuickPick(0);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /9\/10/);
    await wizard.next();

    assert.match(await wizard.getInputBoxTitle(), /10\/10/);

    await wizard.cancel();
   });

  /**
   * Tests if the project generation wizard correctly creates a new
   * Quarkus Maven project with some extensions added
   */
  it('should generate Maven project with extensions added', async function () {
    this.timeout(360000);

    const projectDestDir: string = path.join(tempDir, 'maven');
    const projectFolderName = 'quarkus-maven';

    fs.mkdirSync(projectDestDir);

    assert.ok(await ProjectGenerationWizard.generateProject(driver, {
      buildTool: 'Maven',
      artifactId: projectFolderName,
      extensions: ['Camel Core', 'Eclipse Vert.x'],
      dest: projectDestDir
    }));

    const finalFolderName = path.join(projectDestDir, projectFolderName)
    assert.ok((await fs.stat(finalFolderName)).isDirectory());
    assert.ok((await fs.stat(path.join(finalFolderName, 'pom.xml'))).isFile());

    const pathToPom: string = path.join(projectDestDir, projectFolderName, 'pom.xml');
    const pomDependencies: any[] = (await pomToJson(pathToPom)).project.dependencies.dependency;

    assert.ok(
      _.some(pomDependencies, { groupId: 'org.apache.camel.quarkus', artifactId: 'camel-quarkus-core' }),
      'The Camel Core extension does not exist in the downloaded Maven-based Quarkus project'
    );

    assert.ok(
      _.some(pomDependencies, { groupId: 'io.quarkus', artifactId: 'quarkus-vertx' }),
      'The Eclipse Vert.x extension does not exist in the downloaded Maven-based Quarkus project'
    );

    await (new Workbench).executeCommand('Close Workspace');
    return new Promise(res => setTimeout(res, 5000));
  });

  /**
   * Tests if the project generation wizard correctly creates a new
   * Quarkus Gradle project with some extensions added
   */
  it('should generate Gradle project with extensions added', async function () {
    this.timeout(480000);

    const projectDestDir: string = path.join(tempDir, 'gradle');
    const projectFolderName = 'quarkus-gradle';

    fs.mkdirSync(projectDestDir);

    await ProjectGenerationWizard.generateProject(driver, {
      buildTool: 'Gradle',
      artifactId: projectFolderName,
      extensions: ['Camel Core', 'Eclipse Vert.x'],
      dest: projectDestDir
    });

    const finalFolderName = path.join(projectDestDir, projectFolderName)
    assert.ok((await fs.stat(finalFolderName)).isDirectory());
    assert.ok((await fs.stat(path.join(finalFolderName, 'build.gradle'))).isFile());

    const pathToBuildGradle: string = path.join(projectDestDir, projectFolderName, 'build.gradle');
    const dependencies: any[] = (await buildGradleToJson(pathToBuildGradle)).dependencies;

    assert.ok(
      _.some(dependencies, { name: '\'org.apache.camel.quarkus:camel-quarkus-core\'' }),
      'The Camel Core extension does not exist in the downloaded Gradle-based Quarkus project'
    );

    assert.ok(
      _.some(dependencies, { name: '\'io.quarkus:quarkus-vertx\'' }),
      'The Eclipse Vert.x extension does not exist in the downloaded Gradle-based Quarkus project'
    );

    await (new Workbench()).executeCommand('Close Workspace');
    return new Promise(res => setTimeout(res, 6000));
  });

  /**
   * Tests if default values throughout the wizard are updated to match
   * the previously generated project's values
   */
  it('should display input values from previously generated project (with extensions)', async function () {
    this.timeout(360000);

    if (env['SKIP_KNOWN_FAILING_TESTS'] === 'true') {
      console.log('Skipping "should display input values from previously generated project (with extensions)"');
      return;
    }

    const projectDestDir: string = path.join(tempDir, 'previous-values-extensions');

    const buildTool = 'Gradle';
    const groupId = 'testgroupid';
    const artifactId = 'testartifactid';
    const projectVersion = 'testprojectVersion';
    const packageName = groupId;
    const resourceName = 'testresourcename';
    const shouldGenerateCode = "Include starter code";
    const extensions: string[] = ['Camel Core', 'Eclipse Vert.x'];

    fs.mkdirSync(projectDestDir);

    await ProjectGenerationWizard.generateProject(driver, {
      buildTool,
      groupId,
      artifactId,
      projectVersion,
      packageName,
      resourceName,
      extensions,
      dest: projectDestDir
    });

    /**
     * HACK:
     * vscode-java will ask if the current project should be imported/if the gradle wrapper is trusted.
     * This blocks vscode-microprofile and vscode-quarkus from starting.
     * This means the project generation wizard will not open.
     * To avoid this, we first close the project workspace.
     * The "last used extensions" should persist.
     */
    await (new Workbench()).executeCommand('Close Workspace');
    // HACK: Wait for VS Code reopen in rootless mode
    await new Promise((resolve, _reject) => { setTimeout(resolve, 2000); });

    const wizard: ProjectGenerationWizard = await ProjectGenerationWizard.openWizard(driver);

    assert.equal(await wizard.getNthQuickPickItemLabel(0), buildTool);
    await wizard.next();

    assert.match(await wizard.getNthQuickPickItemLabel(0), /\(recommended\)/);
    await wizard.next();

    //Skip past Java version selection
    await wizard.next();

    const actualGroupId = await wizard.getText();
    assert.equal(actualGroupId, groupId);
    await wizard.next();

    const actualArtifactId = await wizard.getText();
    assert.equal(actualArtifactId, artifactId);
    await wizard.next();

    const actualProjectVersion = await wizard.getText();
    assert.equal(actualProjectVersion, projectVersion);
    await wizard.next();

    const actualPackageName = await wizard.getText();
    assert.equal(actualPackageName, packageName);
    await wizard.next();

    const actualShouldGenerateCode = await wizard.getNthQuickPickItemLabel(0);
    assert.equal(actualShouldGenerateCode, shouldGenerateCode);
    await wizard.focusQuickPick(0);
    await wizard.next();

    const actualResourceName = await wizard.getText();
    assert.equal(actualResourceName, resourceName);
    await wizard.next();

    await wizard.sendKeys(Key.DOWN, Key.DOWN, Key.UP);
    const quickPickItemText: QuickPickItemInfo = await wizard.getNthQuickPickItemInfo(0);
    assert.match(quickPickItemText.label, /Last used/);
    assert.match(quickPickItemText.detail, /Camel Core/);
    assert.match(quickPickItemText.detail, /Eclipse Vert\.x/);

    await wizard.cancel();
    return new Promise(res => setTimeout(res, 6000));
  });

  /**
   * Tests if the project generation wizard displays correct
   * validation messages
   */
  it('should have correct input validation messages', async function () {
    this.timeout(60000);
    const wizard: ProjectGenerationWizard = await ProjectGenerationWizard.openWizard(driver);
    await wizard.next();
    await wizard.next();
    await wizard.next();

    // groupId input validation
    const groupIdError1 = 'Invalid groupId: A valid groupId can only contain characters from A to z, numbers, and the following symbols: ._$';
    const groupIdError2 = 'Invalid groupId: A valid groupId must start with a character from A to z, or one of the following symbols: _$';
    const groupIdError3 = 'Invalid groupId: A valid groupId must end with a character from A to z, a number, or one of the following symbols: _$';
    await assertValidation('groupId', wizard, [
      { text: 'org.acme' },
      { text: 'azaza' },
      { text: 'Az123aza' },
      { text: 'AzZza' },
      { text: 'azaz!a', errorMessage: groupIdError1 },
      { text: 'azaz_a', },
      { text: '$zazaz_aza$' },
      { text: '_zazaz_aza_' },
      { text: '&zazaz_aza_', errorMessage: groupIdError2 },
      { text: 'Azazaz_aza**', errorMessage: groupIdError3 },
      { text: 'Azazaz_aza_' },
      { text: 'Azaz3213az_aza*_', errorMessage: groupIdError1 },
      { text: '1z_azaz', errorMessage: groupIdError2 },
      { text: 'z_azaz1' }
    ]);
    await wizard.setText('org.acme');

    await wizard.next();

    // artifactId input validation
    const artifactIdError1 = 'Invalid artifactId: A valid artifactId can only contain characters from a-z, numbers, and the following symbols: -._';
    const artifactIdError2 = 'Invalid artifactId: A valid artifactId must start with a character from a-z';
    await assertValidation('artifactId', wizard, [
      { text: 'quarkus-getting-started' },
      { text: 'testing123-._' },
      { text: 'Test', errorMessage: artifactIdError2 },
      { text: '-test', errorMessage: artifactIdError2 },
      { text: '.test', errorMessage: artifactIdError2 },
      { text: '_test', errorMessage: artifactIdError2 },
      { text: 'test' },
      { text: '123test', errorMessage: artifactIdError2 },
      { text: 'test' },
      { text: 'te!*(&$&*^st', errorMessage: artifactIdError1 }
    ]);
    await wizard.setText('quarkus-getting-started');

    await wizard.next();
    await wizard.next();

    // package name input validation
    const packageNameError1 = 'Invalid package name: A valid package name can only contain characters from A to z, numbers, and the following symbols: ._$';
    const packageNameError2 = 'Invalid package name: A valid package name must start with a character from A to z, or one of the following symbols: _$';
    const packageNameError3 = 'Invalid package name: A valid package name must end with characters from A to z, a number, or the following symbols: _$';
    await assertValidation('package name', wizard, [
      { text: 'org.acme' },
      { text: 'azaza' },
      { text: 'Az123aza' },
      { text: 'AzZza' },
      { text: 'azaz!a', errorMessage: packageNameError1 },
      { text: 'azaz_a', },
      { text: '$zazaz_aza$' },
      { text: '_zazaz_aza_' },
      { text: '&zazaz_aza_', errorMessage: packageNameError2 },
      { text: 'Azazaz_aza**', errorMessage: packageNameError3 },
      { text: 'Azazaz_aza_' },
      { text: 'Azaz3213az_aza*_', errorMessage: packageNameError1 },
      { text: '1z_azaz', errorMessage: packageNameError2 },
      { text: 'z_azaz1' }
    ]);
    await wizard.setText('org.acme');

    await wizard.next();
    await wizard.next();

    // resource name input validation
    const resourceNameError1 = 'Invalid resource name: A valid resource name can only contain characters from A to z, numbers, and underscores';
    const resourceNameError2 = 'Invalid resource name: A valid resource name must start with a character from A to z';

    await assertValidation('resource name', wizard, [
      { text: 'GreetingResource' },
      { text: 'greeting' },
      { text: '!greeting', errorMessage: resourceNameError2 },
      { text: '^greeting', errorMessage: resourceNameError2 },
      { text: '3greeting', errorMessage: resourceNameError2 },
      { text: '_greeting', errorMessage: resourceNameError2 },
      { text: 'greet__^&%213ing', errorMessage: resourceNameError1 },
      { text: 'greet__213ing' },
      { text: 'greeting_' },
      { text: 'greeting7' },
      { text: 'greeting!', errorMessage: resourceNameError1 },
    ]);

    await wizard.cancel();
  });

  /**
   * Tests if the extensions picker displays extensions without duplicates.
   */
  it('should display extensions without duplicates', async function () {
    this.timeout(120000);
    const wizard: ProjectGenerationWizard = await ProjectGenerationWizard.openWizard(driver);
    await wizard.next();
    await wizard.next();
    await wizard.next();
    await wizard.next();
    await wizard.next();
    await wizard.next();
    await wizard.next();
    await wizard.sendKeys(Key.DOWN, Key.UP);
    await wizard.next();
    await wizard.next();

    const allQuickPickInfo: QuickPickItemInfo[] = await wizard.getAllQuickPickInfo();
    const allLabels: string[] = allQuickPickInfo.map((info) => info.label);
    const uniqueLabels = new Set(allLabels);
    assert.equal(allLabels.length, uniqueLabels.size);
    await wizard.cancel();
  });
});

async function wizardExists(): Promise<boolean> {
  const input: InputBox = new InputBox();
  try {
    const enclosing: WebElement = input.getEnclosingElement();
    const title: WebElement = await enclosing.findElement(By.className('quick-input-title'));
    return (await title.getText()).includes('Quarkus Tools');
  } catch (_e) {
    return false;
  }
}

async function pomToJson(pathToPom: string): Promise<any> {
  const pom = await fs.readFile(pathToPom);
  const parser = new XMLParser({
    ignoreDeclaration: true,
    ignorePiTags: true,
  });
  return parser.parse(pom);
}

function buildGradleToJson(pathToBuildGradle: string): Promise<any> {
  return new Promise((res, rej) => {
    g2js.parseFile(pathToBuildGradle).then((response) => {
      res(response);
    }).catch(rej);
  });
}

interface ExpectedValidation {
  text: string;
  errorMessage?: string;
}

async function assertValidation(type: string, input: InputBox, expectedResults: ExpectedValidation[]) {
  for (let i = 0; i < expectedResults.length; i++) {
    const expectedResult: ExpectedValidation = expectedResults[i];
    await input.setText(expectedResult.text);
    if (expectedResult.errorMessage) {
      assert.ok(await input.hasError(), `Validation for ${type} at index ${i}, with text ${expectedResult.text} should be true`);
      assert.equal(await input.getMessage(), expectedResult.errorMessage, `Validation for ${type} at index ${i}, expectedResult.errorMessage, with error message: "${expectedResult.errorMessage}" is incorrect`);
    } else {
      assert.equal(await input.hasError(), false, `Validation for ${type} at index ${i}, with text ${expectedResult.text} should be false`);
    }
  }
}
