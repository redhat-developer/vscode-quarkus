import * as _ from "lodash";
import * as fse from "fs-extra";
import * as os from "os";
import * as path from "path";
import { Extension, ExtensionContext, extensions } from "vscode";
import { M2Utils } from "./m2utils";

let EXTENSION_CONTEXT: ExtensionContext;
let EXTENSION_PUBLISHER: string;
let EXTENSION_NAME: string;
let EXTENSION_VERSION: string;
let MAVEN_LOCAL_REPOSITORY: string;

export async function loadPackageInfo(
	context: ExtensionContext
): Promise<void> {
	EXTENSION_CONTEXT = context;

	const { publisher, name, version } = await fse.readJSON(
		context.asAbsolutePath("./package.json")
	);
	EXTENSION_PUBLISHER = publisher;
	EXTENSION_NAME = name;
	EXTENSION_VERSION = version;

	// find Maven Local Repositry
	try {
		const userSettingsPath = path.join(os.homedir(), ".m2", "settings.xml");
		const userSettings = await M2Utils.parseXmlFile(userSettingsPath);
		MAVEN_LOCAL_REPOSITORY = path.resolve(
			_.get(userSettings, "settings.localRepository[0]")
		);
	} catch (error) {
		console.log("localRepository not specified in Maven Settings.");
	}

	if (!MAVEN_LOCAL_REPOSITORY) {
		MAVEN_LOCAL_REPOSITORY = path.join(os.homedir(), ".m2", "repository");
	}
}

export function getMavenLocalRepository() {
	return MAVEN_LOCAL_REPOSITORY;
}

export function getExtensionPublisher(): string {
	return EXTENSION_PUBLISHER;
}

export function getExtensionName(): string {
	return EXTENSION_NAME;
}

export function getExtensionId(): string {
	return `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
}

export function getExtensionVersion(): string {
	return EXTENSION_VERSION;
}

export function getPathToTempFolder(...args: string[]): string {
	return path.join(os.tmpdir(), ...args);
}

export function getPathToExtensionRoot(...args: string[]): string {
	const ext: Extension<any> | undefined = extensions.getExtension(
		getExtensionId()
	);
	if (!ext) {
		throw new Error("Cannot identify Maven extension.");
	}
	return path.join(ext.extensionPath, ...args);
}

export function getPathToWorkspaceStorage(
	...args: string[]
): string | undefined {
	if (EXTENSION_CONTEXT.storagePath === undefined) {
		return undefined;
	}
	fse.ensureDirSync(EXTENSION_CONTEXT.storagePath);
	return path.join(EXTENSION_CONTEXT.storagePath, ...args);
}
