import { rpc } from "./rpc.ts";


export const makeNixShell = (packages: string[], pure = false) => rpc(`
#!/usr/bin/env nix-shell
#! nix-shell -i "bash" ${pure ? "--pure" : ""} -p ${packages.join(" ")}

while read line
	do eval "$line"
done
`, "");

const sh = await makeNixShell(["mpv"], true);
//await sh.ask(`echo 5`);
await sh.ask(`mpv --help`).then(console.log)