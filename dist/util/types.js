"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAuthFuncDoc = exports.assertSigReq = void 0;
function assertClaimIds(arr) {
    if (Array.isArray(arr) &&
        arr.every((val) => typeof val === typeof 1) &&
        arr.length <= 10 &&
        arr.length > 0)
        return;
    throw { status: 400, message: 'Invalid claimIds' };
}
function assertCompressedAddress(a) {
    if (typeof a === typeof 'string' && a.startsWith('0x') && a.length === 42)
        return;
    throw { status: 400, message: 'Invalid address' };
}
function assertSigReq(obj) {
    try {
        if ('address' in obj && 'claimIds' in obj) {
            assertCompressedAddress(obj.address);
            assertClaimIds(obj.claimIds);
            return;
        }
        throw { status: 400, message: 'Invalid parameters' };
    }
    catch (e) {
        throw { status: e.status || 500, message: e.message || e };
    }
}
exports.assertSigReq = assertSigReq;
function assertAuthFuncDoc(obj) {
    try {
        if (!obj)
            throw { status: 444, message: 'No authorized functions for address' };
        if ('address' in obj && 'nonce' in obj && 'authTxs' in obj) {
            assertCompressedAddress(obj.address);
            return;
        }
        throw { status: 400, message: 'Invalid AuthFuncDoc' };
    }
    catch (e) {
        throw { status: e.status || 500, message: e.message || e };
    }
}
exports.assertAuthFuncDoc = assertAuthFuncDoc;
