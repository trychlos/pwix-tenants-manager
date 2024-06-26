/*
 * pwix:tenants-manager/src/common/collections/tenants/index.js
 *
 * This is a pseudo-collection: just an object which gathers common properties of Entities and Records.
 * For example: permissions are common.
 */

export const Tenants = {
    checks: {
        async canDelete( userId ){
            return await Roles.userIsInRoles( userId, TenantsManager.configure().roles.delete );
        },
        async canEdit( userId ){
            return await Roles.userIsInRoles( userId, TenantsManager.configure().roles.edit );
        },
        async canList( userId ){
            return await Roles.userIsInRoles( userId, TenantsManager.configure().roles.list );
        }
    }
};

console.debug( 'defining Tenants' );
