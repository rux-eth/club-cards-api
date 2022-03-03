/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-throw-literal */
import { MongoClient } from 'mongodb';
import { AuthReq, ExpressError, GetClaimsRes } from '../types';
import getClaims from './commands/getClaims';
import postNewAuths from './commands/postNewAuths';

export interface DBClient {
    // eslint-disable-next-line no-unused-vars
    getClaims: (arg0: string) => Promise<GetClaimsRes>;
    // eslint-disable-next-line no-unused-vars
    postNewAuths: (arg0: AuthReq) => Promise<any>;
}
export default function mongoClient(
    db: string,
    coll: string,
    c: MongoClient = new MongoClient(process.env.MONGODB_URL)
): DBClient {
    const client: DBClient = {
        getClaims: async (address: string): Promise<GetClaimsRes> => {
            try {
                await c.connect();
                return await getClaims(address, c.db(db).collection(coll));
            } catch (e) {
                throw e.status === 444
                    ? <ExpressError>{ status: e.status, message: e.message }
                    : <ExpressError>{ status: 500, message: e.message || e };
            } finally {
                await c.close();
            }
        },
        postNewAuths: async (newAuths: AuthReq): Promise<any> => {
            try {
                await c.connect();
                const res = await postNewAuths(newAuths, c.db(db).collection(coll));
                return res;
            } catch (e) {
                throw e.status === 444
                    ? <ExpressError>{ status: e.status, message: e.message }
                    : <ExpressError>{ status: 500, message: e.message || e };
            } finally {
                await c.close();
            }
        },
    };

    return client;
}
