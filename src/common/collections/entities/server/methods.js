/*
 * pwix:tenants-manager/src/common/collections/entities/server/methods.js
 */

import { Entities } from '../index.js';

Meteor.methods({
    // search an entity by an attribute
    async 'pwix.TenantsManager.m.Entities.getBy'( selector ){
        return await Entities.s.getBy( selector, this.userId );
    }
});
