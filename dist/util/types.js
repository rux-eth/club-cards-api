"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEditionId = exports.assertAuthReq = exports.assertSigReq = exports.assertClaimReq = exports.assertAuthFuncDoc = exports.assertCompressedAddress = exports.assertClaimIds = exports.assertSignature = exports.assertClaim = exports.assertWhitelist = void 0;
const web3_utils_1 = require("web3-utils");
const sigs_1 = require("./sigs");
function assertWhitelist(o) {
    if ('waveId' in o && 'amount' in o)
        return;
    throw { status: 400, message: `Invalid whitelist: ${JSON.stringify(o)}` };
}
exports.assertWhitelist = assertWhitelist;
function assertClaim(o) {
    if ('claimId' in o && 'amount' in o && 'tokenId' in o)
        return;
    throw { status: 400, message: `Not a valid Claim: ${JSON.stringify(o)}` };
}
exports.assertClaim = assertClaim;
function assertSignature(s) {
    if (typeof s === typeof 'string' && s.startsWith('0x') && s.length === 132)
        return;
    throw { status: 400, message: 'Invalid signature' };
}
exports.assertSignature = assertSignature;
function assertClaimIds(arr) {
    if (Array.isArray(arr) &&
        arr.every((val) => typeof val === typeof 1) &&
        arr.length <= 10 &&
        arr.length > 0)
        return;
    throw { status: 400, message: 'Invalid claimIds' };
}
exports.assertClaimIds = assertClaimIds;
function assertCompressedAddress(a) {
    if (typeof a === typeof 'string' && a.startsWith('0x') && a.length === 42) {
        (0, web3_utils_1.toChecksumAddress)(a);
        return;
    }
    throw { status: 400, message: 'Invalid address' };
}
exports.assertCompressedAddress = assertCompressedAddress;
function assertAuthFuncDoc(o) {
    if ('address' in o && 'postNonce' in o)
        return;
    if ('address' in o && 'authFuncs' in o) {
        if (o.authFuncs.claims &&
            Array.isArray(o.authFuncs.claims) &&
            o.authFuncs.claims.length > 0) {
            o.authFuncs.claims.forEach((elem) => assertClaim(elem));
        }
        if (o.authFuncs.whitelist &&
            Array.isArray(o.authFuncs.whitelist) &&
            o.authFuncs.whitelist.length > 0) {
            o.authFuncs.whitelist.forEach((elem) => assertWhitelist(elem));
        }
        assertCompressedAddress(o.address);
        return;
    }
    throw {
        status: 400,
        message: `Invalid AuthFuncDoc: ${JSON.stringify(o, null, 3)}`,
    };
}
exports.assertAuthFuncDoc = assertAuthFuncDoc;
function assertClaimReq(o) {
    if ('address' in o) {
        assertCompressedAddress(o.address);
        return;
    }
    throw { status: 400, message: 'Invalid parameters' };
}
exports.assertClaimReq = assertClaimReq;
function assertSigReq(o) {
    if ('address' in o && 'claimIds' in o) {
        assertCompressedAddress(o.address);
        assertClaimIds(o.claimIds);
        return;
    }
    throw { status: 400, message: 'Invalid parameters' };
}
exports.assertSigReq = assertSigReq;
function assertAuthReq(o) {
    if ('signature' in o && 'content' in o) {
        if ('postNonce' in o.content &&
            'authUsers' in o.content &&
            Array.isArray(o.content.authUsers)) {
            o.content.authUsers.forEach((elem) => assertAuthFuncDoc(elem));
            if ((0, sigs_1.recPostSig)(o) !== process.env.ADMIN_PUBLIC_KEY)
                throw {
                    status: 403,
                    message: 'Signature does not recover to admin address',
                };
            return;
        }
    }
    throw { status: 400, message: 'Invalid body' };
}
exports.assertAuthReq = assertAuthReq;
function getEditionId(o) {
    if (Object.keys(o).length === 3) {
        assertClaim(o);
        return o.claimId;
    }
    assertWhitelist(o);
    return o.waveId;
}
exports.getEditionId = getEditionId;
