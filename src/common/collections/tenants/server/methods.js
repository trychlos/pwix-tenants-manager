/*
 * pwix:tenants-manager/src/common/collections/tenants/server/methods.js
 */

import { Tenants } from '../index.js';

Meteor.methods({
    async 'pwix.TenantsManager.m.Tenants.delete'( entity ){
        return await Tenants.s.deleteTenant( entity, this.userId );
    },

    // update the managers of a tenant
    async 'pwix.TenantsManager.m.Tenants.getScopes'(){
        return await Tenants.s.getScopes( this.userId );
    },

    async 'pwix.TenantsManager.m.Tenants.setManagers'( item ){
        return await Tenants.s.setManagers( item, this.userId );
    },

    // upsert a tenant
    async 'pwix.TenantsManager.m.Tenants.upsert'( item ){
        return await Tenants.s.upsert( item, this.userId );
    }
});
