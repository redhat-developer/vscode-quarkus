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
