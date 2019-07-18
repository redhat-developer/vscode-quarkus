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

import * as xml2js from "xml2js";
import * as fse from "fs-extra";

export namespace M2Utils {
	export async function parseXmlFile(
		xmlFilePath: string,
		options?: xml2js.OptionsV2
	): Promise<{} | undefined> {
		if (await fse.pathExists(xmlFilePath)) {
			const xmlString: string = await fse.readFile(xmlFilePath, "utf8");
			return parseXmlContent(xmlString, options);
		} else {
			return undefined;
		}
	}

	export async function parseXmlContent(
		xmlString: string,
		options?: xml2js.OptionsV2
	): Promise<{}> {
		const opts: {} = Object.assign({ explicitArray: true }, options);
		return new Promise<{}>(
			(
				resolve: (value: {}) => void,
				reject: (e: Error) => void
			): void => {
				xml2js.parseString(xmlString, opts, (err: Error, res: {}) => {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				});
			}
		);
	}
}
