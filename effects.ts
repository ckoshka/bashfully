import { GlobalEventListener, ShellEffect } from "./deps.ts";

export type Args = Record<string, string | number>;
// streamed and single output variants
export type TempFileEffect = {
	createTempFile: (contents: string) => Promise<string>; // string must be its exact name
	deleteTempFile: (a0: string) => void | Promise<void>;
};

export type StreamedShellEffect = ShellEffect<AsyncIterable<string>>;
export type SigTermListenerEffect = GlobalEventListener<"onSigTerm">;

export type BashEffect =
	& TempFileEffect
	& StreamedShellEffect
	& SigTermListenerEffect;
