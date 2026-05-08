/*
 * pwix:tenants-manager/src/client/js/tenants-list.js
 *
 * Maintain the list of the tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having its DYN sub-object with DYN.managers and DYN.records arrays
 * 
 * The DYN.managers array is provided by a server transformation.
 * We replace it with a reactive subscription to the Roles corresponding publication, so that - at least on client-side - the DYN.managers is reactive.
 */

import { Logger } from 'meteor/pwix:logger';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/pwix:roles';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

const self = TenantsManager.list;

// client-side: subscribe to the tenantsAll publication at initialization time
let _tenantsHandle = Meteor.subscribe( TenantsManager.C.pub.tenantsAll.publish );

Tracker.autorun(() => {
    if( _tenantsHandle.ready()){
        const globalManagerRole = TenantsManager.configure().globalManagerRole;
        const scopedManagerRole = TenantsManager.configure().scopedManagerRole;
        TenantsManager.collections.get( TenantsManager.C.pub.tenantsAll.collection ).find().fetchAsync().then(( fetched ) => {
            logger.debug( 'tenants', fetched );
            self._array.set( fetched );
        });
    }
});

