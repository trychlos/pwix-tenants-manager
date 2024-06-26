/*
 * pwix:tenants-manager/src/common/collections/entities/server/functions.js
 *
 * Server-only functions
 */

import { Entities } from '../index.js';

Entities.server = {};

Entities.server.getBy = async function( selector, userId ){
    return await Entities.collection.find( selector ).fetchAsync();
};
