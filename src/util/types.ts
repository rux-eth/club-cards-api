/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-throw-literal */
import { ObjectId } from 'mongodb';
import { recPostSig } from './sigs';

// types
export type ClaimId = number;
export type ClaimIds = ClaimId[];
export type EditionId = number;
export type CompressedAddress = string;
export type Signature = string;

// interfaces
export interface ClaimSigParams {
    tokenIds: Array<number>;
    amounts: Array<number>;
}
export interface MintSigParams {
    numMints: number;
    editionId: number;
}
export interface SigResponse {
    timestamp: number;
    signature1: string;
    signature2: string;
}

export interface Whitelist {
    waveId: number;
    amount: number;
}
export interface Claim {
    claimId: ClaimId;
    tokenId: number;
    amount: number;
}
export interface ExpressError {
    status: number;
    message: string;
}
export interface GetClaimsRes {
    claimMap: Map<ClaimId, Claim>;
    nonce: number;
}
export interface AuthFuncDoc {
    _id?: ObjectId;
    address: CompressedAddress;
    authFuncs: { claims?: Claim[]; whitelists?: Whitelist[] };
    nonce?: number;
}

// express requests
export interface ClaimReq {
    address: CompressedAddress;
}
export interface SigReq {
    address: CompressedAddress;
    claimIds: ClaimIds;
}
export interface AuthReq {
    signature: Signature;
    content: {
        postNonce: number;
        authUsers: AuthFuncDoc[];
    };
}

export function assertWhitelist(o: any): asserts o is Whitelist {
    if ('waveId' in o && 'amount' in o) return;
    throw <ExpressError>{ status: 400, message: `Invalid whitelist: ${JSON.stringify(o)}` };
}
export function assertClaim(o: any): asserts o is Claim {
    if ('claimId' in o && 'amount' in o && 'tokenId' in o) return;
    throw <ExpressError>{ status: 400, message: `Not a valid Claim: ${JSON.stringify(o)}` };
}
export function assertSignature(s: any): asserts s is Signature {
    if (typeof s === typeof 'string' && s.startsWith('0x') && s.length === 132) return;
    throw <ExpressError>{ status: 400, message: 'Invalid signature' };
}
export function assertClaimIds(arr: any): asserts arr is ClaimIds {
    if (
        Array.isArray(arr) &&
        arr.every((val) => typeof val === typeof 1) &&
        arr.length <= 10 &&
        arr.length > 0
    )
        return;
    throw <ExpressError>{ status: 400, message: 'Invalid claimIds' };
}
export function assertCompressedAddress(a: any): asserts a is CompressedAddress {
    if (typeof a === typeof 'string' && a.startsWith('0x') && a.length === 42) return;
    throw <ExpressError>{ status: 400, message: 'Invalid address' };
}

export function assertAuthFuncDoc(o: any): asserts o is AuthFuncDoc {
    if ('address' in o && 'postNonce' in o) return;
    if ('address' in o && 'authFuncs' in o) {
        if (
            o.authFuncs.claims &&
            Array.isArray(o.authFuncs.claims) &&
            o.authFuncs.claims.length > 0
        ) {
            o.authFuncs.claims.forEach((elem: any) => assertClaim(elem));
        }
        if (
            o.authFuncs.whitelist &&
            Array.isArray(o.authFuncs.whitelist) &&
            o.authFuncs.whitelist.length > 0
        ) {
            o.authFuncs.whitelist.forEach((elem: any) => assertWhitelist(elem));
        }
        assertCompressedAddress(o.address);
        return;
    }
    throw <ExpressError>{
        status: 400,
        message: `Invalid AuthFuncDoc: ${JSON.stringify(o, null, 3)}`,
    };
}
export function assertClaimReq(o: any): asserts o is ClaimReq {
    if ('address' in o) {
        assertCompressedAddress(o.address);
        return;
    }
    throw <ExpressError>{ status: 400, message: 'Invalid parameters' };
}
export function assertSigReq(o: any): asserts o is SigReq {
    if ('address' in o && 'claimIds' in o) {
        assertCompressedAddress(o.address);
        assertClaimIds(o.claimIds);
        return;
    }
    throw <ExpressError>{ status: 400, message: 'Invalid parameters' };
}
export function assertAuthReq(o: any): asserts o is AuthReq {
    if ('signature' in o && 'content' in o) {
        if (
            'postNonce' in o.content &&
            'authUsers' in o.content &&
            Array.isArray(o.content.authUsers)
        ) {
            o.content.authUsers.forEach((elem: any) => assertAuthFuncDoc(elem));
            if (recPostSig(o) !== process.env.ADMIN_PUBLIC_KEY)
                throw <ExpressError>{
                    status: 403,
                    message: 'Signature does not recover to admin address',
                };
            return;
        }
    }
    throw <ExpressError>{ status: 400, message: 'Invalid body' };
}
export function getEditionId(o: Claim | Whitelist): EditionId {
    if (Object.keys(o).length === 3) {
        assertClaim(o);
        return o.claimId;
    }
    assertWhitelist(o);
    return o.waveId;
}
