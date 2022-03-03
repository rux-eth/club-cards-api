"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
async function getClaims(address, coll) {
    const cm = new Map();
    // eslint-disable-next-line object-shorthand
    const authFuncDoc = await coll.findOne({
        // eslint-disable-next-line object-shorthand
        address: address,
    });
    if (!authFuncDoc) {
        throw {
            status: 444,
            message: 'No authorized functions for address',
        };
    }
    (0, types_1.assertAuthFuncDoc)(authFuncDoc);
    if (!(authFuncDoc.authFuncs.claims.length > 0)) {
        throw {
            status: 444,
            message: 'No authorized functions for address',
        };
    }
    if (authFuncDoc.nonce === undefined || authFuncDoc.nonce === null) {
        throw new Error('No nonce recovered from DB for address');
    }
    authFuncDoc.authFuncs.claims.forEach((elem) => {
        (0, types_1.assertClaim)(elem);
        cm.set(elem.claimId, elem);
    });
    return { claimMap: cm, nonce: authFuncDoc.nonce };
}
exports.default = getClaims;
