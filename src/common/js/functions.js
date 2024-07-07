/*
 * pwix:tenants-manager/src/common/js/functions.js
 */

/**
 * @summary pwix:roles is responsible for managing the scoped roles of the application, as far as it knows which scopes are to be managed.
 * @returns {Array} list of scopes and their labels
*/
TenantsManager.getScopes = async function(){
    return await( Meteor.isClient ? Meteor.callAsync( 'pwix_tenants_manager_tenants_get_scopes' ) : TenantsManager.server.getScopes());
};
