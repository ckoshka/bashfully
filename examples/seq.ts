import { Bash, implBashDefaults } from "../bash.ts";
import { toArray } from "../deps.ts";

type SeqArgs = {
	first: number;
	last: number;
	divideBy: number;
};

const seq = Bash<SeqArgs>(`seq $first $last`)((n, args) =>
	Number(n) / args.divideBy
);

seq.map(s => s.run({ first: 0, last: 15, divideBy: 2 })).map(toArray).map(console.log)
    .defaultF(() => implBashDefaults)
	.run({

	})