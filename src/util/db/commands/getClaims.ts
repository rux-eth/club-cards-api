/* eslint-disable no-throw-literal */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { Collection, Document, WithId } from 'mongodb';
import { assertAuthFuncDoc, Claim, ClaimId, ExpressError, GetClaimsRes } from '../../types';

export default async function getClaims(address: string, coll: Collection): Promise<GetClaimsRes> {
    const cm: Map<ClaimId, Claim> = new Map();
    // eslint-disable-next-line object-shorthand
    const authFuncDoc: WithId<Document> = await coll.findOne({ address: address });
    assertAuthFuncDoc(authFuncDoc);
    if (!(authFuncDoc.authTxs.claims.length > 0)) {
        throw <ExpressError>{ status: 444, message: 'No authorized functions for address' };
    }
    authFuncDoc.authTxs.claims.forEach((elem: Claim) => {
        cm.set(elem.claimId, elem);
    });
    return <GetClaimsRes>{ claimMap: cm, nonce: authFuncDoc.nonce };
}
