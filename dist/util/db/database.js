"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-throw-literal */
const mongodb_1 = require("mongodb");
const getClaims_1 = require("./commands/getClaims");
const postNewAuths_1 = require("./commands/postNewAuths");
function mongoClient(db, coll, c = new mongodb_1.MongoClient(process.env.MONGODB_URL)) {
    const client = {
        getClaims: async (address) => {
            try {
                await c.connect();
                return await (0, getClaims_1.default)(address, c.db(db).collection(coll));
            }
            catch (e) {
                throw e.status === 444
                    ? { status: e.status, message: e.message }
                    : { status: 500, message: e.message || e };
            }
            finally {
                await c.close();
            }
        },
        postNewAuths: async (newAuths) => {
            try {
                await c.connect();
                const res = await (0, postNewAuths_1.default)(newAuths, c.db(db).collection(coll));
                return res;
            }
            catch (e) {
                throw e.status === 444
                    ? { status: e.status, message: e.message }
                    : { status: 500, message: e.message || e };
            }
            finally {
                await c.close();
            }
        },
    };
    return client;
}
exports.default = mongoClient;
