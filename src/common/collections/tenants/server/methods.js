/*
 * pwix:tenants-manager/src/common/collections/tenants/server/methods.js
 */

import { Tenants } from '../index.js';

Meteor.methods({
    async 'pwix_tenants_manager_tenants_delete_tenant'( entity ){
        return await Tenants.s.deleteTenant( entity, this.userId );
    },

    // update the managers of a tenant
    async 'pwix_tenants_manager_tenants_get_scopes'(){
        return await Tenants.s.getScopes( this.userId );
    },

    async 'pwix_tenants_manager_tenants_set_managers'( item ){
        return await Tenants.s.setManagers( item, this.userId );
    },

    // upsert a tenant
    async 'pwix_tenants_manager_tenants_upsert'( item ){
        return await Tenants.s.upsert( item, this.userId );
    }
});
