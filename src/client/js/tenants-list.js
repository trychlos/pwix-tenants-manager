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
            /*
            const tenants = [];
            for( const tenant of fetched ){
                tenant.DYN = tenant.DYN || {};
                // client-side: subscribe to the roles.managers publication at initialization time
                //  we are only interested here in scoped managers (the exact same filter than s._getManagers() function)
                tenant.DYN.rolesHandle = Meteor.subscribe( 'pwix.Roles.p.Assignments.roles', [ scopedManagerRole ], { scope: tenant._id, scopedOnly: true });
                Tracker.autorun( async () => {
                    if( tenant.DYN.rolesHandle.ready()){
                        const collectionName = Roles.configure().assignmentsCollection;
                        const collection = Mongo.getCollection( collectionName );
                        check( collection, Mongo.Collection );
                        const fetched = await collection.find({ scope: tenant._id }).fetchAsync();
                        let managers = [];
                        for( const role of fetched ){
                            const user = await Meteor.users.findOneAsync({ _id: role.user._id });
                            if( user ){
                                managers.push( user );
                            } else {
                                // this may happen if a user has been authorized, then removed from the local account database without updating the roles
                                logger.warn( 'getManagers() user not found, but allowed by an assigned scoped role', role.user._id );
                                Tenants._errors = Tenants._errors || {};
                                Tenants._errors.manager_not_found = Tenants._errors.manager_not_found || {};
                                Tenants._errors.manager_not_found[role.user._id] = true;
                            }
                        }
                        tenant.DYN.managers = managers;
                        logger.debug( 'settings managers to', tenant.DYN.managers );
                    }
                });
                tenants.push( tenant );
            }
            self._array.set( tenants );
            */
            self._array.set( fetched );
        });
    }
});

