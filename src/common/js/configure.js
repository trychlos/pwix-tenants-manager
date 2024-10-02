/*
 * pwix:tenants-manager/src/common/js/configure.js
 */

import _ from 'lodash';

import { ReactiveVar } from 'meteor/reactive-var';

let _conf = {};

TenantsManager._conf = new ReactiveVar( _conf );

TenantsManager._defaults = {
    allowFn: null,
    // user interface
    classes: '',
    hideDisabled: true,
    // collections
    entityFields: null,
    recordFields: null,
    serverTabularExtend: null,
    tenantFields: null,
    tenantsCollection: 'tenants',
    scopedManagerRole: 'SCOPED_TENANT_MANAGER',
    // runtime
    verbosity: TenantsManager.C.Verbose.CONFIGURE,
    withValidities: true
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
TenantsManager.configure = function( o ){
    if( o && _.isObject( o )){
        _conf = _.merge( TenantsManager._defaults, _conf, o );
        TenantsManager._conf.set( _conf );
        // be verbose if asked for
        if( _conf.verbosity & TenantsManager.C.Verbose.CONFIGURE ){
            //console.log( 'pwix:tenants-manager configure() with', o, 'building', TenantsList._conf );
            console.log( 'pwix:tenants-manager configure() with', o );
        }
    }
    // also acts as a getter
    return TenantsManager._conf.get();
}

_conf = _.merge( {}, TenantsManager._defaults );
TenantsManager._conf.set( _conf );
