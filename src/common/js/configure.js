/*
 * pwix:tenants-manager/src/common/js/configure.js
 */

import _ from 'lodash';

TenantsManager._conf = {};

TenantsManager._defaults = {
    classes: '',
    fieldsSet: null,
    hideDisabled: true,
    roles: {
        list: null,
        create: null,
        edit: null,
        delete: null
    },
    tenantsCollection: 'tenants',
    verbosity: TenantsManager.C.Verbose.CONFIGURE
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
TenantsManager.configure = function( o ){
    if( o && _.isObject( o )){
        _.merge( TenantsManager._conf, TenantsManager._defaults, o );
        // be verbose if asked for
        if( TenantsManager._conf.verbosity & TenantsManager.C.Verbose.CONFIGURE ){
            //console.log( 'pwix:tenants-manager configure() with', o, 'building', TenantsList._conf );
            console.log( 'pwix:tenants-manager configure() with', o );
        }
        Meteor.isClient && TenantsManager.perms.resetRoles();
    }
    // also acts as a getter
    return TenantsManager._conf;
}

_.merge( TenantsManager._conf, TenantsManager._defaults );
