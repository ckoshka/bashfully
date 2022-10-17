
export const rpc = async (cmd: string): Promise<RPCServer> => {
    const file = await Deno.makeTempFile();
    await Deno.writeTextFile(file, cmd);
    const remove = () => Deno.remove(file);
    Deno.addSignalListener("SIGTERM", remove);

    const proc = Deno.run({cmd: ["bash", file], stdin: "piped", stdout: "piped"});
    const [enc, dec] = [new TextEncoder(), new TextDecoder()];

    const queue: Promise<string>[] = [];

    const manager = {
        ask: (s: string): Promise<string> => {
            return queue.length === 0 ? (queue.push(new Promise<string>(resolve => {
                (async () => {
                    await proc.stdin.write(enc.encode(s));
                    await proc.stdin.write(enc.encode("\n"));
                    const arr = new Uint8Array(10000000);
                    await proc.stdout.read(arr);
                    resolve(dec.decode(arr.slice(0, arr.findIndex(b => b === 0))));
                })()
            })), queue[0]) : queue[0].then(() => {
                queue.pop(); 
                return manager.ask(s);
            });
        },
        kill: async () => {
            proc.kill("SIGTERM");
            await remove();
        }
    };

    return manager;
}

export type RPCServer = { ask: (s: string) => Promise<string>; kill: () => Promise<void>; };
