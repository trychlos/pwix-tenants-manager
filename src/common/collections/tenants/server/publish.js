/*
 * pwix:tenants-manager/src/common/collections/tenants/server/publish.js
 */

import { Logger } from 'meteor/pwix:logger';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from '../index.js';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

const logger = Logger.get();

/*
 * returns a cursor of all tenants as a full tenants list, published here as a 'tenants_all' pseudo collection
 *  where each item is a tenant entity, and contains a DYN sub-object with:
 *  - managers: the list of ids of users which are allowed to managed this tenant using the configured scoped role
 *  - records: the list of validity records for this entity
 *  - closest: the closest record
 * Only publishes the tenants the user is allowed to
 */
Meteor.publish( TenantsManager.C.pub.tenantsAll.publish, async function( opts={} ){
    const self = this;
    const userId = this.userId;
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.pub.list', userId )){
        self.ready();
        return;
    }
    let initializing = true;

    const entitiesObserver = Entities.collection.find({}).observeAsync({
        added: async function( item ){
            if( await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.read', userId, item._id )){
                const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tenantsAll.publish, item, opts, userId );
                self.added( TenantsManager.C.pub.tenantsAll.collection, item._id, transformed );
                TenantsManager.s.eventEmitter.emit( 'added', item._id, transformed );
            }
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                if( await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.read', userId, newItem._id )){
                    const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tenantsAll.publish, newItem, opts, userId );
                    self.changed( TenantsManager.C.pub.tenantsAll.collection, newItem._id, transformed );
                    TenantsManager.s.eventEmitter.emit( 'changed', newItem._id, transformed );
                }
            }
        },
        removed: async function( oldItem ){
            self.removed( TenantsManager.C.pub.tenantsAll.collection, oldItem._id );
            TenantsManager.s.eventEmitter.emit( 'removed', oldItem._id );
        }
    });

    const recordsObserver = Records.collection.find({}).observeAsync({
        added: async function( item ){
            if( await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.read', userId, item.entity )){
                Entities.collection.findOneAsync({ _id: item.entity }).then( async ( entity ) => {
                    if( entity ){
                        const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tenantsAll.publish, entity, opts, userId );
                        try {
                            self.changed( TenantsManager.C.pub.tenantsAll.collection, entity._id, transformed );
                            TenantsManager.s.eventEmitter.emit( 'changed', entity._id, transformed );
                        } catch( e ){
                            // on HMR, happens that Error: Could not find element with id wx8rdvSdJfP6fCDTy to change
                            self.added( TenantsManager.C.pub.tenantsAll.collection, entity._id, transformed );
                            TenantsManager.s.eventEmitter.emit( 'added', entity._id, transformed );
                            //logger.debug( e, 'ignored' );
                        }
                    } else {
                        logger.warn( 'added: entity not found', item.entity );
                    }
                });
            }
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                if( await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.read', userId, newItem.entity )){
                    Entities.collection.findOneAsync({ _id: newItem.entity }).then( async ( entity ) => {
                        if( entity ){
                            const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tenantsAll.publish, entity, opts, userId );
                            self.changed( TenantsManager.C.pub.tenantsAll.collection, entity._id, transformed );
                            TenantsManager.s.eventEmitter.emit( 'changed', entity._id, transformed );
                        } else {
                            logger.warn( 'changed: entity not found', newItem.entity );
                        }
                    });
                }
            }
        },
        // remind that records are deleted after entity when deleting a tenant
        removed: async function( oldItem ){
            Entities.collection.findOneAsync({ _id: oldItem.entity }).then( async ( entity ) => {
                if( entity ){
                    const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tenantsAll.publish, entity, opts, userId );
                    self.changed( TenantsManager.C.pub.tenantsAll.collection, oldItem.entity, transformed );
                    TenantsManager.s.eventEmitter.emit( 'changed', oldItem.entity, transformed );
                }
            });
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
 * This publishes a list of the closest record for all entities
 * A tabular requisite n° 1
 * Publishes the list of records to be displayed as a list of { closest } objects
 */
Meteor.publish( TenantsManager.C.pub.closests.publish, async function(){
    const self = this;
    const userId = this.userId;
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.pub.list', userId )){
        self.ready();
        return;
    }
    let initializing = true;

    // map the entities to their closest record and maintain that
    //  index is entity_id, value is closest_id
    let entities = {};

    // an entity is removed
    const f_entityRemoved = async function( item ){
        const closest_id = entities[item._id];
        if( closest_id ){
            delete entities[item._id];
            self.removed( TenantsManager.C.pub.closests.collection, closest_id );
        }
    };

    // records are changed, added or removed for a given entity: have to recompute the closest
    const f_closestChanged = async function( entity_id ){
        if( await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.read', userId, entity_id )){
            Records.collection.find({ entity: entity_id }).fetchAsync().then(( fetched ) => {
                const closest = Validity.closestByRecords( fetched ).record;
                const prev_closest = entities[entity_id];
                if( prev_closest ){
                    if( closest._id !== prev_closest ){
                        self.removed( TenantsManager.C.pub.closests.collection, prev_closest );
                        entities[entity_id] = closest._id;
                        self.added( TenantsManager.C.pub.closests.collection, closest._id, closest );
                    }
                } else if( closest ){
                    entities[entity_id] = closest._id;
                    self.added( TenantsManager.C.pub.closests.collection, closest._id, closest );
                }
            });
        }
    };

    // observe the entities to maintain a list of existing entities and react to their changes
    const entitiesObserver = Entities.collection.find({}).observeAsync({
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
 * A tabular requisite n° 2
 * For each id of the previous requisite, publishes the content line
 * @param {String} tableName
 * @param {Array} ids: all id's of the Records collection - will be filtered by TenantsList component
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
 *      updatedBy: 1
 *    }
 *  }
 * 
 * These are the fields from the closest record, plus the entity_notes from the entity,
 *  and with effectStart and effectEnd being from the first and last records.
 */
Meteor.publish( TenantsManager.C.pub.tabular.publish, async function( tableName, ids, fields ){
    const self = this;
    const collectionName = Records.collectionName;
    let initializing = true;

    // arguments for applyPublishTransforms()
    const opts = {
        tableName, ids, fields 
    };

    // for each entity, the (closest) record sent after transformation
    let entities = {};

    const entitiesObserver = Entities.collection.find().observeAsync({
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tabular.publish, entities[newItem._id], opts, self.userId );
                self.changed( collectionName, entities[newItem._id]._id, transformed );
            }
        }
    });

    const recordsObserver = Records.collection.find({ _id: { $in: ids }}).observeAsync({
        added: async function( item ){
            const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tabular.publish, item, opts, self.userId );
            entities[item.entity] = transformed;
            self.added( collectionName, item._id, transformed );
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                const transformed = await Tenants.s.applyPublishTransforms( TenantsManager.C.pub.tabular.publish, newItem, opts, self.userId );
                entities[newItem.entity] = transformed;
                self.changed( collectionName, newItem._id, transformed );
            }
        },
        removed: async function( oldItem ){
            self.removed( collectionName, oldItem._id );
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
 * This publishes a list of the known scopes to be used as a reference when editing scoped roles
 * Publishes an array of { entity_id, closest_label } objects
 * NB: any connected user is allowed to subscribe to this publication in order to be able to have a scope label in front of its scoped roles
 */
Meteor.publish( TenantsManager.C.pub.getScopes.publish, async function(){
    const self = this;
    const userId = this.userId;
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.pub.list', userId )){
        self.ready();
        return;
    }
    const collectionName = TenantsManager.C.pub.getScopes.collection;
    let initializing = true;
    let entities = {};

    // an entity is removed
    const f_entityRemoved = async function( item ){
        if( entities[item._id] ){
            self.removed( collectionName, item._id );
            delete entities[item._id];
        }
    };

    // records are changed, added or removed for a given entity: have to recompute the closest
    const f_closestChanged = async function( entity_id ){
        Records.collection.find({ entity: entity_id }).fetchAsync().then(( fetched ) => {
            const closest = Validity.closestByRecords( fetched ).record;
            if( entities[entity_id] ){
                self.removed( collectionName, entity_id );
                delete entities[entity_id];
            }
            if( closest ){
                self.added( collectionName, entity_id, { _id: entity_id, label: closest.label });
                entities[entity_id] = closest;
            }
        });
    };

    // observe the entities to maintain a list of existing entities and react to their changes
    const entitiesObserver = Entities.collection.find({}).observeAsync({
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
 * This publishes a list of the allowed scopes and validity periods to be used as a reference when selecting a tenant as a run context
 */
Meteor.publish( TenantsManager.C.pub.selecting.publish, async function(){
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.pub.list', this.userId )){
        this.ready();
        return false;
    }

    const self = this;
    const collectionName = TenantsManager.C.pub.selecting.collection;
    let initializing = true;
    let entities = {};

    // an entity is removed
    const f_entityRemoved = async function( item ){
        if( entities[item._id] ){
            self.removed( collectionName, item._id );
            delete entities[item._id];
        }
    };

    // records are changed, added or removed for a given entity: have to recompute the closest
    const f_closestChanged = async function( entity_id ){
        Records.collection.find({ entity: entity_id }).fetchAsync().then(( fetched ) => {
            const closest = Validity.closestByRecords( fetched ).record;
            if( entities[entity_id] ){
                self.removed( collectionName, entity_id );
                delete entities[entity_id];
            }
            if( closest ){
                self.added( collectionName, entity_id, { _id: entity_id, label: closest.label });
                entities[entity_id] = closest;
            }
        });
    };

    // observe the entities to maintain a list of existing entities and react to their changes
    const entitiesObserver = Entities.collection.find({}).observeAsync({
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
