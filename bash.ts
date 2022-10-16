import { run } from "./deps.ts";
import { BashEffect } from "./effects.ts";

export type InferArgs<S extends string, Args extends string[] = []> = S extends ""
		? Record<Args[number], string | number>
	: S extends `${string}$\{${infer S2}\}${infer Remainder}`
		? InferArgs<Remainder, [...Args, S2]>
	: never;

export const BashEffects: BashEffect = {
	createTempFile: async (contents) => {
		const file = await Deno.makeTempFile();
		await Deno.writeTextFile(file, contents);
		return file;
	},
	deleteTempFile: Deno.remove,
	onSigTerm: (cb) => Deno.addSignalListener("SIGTERM", cb),
	run: (cmd, env) => run(cmd, { env, stdout: "piped" }).toIterable(),
}

const fx = BashEffects;

export const Bash = async <S extends string>(script: S) => {
	const headers = `set -euo pipefail; IFS=$'\\n\\t'\n`;
	const temp = await fx.createTempFile(headers + script);
	fx.onSigTerm(() => fx.deleteTempFile(temp));

	return {
		do: (args: InferArgs<S>) => {
			const stringifiedArgs = Object.entries(args).map((
				[key, val],
			) => ({ [key]: String(val) })).reduce(
				(prev, kv) => Object.assign(prev, kv),
				{},
			);

			return fx.run(`bash ${temp}`, stringifiedArgs);
		},
	}
}