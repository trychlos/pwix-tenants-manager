/*
 * pwix:tenants-manager/src/common/js/configure.js
 */

import _, { truncate } from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';

const logger = Logger.get();

let _conf = {};
TenantsManager._conf = new ReactiveVar( _conf );

TenantsManager._defaults = {
    allowFn: null,
    // user interface
    classes: '',
    hideDisabled: true,
    modifiedOnUpdate: false,
    showEmptyGeneralizedEmails: false,
    showEmptyGeneralizedUrls: false,
    // collections
    entityFields: null,
    recordFields: null,
    // tabular list
    listHasContactEmail: true,
    listHasContactUrl: true,
    listHasGeneralizedEmails: false,
    listHasGeneralizedUrls: false,
    listHasHomeUrl: true,
    // properties
    maxGeneralizedEmails: -1,
    minGeneralizedEmails: 1,
    propertiesHaveGeneralizedUrls: false,
    propertiesHaveGeneralizedEmails: false,
    // server-side extensions
    serverAllExtend: null,
    serverTabularExtend: null,
    tenantButtons: null,
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
        // check that keys exist
        let built_conf = {};
        Object.keys( o ).forEach(( it ) => {
            if( Object.keys( TenantsManager._defaults ).includes( it )){
                built_conf[it] = o[it];
            } else {
                logger.warn( 'configure() ignore unmanaged key \''+it+'\'' );
            }
        });
        if( Object.keys( built_conf ).length ){
            _conf = _.merge( TenantsManager._defaults, _conf, built_conf );
            TenantsManager._conf.set( _conf );
            logger.verbose({ verbosity: _conf.verbosity, against: TenantsManager.C.Verbose.CONFIGURE }, 'configure() with', built_conf );
        }
    }
    // also acts as a getter
    return TenantsManager._conf.get();
}

_conf = _.merge( {}, TenantsManager._defaults );
TenantsManager._conf.set( _conf );
