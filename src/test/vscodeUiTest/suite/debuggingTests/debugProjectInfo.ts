/**
 * Copyright 2020 Red Hat, Inc. and others.

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

export class BuildSupportInfo {
  private executable: string;
  private wrapper: string;
  private windowsWrapper: string;
  private quarkusDev: string;
  private commandParam: string | undefined;
  constructor(
    executable: string,
    wrapper: string,
    windowsWrapper: string,
    quarkusDev: string,
    commandParam?: string
  ) {
    this.executable = executable;
    this.wrapper = wrapper;
    this.windowsWrapper = windowsWrapper;
    this.quarkusDev = quarkusDev;
    this.commandParam = commandParam;
  }

  public getExecutable(): string {
    return this.executable;
  }

  public getWrapper(): string {
    return this.wrapper;
  }

  public getWindowsWrapper(): string {
    return this.windowsWrapper;
  }

  public getQuarkusDev(): string {
    return this.quarkusDev;
  }

  public getCommand(options: { useWrapper: boolean }): string {
    return this.addParamsIfNeeded(
      `${options.useWrapper ? this.wrapper : this.executable} ${
        this.quarkusDev
      } `
    );
  }

  public getWindowsCommand(options: { useWrapper: boolean }): string {
    return this.addParamsIfNeeded(
      `${options.useWrapper ? this.windowsWrapper : this.executable} ${
        this.quarkusDev
      } `
    );
  }

  private addParamsIfNeeded(command: string): string {
    return command + (this.commandParam ? this.commandParam : "");
  }
}

export interface ProjectInfo {
  projectName: string;
  parentFolderName: string;
  resourceClass: string;
  message: string;
  port: number;
  buildSupport: BuildSupportInfo;
}

export const MAVEN: BuildSupportInfo = new BuildSupportInfo(
  "mvn",
  "./mvnw",
  ".\\mvnw.cmd",
  "quarkus:dev"
);
export const GRADLE: BuildSupportInfo = new BuildSupportInfo(
  "gradle",
  "./gradlew",
  ".\\gradlew.bat",
  "quarkusDev",
  "--console=plain"
);

export const QUARKUS_MAVEN_1: ProjectInfo = {
  projectName: "quarkus-maven-1",
  parentFolderName: "maven-projects",
  resourceClass: "QuarkusMaven1.java",
  message: "hello from QuarkusMaven1",
  port: 8080,
  buildSupport: MAVEN
};

export const QUARKUS_MAVEN_2: ProjectInfo = {
  projectName: "quarkus-maven-2",
  parentFolderName: "maven-projects",
  resourceClass: "QuarkusMaven2.java",
  message: "hello from QuarkusMaven2",
  port: 9090,
  buildSupport: MAVEN
};

export const QUARKUS_GRADLE_1: ProjectInfo = {
  projectName: "quarkus-gradle-1",
  parentFolderName: "gradle-projects",
  resourceClass: "QuarkusGradle1.java",
  message: "hello from QuarkusGradle1",
  port: 8080,
  buildSupport: GRADLE
};

export const QUARKUS_GRADLE_2: ProjectInfo = {
  projectName: "quarkus-gradle-2",
  parentFolderName: "gradle-projects",
  resourceClass: "QuarkusGradle2.java",
  message: "hello from QuarkusGradle2",
  port: 9090,
  buildSupport: GRADLE
};
