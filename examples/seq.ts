import { Bash } from "../bash.ts";


const seq = await Bash("seq ${first} ${last}");

seq.do({ first: 0, last: 15 });