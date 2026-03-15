/*
 * pwix:tenants-manager/src/common/collections/records/server/methods.js
 */

import { Records } from '../index.js';

Meteor.methods({
    // search an entity by an attribute
    async 'pwix.TenantsManager.m.Records.getBy'( selector ){
        return await Records.s.getBy( selector, this.userId );
    }
});
