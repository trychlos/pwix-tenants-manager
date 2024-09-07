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

Tenants.server = {};

/**
 * @summary Make sure all the fields of the fieldset are set in the item, even if undefined
 * @param {Object} item
 * @returns {Object} item
 */
Tenants.server.addUndef = function( item ){
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
Tenants.server.deleteTenant = async function( entity, userId ){
    check( entity, String );
    check( userId, Match.OneOf( null, String ));
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.delete_tenant', userId, entity )){
        return null;
    }
    let result = {};
    result.entities = await Entities.collection.removeAsync({ _id: entity });
    result.records = await Records.collection.removeAsync({ entity: entity });
    return result;
};

/*
 * @param {Object} selector
 * @param {String} userId, may be null when called from common code on the server
 * @returns {Object} the result as an object { entities: Array, records: Array }
 */
Tenants.server.getBy = async function( selector, userId ){
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
 * @param {String} userId, may be null when called from common code on the server
 * @returns {Array} the list of known tenants as objects { _id: <entity_id>, label: <closest_label> }
 */
Tenants.server.getScopes = async function( userId ){
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
Tenants.server.setManagers = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.set_managers', userId, entity )){
        return null;
    }
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
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.upsert', userId, entity )){
        return null;
    }
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
