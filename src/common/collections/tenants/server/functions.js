/*
 * pwix:tenants-manager/src/common/collections/tenants/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';

import { check } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from '../index.js';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

const logger = Logger.get();

Tenants.s = {};

/*
 * @returns {Array} the array of the managers accounts ids
 *  This is a private function (not protected by any permission) used in transformations when publishing
 */
Tenants.s._getManagers = async function( scope ){
    let array = [];
    const fetched = await Meteor.roleAssignment.find({ 'role._id': TenantsManager.configure().scopedManagerRole, scope: scope }).fetchAsync();
    for( const it of fetched ){
        const user = await Meteor.users.findOneAsync({ _id: it.user._id });
        if( user ){
            array.push( user );
        } else {
            // this may happen if a user has been authorized, then removed from the local account database without updating the roles
            logger.warn( 'getManagers() user not found, but allowed by an assigned scoped role', it.user._id );
            Tenants._errors = Tenants._errors || {};
            Tenants._errors.manager_not_found = Tenants._errors.manager_not_found || {};
            Tenants._errors.manager_not_found[it.user._id] = true;
        }
    }
    return array;
};

/*
 * @param {String} userId, may be null when called from common code on the server
 * @returns {Array} the list of known tenants as objects { _id: <entity_id>, label: <closest_label> }
 *  This is a private function (not protected by any permission)
 *  Should rather use the corresponding reactive publication
 */
Tenants.s._getScopes = async function( userId ){
    //check( userId, MatchOneOf( null, String ));
    let result = [];
    const entities = await Entities.collection.find().fetchAsync();
    await Promise.allSettled( entities.map( async ( it ) => {
        const records = await Records.collection.find({ entity: it._id }).fetchAsync();
        result.push({ _id: it._id, label: Validity.closestByRecords( records ).record.label });
    }));
    return result;
};

/*
 * @param {String} pubName the publication name
 * @param {Object} tenantDoc
 * @param {Object} opts the options passed to the publish function
 * @param {String} userId the requester user
 * @returns {Promise} which eventually resolves to the transformed tenant document
 */
Tenants.s.applyPublishTransforms = async function( pubName, tenantDoc, opts={}, userId ){
    check( pubName, Match.NonEmptyString );
    check( opts, Object );
    if( tenantDoc ){
        check( tenantDoc, Match.ObjectIncluding({ _id: Match.NonEmptyString }));
        const transforms = Tenants.s.transformsPublish( pubName );
        const options = _.merge( {}, _.cloneDeep( opts ), {
            type: 'publish',
            source: pubName
        });
        //if( tenantDoc._id === 'KkpHFA8JcL8hWi6Cn' ) logger.debug( 'applyPublishTransforms()', transforms, 'tenantDoc', tenantDoc );
        let i = 0;
        for( const fn of transforms ){
            options.index = i;
            tenantDoc = await fn( tenantDoc, options, userId );
            i += 1;
            //if( tenantDoc._id === 'KkpHFA8JcL8hWi6Cn' ) logger.debug( 'applyPublishTransforms()', tenantDoc );
        }
    }
    return tenantDoc;
};

/*
 * @summary Apply read transformations to the tenant
 *  i.e. transform the document read from the database to the document sent to the client
 * @param {String} fname the calling function name
 * @param {Object} tenantDoc
 * @param {Object} opts the options passed to the read function, usually Mongo qualifiers
 * @returns {Promise} which eventually resolves to the transformed tenant document
 */
Tenants.s.applyReadTransforms = async function( fname, tenantDoc, opts={} ){
    check( fname, Match.NonEmptyString );
    check( opts, Object );
    //logger.debug( 'applyReadTransforms()', acInstance._transforms );
    if( tenantDoc ){
        check( tenantDoc, Match.ObjectIncluding({ _id: Match.NonEmptyString }));
        const transforms = Tenants.s.transformsRead();
        const options = _.merge( {}, _.cloneDeep( opts ), {
            type: 'read',
            source: fname
        });
        let i = 0;
        for( const fn of transforms ){
            options.index = i;
            tenantDoc = await fn( tenantDoc, options );
            i += 1;
        }
    }
    return tenantDoc;
};

/*
 * @summary Apply update transformations to the tenant
 *  i.e. transform the document sent by the client before uipdating the database
 * @param {String} fname the caling function name
 * @param {Object} tenantDoc
 * @param {Object} opts the options passed to the update function
 * @returns {Promise} which eventually resolves to the transformed tenant document
 */
Tenants.s.applyUpdateTransforms = async function( fname, tenantDoc, opts={} ){
    check( fname, Match.NonEmptyString );
    check( opts, Object );
    if( tenantDoc ){
        check( tenantDoc, Match.ObjectIncluding({ _id: Match.NonEmptyString }));
        const transforms = Tenants.s.transformsUpdate();
        const options = _.merge( {}, _.cloneDeep( opts ), {
            type: 'update',
            source: fname
        });
        let i = 0;
        for( const fn of transforms ){
            options.index = i;
            tenantDoc = await fn( tenantDoc, options );
            i += 1;
        }
    }
    return tenantDoc;
};

/*
 * @param {String} entity identifier
 * @param {String} userId, may be null when called from common code on the server
 * @returns {Array} the list of known tenants as objects { _id: <entity_id>, label: <closest_label> }
 */
Tenants.s.deleteTenant = async function( entity, userId ){
    check( entity, String );
    check( userId, Match.OneOf( null, String ));
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.delete', userId, entity )){
        return null;
    }
    let result = {};
    result.entities = await Entities.collection.removeAsync({ _id: entity });
    result.records = await Records.collection.removeAsync({ entity: entity });
    TenantsManager.s.eventEmitter.emit( 'tenant-delete', { id: entity, result: result });
    logger.debug( 'result', result );
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
    result.entities = await Entities.collection.find( selector ).fetchAsync();
    result.records = await Records.collection.find( selector ).fetchAsync();
    return result;
};

/*
 * @returns {Array} the array of entities with their DYN sub-object
 */
Tenants.s.getTransformedEntities = async function(){
    let array = [];
    const fetched = await Entities.collection.find().fetchAsync();
    for await ( it of fetched ){
        array.push( await Tenants.s.applyReadTransforms( 'Tenants.s.getTransformedEntities()', it ));
    };
    return array;
};

/*
 * @param {Object} entity
 *  an object with a DYN.managers array
 * @param {String} userId
 */
Tenants.s.setManagers = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.edit', userId, entity )){
        return null;
    }
};

/**
 * @param {String} name the publication name
 * @returns {Array} the list of publish transformations
 */
Tenants.s.transformsPublish = function( name ){
    check( name, Match.NonEmptyString );
    return Tenants.Transforms._publish[name] || [];
};

/**
 * @returns {Array} the list of read transformations
 */
Tenants.s.transformsRead = function(){
    return Tenants.Transforms._read;
};

/**
 * @returns {Array} the list of update transformations
 */
Tenants.s.transformsUpdate = function(){
    return Tenants.Transforms._update;
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
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.edit', userId, entity )){
        return null;
    }
    //logger.debug( 'upsert()', entity );

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

    // make sure the emitted entity has been transformed
    entity = await Tenants.s.applyReadTransforms( 'Tenants.s.upsert()', entity );
    TenantsManager.s.eventEmitter.emit( 'tenant-upsert', { entity: entity, result: res });

    //logger.debug( 'Tenants.s.upsert() res', res );
    return res;
};
