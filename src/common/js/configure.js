/*
 * pwix:tenants-manager/src/common/js/configure.js
 */

import _ from 'lodash';

TenantsManager._conf = {};

TenantsManager._defaults = {
    classes: '',
    fieldsSet: null,
    haveEmailAddress: TenantsManager.C.Input.MANDATORY,
    haveUsername: TenantsManager.C.Input.NONE,
    roles: {
        list: null,
        create: null,
        edit: null,
        delete: null
    },
    scopesFn: null,
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
    }
    // also acts as a getter
    return TenantsManager._conf;
}

_.merge( TenantsManager._conf, TenantsManager._defaults );
