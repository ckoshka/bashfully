import { map, run, use } from "./deps.ts";
import { Args, BashEffect } from "./effects.ts";

export const Bash = <T extends Args>(script: string) =>
	<Output>(
		transformerFn?:
			| ((a0: string) => Output)
			| ((a0: string, args: T) => Output),
	) => use<BashEffect>()
		.map2(async (fx) => {
			const headers = `set -euo pipefail; IFS=$'\\n\\t'\n`;
			const temp = await fx.createTempFile(headers + script);
			fx.onSigTerm(() => fx.deleteTempFile(temp));

			return {
				run: (args: T) => {
					const stringifiedArgs = Object.entries(args).map((
						[key, val],
					) => ({ [key]: String(val) })).reduce(
						(prev, kv) => Object.assign(prev, kv),
						{},
					);
					console.log(stringifiedArgs);
					const result = map((a: string) =>
						transformerFn ? transformerFn(a, args) : a
					)(
						fx.run(`bash ${temp}`, stringifiedArgs),
					);
					return result;
				},
			};
		});

export const implBashDefaults = <BashEffect> {
	createTempFile: async (contents) => {
		const file = await Deno.makeTempFile();
		await Deno.writeTextFile(file, contents);
		return file;
	},
	deleteTempFile: Deno.remove,
	onSigTerm: (cb) => Deno.addSignalListener("SIGTERM", cb),
	run: (cmd, env) => run(cmd, { env, stdout: "piped" }).toIterable(),
};
