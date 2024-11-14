/*
 * pwix:tenants-manager/src/common/collections/tenants/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';

import { check } from 'meteor/check';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from '../index.js';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

Tenants.s = {};

/**
 * @summary Make sure all the fields of the fieldset are set in the item, even if undefined
 * @param {Object} item
 * @returns {Object} item
 */
Tenants.s.addUndef = function( item ){
    Tenants.fieldSet.get().names().forEach(( it ) => {
        if( !Object.keys( item ).includes( it )){
            item[it] = undefined;
        }
    });
    return item;
};

/*
 * @param {String} entity identifier
 * @param {String} userId, may be null when called from common code on the server
 * @returns {Array} the list of known tenants as objects { _id: <entity_id>, label: <closest_label> }
 */
Tenants.s.deleteTenant = async function( entity, userId ){
    check( entity, String );
    check( userId, Match.OneOf( null, String ));
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.delete_tenant', userId, entity )){
        return null;
    }
    let result = {};
    result.entities = await Entities.collection.removeAsync({ _id: entity });
    result.records = await Records.collection.removeAsync({ entity: entity });
    TenantsManager.s.eventEmitter.emit( 'tenant-delete', { id: entity, result: result });
    return result;
};

/*
 * @param {Object} selector
 * @param {String} userId, may be null when called from common code on the server
 * @returns {Object} the result as an object { entities: Array, records: Array }
 */
Tenants.s.getBy = async function( selector, userId ){
    //check( userId, MatchOneOf( null, String ));
    let result = {};
    if( userId && !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.get_by', userId )){
        return null;
    }
    result.entities = await Entities.collection.find( selector ).fetchAsync();
    result.records = await Records.collection.find( selector ).fetchAsync();
    return result;
};

/*
 * @returns {Array} the array of entities with their DYN sub-object
 */
Tenants.s.getRichEntities = async function(){
    let array = [];
    const fetched = await Entities.collection.find().fetchAsync();
    await Promise.all( fetched.map( async ( it ) => {
        array.push( await Tenants.s.transformEntity( it ));
    }));
    return array;
};

/*
 * @param {String} userId, may be null when called from common code on the server
 * @returns {Array} the list of known tenants as objects { _id: <entity_id>, label: <closest_label> }
 */
Tenants.s.getScopes = async function( userId ){
    //check( userId, MatchOneOf( null, String ));
    let result = [];
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.get_scopes', userId )){
        return null;
    }
    const entities = await Entities.collection.find().fetchAsync();
    await Promise.allSettled( entities.map( async ( it ) => {
        const records = await Records.collection.find({ entity: it._id }).fetchAsync();
        result.push({ _id: it._id, label: Validity.closestByRecords( records ).record.label });
    }));
    return result;
};

/*
 * @param {Object} entity
 *  an object with a DYN.managers array
 * @param {String} userId
 */
Tenants.s.setManagers = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.set_managers', userId, entity )){
        return null;
    }
};

/*
 * @param {Object} item the object read from the Entities collection
 * @returns {Object} this same entity object with its DYN sub-object
 */
Tenants.s.transformEntity = async function( item ){
    item.DYN = {
        managers: [],
        records: [],
        closest: null
    };
    let promises = [];
    promises.push( Meteor.roleAssignment.find({ 'role._id': TenantsManager.configure().scopedManagerRole, scope: item._id }).fetchAsync().then(( fetched ) => {
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
    return Promise.allSettled( promises )
        .then(() => {
            // extend on option
            const fn = TenantsManager.configure().serverAllExtend;
            return fn ? fn( item ) : item;
        })
        .then(() => {
            // make sure that each defined field appears in the returned item
            // happens that clearing notes on server side does not publish the field 'notes' and seems that the previously 'notes' on the client is kept
            // while publishing 'notes' as undefined rightly override (and erase) the previous notes on the client
            Entities.s.addUndef( item );
            //console.debug( 'list_all', item );
            return item;
        });
};

/*
 * @summary Create/Update at once an entity and all its validity records
 * @param {Object} entity
 *  an object with a DYN.records array of validity records as ReactiveVar's
 * @param {String} userId
 * @returns {Object}
 */
Tenants.s.upsert = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.upsert', userId, entity )){
        return null;
    }
    //console.debug( 'Tenants.s.upsert()', entity );

    // upsert the entity
    //  we get back not only a result but also the original entity
    //  when new, 'entity' has been updated with newly inserted id
    let entitiesRes = await Entities.s.upsert( entity, userId );

    // and asks the Records to do the rest
    let recordsRes = await Records.s.upsert( entity, userId );

    const res = {
        entities: entitiesRes,
        records: recordsRes
    };
    TenantsManager.s.eventEmitter.emit( 'tenant-upsert', { entity: entity, result: res });
    return res;
};
