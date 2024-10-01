/*
 * pwix:tenants-manager/src/common/collections/entities/server/methods.js
 */

import { Entities } from '../index.js';

Meteor.methods({
    // search an entity by an attribute
    async 'pwix_tenants_manager_entities_getBy'( selector ){
        return await Entities.s.getBy( selector, this.userId );
    }
});
