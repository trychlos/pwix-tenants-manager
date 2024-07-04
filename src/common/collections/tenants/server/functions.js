/*
 * pwix:tenants-manager/src/common/collections/tenants/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';

import { check } from 'meteor/check';

import { Tenants } from '../index.js';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

Tenants.server = {};

/*
 * @summary: Returns a cursor on the tenants
 *  The cursors contains the list of entities, each entity holding a DYN object with:
 *  - managers: the list of ids of users which are allowed to managed this tenant using a scoped role
 *  - records: the list of the records attached to this entity
 *  - closest: the closest record
 * The returned cursor is a reactive data source.
 * 
 * Rationale: we want maintain on server-side a pseudo (not serialized) collection which gathers entities, records, their managers and their properties, on a reactive way.
 * We are here reactive to both: roleAssignment, entities and records collections.
 */
Tenants.server.cursorTenantsAll = async function(){

    let initializing = true;

    const f_transform = async function( item ){
        item.DYN = {
            managers: [],
            records: [],
            closest: null
        };
        let promises = [];
        // find ORG_SCOPED_MANAGER allowed users, and add to each entity the list of its records
        promises.push( Meteor.roleAssignment.find({ 'role._id': 'ORG_SCOPED_MANAGER', scope: item._id }).fetchAsync().then(( fetched ) => {
            fetched.forEach(( it ) => {
                Meteor.users.findOneAsync({ _id: it.user._id }).then(( user ) => {
                    if( user ){
                        item.DYN.managers.push( user );
                    } else {
                        console.warn( 'user not found, but allowed by an assigned scoped role', it.user._id );
                    }
                });
            });
            return true;
        }));
        // find ORG_SCOPED_MANAGER allowed users, and add to each entity the list of its records
        promises.push( Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            item.DYN.records = fetched;
            item.DYN.closest = Validity.closestByRecords( fetched ).record;
            return true;
        }));
        return Promise.allSettled( promises ).then(() => {
            return item;
        })
    };

    // observe the roleAssignment collection
    const rolesObserver = Entities.collection.find({}).observeAsync({
        added: async function( item ){
            self.added( TenantsManager.C.pub.tenantsAll.collection, item._id, await f_transform( item ));
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( TenantsManager.C.pub.tenantsAll.collection, newItem._id, await f_transform( newItem ));
            }
        },
        removed: async function( oldItem ){
            self.removed( TenantsManager.C.pub.tenantsAll.collection, oldItem._id );
        }
    });

    // observe the Entities collection
    const entitiesObserver = Entities.collection.find({}).observeAsync({
        added: async function( item ){
            self.added( TenantsManager.C.pub.tenantsAll.collection, item._id, await f_transform( item ));
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( TenantsManager.C.pub.tenantsAll.collection, newItem._id, await f_transform( newItem ));
            }
        },
        removed: async function( oldItem ){
            self.removed( TenantsManager.C.pub.tenantsAll.collection, oldItem._id );
        }
    });

    // observe the Records collection
    const recordsObserver = Records.collection.find({}).observeAsync({
        added: async function( item ){
            self.added( TenantsManager.C.pub.tenantsAll.collection, item._id, await f_transform( item ));
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( TenantsManager.C.pub.tenantsAll.collection, newItem._id, await f_transform( newItem ));
            }
        },
        removed: async function( oldItem ){
            self.removed( TenantsManager.C.pub.tenantsAll.collection, oldItem._id );
        }
    });

    initializing = false;
};

/*
 * @param {Object} entity
 *  an object with a DYN.managers array
 * @param {String} userId
 */
Tenants.server.setManagers = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
};

/*
 * @summary Create/Update at once an entity and all its validity records
 * @param {Object} entity
 *  an object with a DYN.records array of validity records as ReactiveVar's
 * @param {String} userId
 * @returns {Object}
 */
Tenants.server.upsert = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    //console.debug( 'Tenants.server.upsert()', entity );

    // upsert the entity
    //  we get back not only a result but also the original entity
    //  when new, 'entity' has been updated with newly inserted id
    let entitiesRes = await Entities.server.upsert( entity, userId );

    // and asks the Records to do the rest
    let recordsRes = await Records.server.upsert( entity, userId );

    return {
        entities: entitiesRes,
        records: recordsRes
    }
};
