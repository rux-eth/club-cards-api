/* eslint-disable no-throw-literal */
import { ObjectId } from 'mongodb';

export type ClaimId = number;
export type ClaimIds = ClaimId[];
export type CompressedAddress = string;

export interface ClaimReq {
    address: CompressedAddress;
}
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
export interface SigReq {
    address: CompressedAddress;
    claimIds: ClaimIds;
}
export interface SigRes {
    tokenIds: number[];
    amounts: number[];
    nonce: number;
    timestamp: number;
    sig1: string;
    sig2: string;
}
export interface Whitelist {
    waveId: number;
    amount: number;
}
export interface Claim {
    claimId: number;
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
    nonce: number;
    authTxs: { claims?: Claim[]; whitelists?: Whitelist[] };
}
function assertClaimIds(arr: any): asserts arr is ClaimIds {
    if (
        Array.isArray(arr) &&
        arr.every((val) => typeof val === typeof 1) &&
        arr.length <= 10 &&
        arr.length > 0
    )
        return;
    throw <ExpressError>{ status: 400, message: 'Invalid claimIds' };
}
function assertCompressedAddress(a: any): asserts a is CompressedAddress {
    if (typeof a === typeof 'string' && a.startsWith('0x') && a.length === 42) return;
    throw <ExpressError>{ status: 400, message: 'Invalid address' };
}
export function assertSigReq(obj: any): asserts obj is SigReq {
    try {
        if ('address' in obj && 'claimIds' in obj) {
            assertCompressedAddress(obj.address);
            assertClaimIds(obj.claimIds);
            return;
        }
        throw <ExpressError>{ status: 400, message: 'Invalid parameters' };
    } catch (e) {
        throw <ExpressError>{ status: e.status || 500, message: e.message || e };
    }
}
export function assertAuthFuncDoc(obj: any): asserts obj is AuthFuncDoc {
    try {
        if (!obj)
            throw <ExpressError>{ status: 444, message: 'No authorized functions for address' };
        if ('address' in obj && 'nonce' in obj && 'authTxs' in obj) {
            assertCompressedAddress(obj.address);
            return;
        }
        throw <ExpressError>{ status: 400, message: 'Invalid AuthFuncDoc' };
    } catch (e) {
        throw <ExpressError>{ status: e.status || 500, message: e.message || e };
    }
}
