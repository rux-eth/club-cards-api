"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
async function getClaims(address, coll) {
    const cm = new Map();
    // eslint-disable-next-line object-shorthand
    const authFuncDoc = await coll.findOne({ address: address });
    (0, types_1.assertAuthFuncDoc)(authFuncDoc);
    if (!(authFuncDoc.authTxs.claims.length > 0)) {
        throw { status: 444, message: 'No authorized functions for address' };
    }
    authFuncDoc.authTxs.claims.forEach((elem) => {
        cm.set(elem.claimId, elem);
    });
    return { claimMap: cm, nonce: authFuncDoc.nonce };
}
exports.default = getClaims;
