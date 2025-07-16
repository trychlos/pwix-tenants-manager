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

// as of v1.5.0, permissions are simplified
const _permissions = {
    'pwix.tenants_manager.feat.roles': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.entities.fn.upsert': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.records.fn.upsert': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.fn.delete_tenant': 'pwix.tenants_manager.feat.delete',
    'pwix.tenants_manager.fn.get_scopes': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.fn.set_managers': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.fn.upsert': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.pub.list_all': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.list_one': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.closests': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.tabular': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.known_scopes': 'pwix.tenants_manager.feat.list'
};

/**
 * @param {String} action
 * @param {String} userId
 * @returns {Boolean} true if the current user is allowed to do the action
 */
TenantsManager.isAllowed = async function( action, userId=null ){
    let allowed = false;
    const fn = TenantsManager.configure().allowFn;
    const newAction = _permissions[action] || action;
    const newArgs = [ ...arguments ];
    newArgs.shift();
    if( fn ){
        allowed = await fn( newAction, ...newArgs );
    }
    return allowed;
}
