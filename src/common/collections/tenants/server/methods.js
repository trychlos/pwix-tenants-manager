/*
 * pwix:tenants-manager/src/common/collections/tenants/server/methods.js
 */

import { Tenants } from '../index.js';

Meteor.methods({
    // update the managers of a tenant
    async 'pwix_tenants_manager_tenants_set_managers'( item ){
        return await Tenants.server.setManagers( item, Meteor.userId());
    },

    // upsert a tenant
    async 'pwix_tenants_manager_tenants_upsert'( item ){
        return await Tenants.server.upsert( item, Meteor.userId());
    }
});
