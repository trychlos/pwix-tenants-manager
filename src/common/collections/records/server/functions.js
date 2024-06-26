/*
 * pwix:tenants-manager/src/common/collections/records/server/functions.js
 *
 * Server-only functions
 */

import { Records } from '../index.js';

Records.server = {};

Records.server.getBy = async function( selector, userId ){
    return await Records.collection.find( selector ).fetchAsync();
};
