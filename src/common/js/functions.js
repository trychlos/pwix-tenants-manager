/*
 * pwix:tenants-manager/src/common/js/functions.js
 */

/**
 * @summary pwix:roles is responsible for managing the scoped roles of the application, as far as it knows which scopes are to be managed.
 * @returns {Array} list of scopes and their labels
 *  NB: the caller should prefer the corresponding (reactive) publication
*/
TenantsManager.getScopes = async function(){
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.get_scopes' )){
        return [];
    }
    return await ( Meteor.isClient ? Meteor.callAsync( 'pwix_tenants_manager_tenants_get_scopes' ) : TenantsManager.s.getScopes());
};

/**
 * @param {String} action
 * @param {String} userId
 * @returns {Boolean} true if the current user is allowed to do the action
 */
TenantsManager.isAllowed = async function( action, userId=null ){
    let allowed = false;
    const fn = TenantsManager.configure().allowFn;
    if( fn ){
        allowed = await fn( ...arguments );
    }
    return allowed;
}
