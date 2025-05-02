const lib = require('../dist/cjs/index.cjs');

console.info("BEFORE");
class Pippo extends lib.SmpDynamoService {
    constructor() {
        super();
    }
}

console.info("PIPPO", Pippo);
