/*
 * pwix:tenants-manager/src/common/collections/tenants/server/publish.js
 */

import { Validity } from 'meteor/pwix:validity';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

import { Tenants } from '../index.js';

/*
 * returns a cursor of all tenants as a full tenants list, published here as a 'tenants_all' pseudo collection
 *  where each item is a tenant entity, which contains a DYN sub-object with:
 *  - managers: the list of ids of users which are allowed to managed this tenant using a scoped role
 *  - records: the list of validity records for this entity
 *  - closest: the closest record
 */
Meteor.publish( TenantsManager.C.pub.tenantsAll.publish, async function(){
    if( !await Tenants.checks.canList( this.userId )){
        return false;
    }
    const self = this;
    let initializing = true;

    // find ORG_SCOPED_MANAGER allowed users, and add to each entity the list of its records
    const f_transform = async function( item ){
        item.DYN = {
            managers: [],
            records: [],
            closest: null
        };
        let promises = [];
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
        promises.push( Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            item.DYN.records = fetched;
            item.DYN.closest = Validity.closestByRecords( fetched ).record;
            return true;
        }));
        return Promise.allSettled( promises ).then(() => {
            return item;
        })
    };

    // in order the same query may be applied on client side, we have to add to item required fields
    const observer = Entities.collection.find({}).observeAsync({
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

    self.onStop( function(){
        observer.then(( handle ) => { handle.stop(); });
    });

    self.ready();
});

/*
 * This publishes a list of the closest record ids for all entities
 * A tabular requisite
 * Publishes an array of { _id } objects
 */
Meteor.publish( TenantsManager.C.pub.closests.publish, async function(){
    if( !await Tenants.checks.canList( this.userId )){
        return false;
    }

    const self = this;
    let initializing = true;

    // map the entities to their closest record and maintain that
    //  index is entity_id, value is closest_id
    let entities = {};

    // a new entity is added -> have to push a new closest
    const f_entityAdded = async function( item ){
        Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            const closest = Validity.closestByRecords( fetched ).record;
            entities[item._id] = closest._id;
            self.added( TenantsManager.C.pub.closests.collection, closest._id );
        });
    };

    // an entity is changed - even if the closest doesn't change, the tabular display may need to be updated
    //  (e.g. for entity notes indicator)
    //  it is not enough to just call changed() with an unchanged id
    //  but removed()+added() is ok (though redraws twice the tabular)
    const f_entityChanged = async function( item ){
        console.debug( 'changing', entities[item._id] );
        //self.changed( TenantsManager.C.pub.closests.collection, entities[item._id] );
        self.removed( TenantsManager.C.pub.closests.collection, entities[item._id] );
        self.added( TenantsManager.C.pub.closests.collection, entities[item._id] );
    };

    // an entity is removed
    const f_entityRemoved = async function( item ){
        const closest_id = entities[item._id];
        delete entities[item._id];
        self.removed( TenantsManager.C.pub.closests.collection, closest_id );
    };

    // records are changed, added or removed for a given entity: have to recompute the closest
    const f_closestChanged = async function( entity_id ){
        const prev_closest = entities[entity_id];
        Records.collection.find({ entity: entity_id }).fetchAsync().then(( fetched ) => {
            const closest = Validity.closestByRecords( fetched ).record;
            entities[entity_id] = closest._id;
            if( prev_closest ){
                if( closest._id !== prev_closest ){
                    self.removed( TenantsManager.C.pub.closests.collection, prev_closest );
                    self.added( TenantsManager.C.pub.closests.collection, closest._id );
                }
            } else {
                self.added( TenantsManager.C.pub.closests.collection, closest._id );
            }
        });
    };

    // observe the entities to maintain a list of existing entities and react to their changes
    const entitiesObserver = Entities.collection.find({}).observeAsync({
        added: async function( item ){
            f_entityAdded( item );
        },
        changed: async function( item ){
            f_entityChanged( item );
        },
        removed: async function( oldItem ){
            f_entityRemoved( oldItem );
        }
    });

    // observe the records to maintain a list of existing records per entity and react to their changes
    const recordsObserver = Records.collection.find({}).observeAsync({
        added: async function( item ){
            f_closestChanged( item.entity );
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                f_closestChanged( newItem.entity );
            }
        },
        removed: async function( oldItem ){
            f_closestChanged( oldItem.entity );
        }
    });

    initializing = false;

    self.onStop( function(){
        entitiesObserver.then(( handle ) => { handle.stop(); });
        recordsObserver.then(( handle ) => { handle.stop(); });
    });

    self.ready();
});

/*
 * the publication for the tabular display
 * @param {String} tableName
 * @param {Array} ids all id's of the Records collection - will be filtered by TenantsList component
 * @param {Object} fields the Mongo mmodifier which select the output fields
 * 
 *  [Arguments] {
 *    '0': 'Tenants',
 *    '1': [ 'Xi4PkJdirWQWALLNx', 'a2YdM4JPwB3wsHpqR' ],
 *    '2': {
 *      label: 1,
 *      entity_notes: 1,
 *      pdmpUrl: 1,
 *      gtuUrl: 1,
 *      legalsUrl: 1,
 *      homeUrl: 1,
 *      supportUrl: 1,
 *      contactUrl: 1,
 *      logoUrl: 1,
 *      logoImage: 1,
 *      supportEmail: 1,
 *      contactEmail: 1,
 *      notes: 1,
 *      entity: 1,
 *      effectStart: 1,
 *      effectEnd: 1,
 *      createdAt: 1,
 *      createdBy: 1,
 *      updatedAt: 1,
 *      updatedBy: 1,
 *      DYN: 1
 *    }
 *  }
 */
Meteor.publish( 'pwix_tenants_manager_tenants_tabular', async function( tableName, ids, fields ){

    const self = this;
    const collectionName = Records.collectionName;
    let initializing = true;
    let entities = {};

    // for tabular display we have to provide:
    // - entity_notes
    // - a DYN object which contains:
    //   > analyze: the result of the analyze, i.e. the list of fields which are different among this tenant records
    //   > count: the count of records for this tenant
    // - start end end effect dates are modified with the englobing period of the entity
    const f_transform = async function( item ){
        let promises = [];
        item.DYN = {};
        // get the entity
        promises.push( Entities.collection.findOneAsync({ _id: item.entity }).then(( res ) => {
            if( res.notes ){
                item.entity_notes = res.notes;
            }
        }));
        // get all the records
        promises.push( Records.collection.find({ entity: item.entity }).fetchAsync().then(( fetched ) => {
            item.DYN.analyze = Validity.analyzeByRecords( fetched );
            item.DYN.count = fetched.length;
            const res = Validity.englobingPeriodByRecords( fetched );
            item.effectStart = res.start;
            item.effectEnd = res.end;
        }));
        await Promise.allSettled( promises );
        return item;
    };

    const entitiesObserver = Entities.collection.find().observeAsync({
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( collectionName, entities[newItem._id] );
            }
        }
    });

    const recordsObserver = Records.collection.find({ _id: { $in: ids }}).observeAsync({
        added: async function( item ){
            entities[item.entity] = item._id;
            self.added( collectionName, item._id, await f_transform( item ));
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( collectionName, newItem._id, await f_transform( newItem ));
            }
        },
        removed: async function( oldItem ){
            self.removed( collectionName, oldItem._id);
        }
    });

    initializing = false;

    self.onStop( function(){
        entitiesObserver.then(( handle ) => { handle.stop(); });
        recordsObserver.then(( handle ) => { handle.stop(); });
    });

    self.ready();
});

// just publish someting is a pseudo-collection and see if we can later find in this collection
Meteor.publish( 'pwix_tenants_manager_test', async function(){

    const self = this;
    let initializing = true;

    const observer = Records.collection.find().observeAsync({
        added: async function( item ){
            self.added( 'pwix_tenants_manager_test', item._id, item );
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( 'pwix_tenants_manager_test', newItem._id, newItem );
            }
        },
        removed: async function( oldItem ){
            self.removed( 'pwix_tenants_manager_test', oldItem._id );
        }
    });

    initializing = false;

    self.onStop( function(){
        observer.then(( handle ) => { handle.stop(); });
    });

    console.debug( 'TEST pwix_tenants_manager_test ready' );
    self.ready();
});

/*
 * returns a cursor of, for each entity, the closest record, plus an array of the fields which are not the same between all the records
 * this collection serves as a data source for the datatables tabular display
 * it is reactive to changes both in entities and their records
 * @params {Array} ids the list of entities
 */
/*
Meteor.publish( TenantsManager.C.pub.closests.publish, async function( tableName, ids, fields ){
    if( !await Tenants.checks.canList( this.userId )){
        return false;
    }

    const self = this;
    let initializing = true;
    console.debug( TenantsManager.C.pub.closests.publish, arguments );

    let entities = {};
    let records = {};
    let closests = {};

    // add to the closest record a DYN.diffs array of the fields which are not equal in all records
    const f_computeDifferences = function( entity, closest, records ){
        let diffs = [];
        Object.keys( closest ).forEach(( field ) => {
            const value = closest[field];
            let isDiff = false;
            records.every(( it ) => {
                isDiff = ( it[field] !== value );
                return !isDiff;
            });
            if( isDiff ){
                diffs.push( field );
            }
        });
        closest.DYN = {
            entity: entity,
            diffs: diffs
        };
        return closest;
    };

    // a new entity is added
    const f_entityAdded = async function( item ){
        Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            const closest = Validity.closestByRecords( fetched ).record;
            console.debug( 'adding', closest.entity );
            self.added( TenantsManager.C.pub.closests.collection, closest.entity, f_computeDifferences( item, closest, fetched ));
        });
    };

    // an entity is changed
    const f_entityChanged = async function( item ){
        if( !initializing ){
            Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
                const closest = Validity.closestByRecords( fetched ).record;
                console.debug( 'changing', closest.entity );
                self.changed( TenantsManager.C.pub.closests.collection, closest.entity, f_computeDifferences( item, closest, fetched ));
            });
        }
    };

    // an entity is removed
    const f_entityRemoved = async function( item ){
        Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            const closest = Validity.closestByRecords( fetched ).record;
            console.debug( 'removing', closest.entity );
            self.removed( TenantsManager.C.pub.closests.collection, closest.entity, f_computeDifferences( item, closest, fetched ));
        });
    };

    // a new record is added
    const f_recordAdded = async function( item ){
        Entities.collection.findOneAsync({ _id: item.entity }).then(( it ) => { f_entityChanged( it ); });
    };

    // a record is changed
    const f_recordChanged = async function( item ){
        Entities.collection.findOneAsync({ _id: item.entity }).then(( it ) => { f_entityChanged( it ); });
    };

    // a record is removed
    const f_recordRemoved = async function( item ){
        Entities.collection.findOneAsync({ _id: item.entity }).then(( it ) => { f_entityChanged( it ); });
    };

    // observe the entities to maintain a list of existing entities and react to their changes
    const entitiesObserver = Entities.collection.find({}).observe({
        added: async function( item ){
            entities[item._id] = item;
            f_entityAdded( item );
        },
        changed: async function( newItem, oldItem ){
            entities[newItem._id] = newItem;
            f_entityChanged( newItem );
        },
        removed: async function( oldItem ){
            delete entities[oldItem._id];
            f_entityRemoved( oldItem );
        }
    });

    // observe the records to maintain a list of existing records per entity and react to their changes
    const recordsObserver = Records.collection.find({}).observe({
        added: async function( item ){
            records[item.entity] = records[item.entity] || {};
            records[item.entity][item._id] = item;
            f_recordAdded( item );
        },
        changed: async function( newItem, oldItem ){
            records[newItem.entity] = records[newItem.entity] || {};
            records[newItem.entity][newItem._id] = newItem;
            if( !initializing ){
                f_recordChanged( newItem );
            }
        },
        removed: async function( oldItem ){
            records[oldItem.entity] = records[oldItem.entity] || {};
            delete records[oldItem.entity][oldItem._id];
            f_recordRemoved( oldItem );
        }
    });

    initializing = false;

    self.onStop( function(){
        entitiesObserver.then(( handle ) => { handle.stop(); });
        recordsObserver.then(( handle ) => { handle.stop(); });
    });

    console.debug( 'closests pub ready' );
    self.ready();
});
*/
