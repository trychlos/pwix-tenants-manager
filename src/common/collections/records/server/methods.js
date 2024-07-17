/*
 * pwix:tenants-manager/src/common/collections/records/server/methods.js
 */

import { Records } from '../index.js';

Meteor.methods({
    // search an entity by an attribute
    async 'pwix_tenants_manager_records_getBy'( selector ){
        return await Records.server.getBy( selector, this.userId );
    }
});
