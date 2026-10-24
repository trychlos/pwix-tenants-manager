/*
 * pwix:tenants-manager/src/common/js/data-ready.js
 *
 * Expose whether the package setup and application tenant list are ready.
 */

import { ReactiveVar } from 'meteor/reactive-var';

const _dataReady = new ReactiveVar( false );

/**
 * @locus Anywhere
 * @summary Get the application tenant-list readiness status
 * @returns {Boolean} whether the application-facing tenant list is ready
 *  A reactive data source.
 */
TenantsManager.dataReady = function(){
    return Boolean( TenantsManager.Tenants?.ready() && _dataReady.get());
};

// Internal setter used by the client and server tenant-list providers.
export const setDataReady = function( value ){
    _dataReady.set( Boolean( value ));
};
