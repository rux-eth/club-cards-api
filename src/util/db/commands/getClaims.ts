/* eslint-disable prettier/prettier */
/* eslint-disable no-throw-literal */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { Collection, Document, WithId } from 'mongodb';
import {
    assertAuthFuncDoc,
    assertClaim,
    Claim,
    ClaimId,
    ExpressError,
    GetClaimsRes
} from '../../types';

export default async function getClaims(
  address: string,
  coll: Collection
): Promise<GetClaimsRes> {
  const cm: Map<ClaimId, Claim> = new Map();
  // eslint-disable-next-line object-shorthand
  const authFuncDoc: WithId<Document> = await coll.findOne({
    // eslint-disable-next-line object-shorthand
    address: address,
  });
  if (!authFuncDoc) {
    throw <ExpressError>{
      status: 444,
      message: 'No authorized functions for address',
    };
  }
  assertAuthFuncDoc(authFuncDoc);
  if (!(authFuncDoc.authFuncs.claims.length > 0)) {
    throw <ExpressError>{
      status: 444,
      message: 'No authorized functions for address',
    };
  }
  if (authFuncDoc.nonce === undefined || authFuncDoc.nonce === null) {
    throw new Error('No nonce recovered from DB for address');
  }
  authFuncDoc.authFuncs.claims.forEach((elem) => {
    assertClaim(elem);
    cm.set(elem.claimId, elem);
  });
  return <GetClaimsRes>{ claimMap: cm, nonce: authFuncDoc.nonce };
}
