/*
 * pwix:tenants-manager/src/common/collections/tenants/functions.js
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';

import { Tenants } from './index.js';

import { Entities } from '../entities/index.js';
import { Records } from '../records/index.js';

const logger = Logger.get();

/**
 * @param {Object} item the published item
 * @returns {Object|null} a comparable item
 *  We remove all that can have been added by something else
 *  so that we will only compare the entity, the records, and the closest record
 *  Relies on the Fieldset definitions so that each add-on can 
 */
Tenants.comparable = function( item ){
    let comparable = _.cloneDeep( item || { DYN: { closest: {}, records: [{}] }} );
    Object.keys( comparable.DYN ).forEach(( key ) => {
        if( ![ 'closest', 'records' ].includes( key )){
            delete comparable.DYN[key];
        }
    });
    const entitiesFieldset = Entities.fieldSet.get();
    if( entitiesFieldset ){
        comparable = entitiesFieldset.comparable( comparable );
    } else {
        logger.warning( 'entitiesFieldset is null' );
    }
    const recordsFieldset = Records.fieldSet.get();
    if( recordsFieldset ){
        comparable.DYN.closest = recordsFieldset.comparable( comparable.DYN.closest || {} );
        comparable.DYN.records = comparable.DYN.records || [];
        for( let i=0 ; i<comparable.DYN.records.length ; ++i ){
            let rec = comparable.DYN.records[i];
            // after cloneDeep() we no more have ReactiveVar instances
            rec = rec instanceof ReactiveVar ? rec.get() : ( rec.curValue || rec );
            comparable.DYN.records[i] = recordsFieldset.comparable( rec );
        }
    } else {
        logger.warning( 'recordsFieldset is null' );
    }
    return comparable;
};

/**
 * @summary Explain the differences between a and b
 * @param {Object} a a first published item
 * @param {Object} b a second published item
 */
Tenants.explainDifferences = function( a, b ){
    const logEquals = false;
    const logNotEquals = true;
    // create in work a subdocument 'w' with keys starting with a letter from ref, and a subdocument 'wo' with keys which do not start with a letter from ref
    // creating the two members or a dichotomy
    const _fnSplit = function( item, ref, work, prefix ){
        const w = _.cloneDeep( item );
        const wo = _.cloneDeep( item );
        Object.keys( item ).forEach(( key ) => {
            const firstLetter = key.substring( 0, 1 );
            const index = ref.indexOf( firstLetter );
            if( index === -1 ){
                delete wo[key];
            } else {
                delete w[key];
            }
        });
        work[prefix+'_w'] = w;
        work[prefix+'_wo'] = wo;
    };
    const aw = {};
    const bw = {}
    const one = 'abcdefghijklm';
    // are entities sames ?
    let dupa = _.cloneDeep( a );
    let dupb = _.cloneDeep( b );
    delete dupa.DYN;
    delete dupb.DYN;
    let equals = _.isEqual( dupa, dupb );
    if(( equals && logEquals ) || ( !equals && logNotEquals )){
        logger.debug( 'same entities', dupa, dupb, equals );
    }
    // are closest sames ?
    dupa = _.cloneDeep( a.DYN.closest || {} );
    dupb = _.cloneDeep( b.DYN.closest || {} );
    equals = _.isEqual( dupa, dupb );
    if(( equals && logEquals ) || ( !equals && logNotEquals )){
        logger.debug( 'same closest', dupa, dupb, equals );
    }
    // are records same ?
    for( let i=0 ; i<( a.DYN.records || [] ).length ; ++i ){
        dupa = _.cloneDeep(( a.DYN.records || [] )[i] );
        dupb = _.cloneDeep(( b.DYN.records || [] )[i] );
        equals = _.isEqual( dupa, dupb );
        if(( equals && logEquals ) || ( !equals && logNotEquals )){
            logger.debug( 'same records', i, dupa, dupb, equals );
        }
        // if an iteration is not the same, examine each first level key
        if( !equals ){
            Object.keys( dupa ).forEach(( key ) => {
                if( Object.keys( dupb ).includes( key )){
                    const equals = _.isEqual( dupa[key], dupb[key] );
                    if(( equals && logEquals ) || ( !equals && logNotEquals )){
                        logger.debug( key, dupa[key], dupb[key], equals );
                    }
                } else if( logNotEquals ){
                    logger.debug( key+'=\''+dupa[key]+'\' doesn\' exist in dupb' );
                }
            });
        }
    }
    //_fnSplit( a.closest || {}, one, aw, 'one' );
    //_fnSplit( b.closest, one, bw, 'one' );
    //logger.debug( aw.one_w, bw.one_w, _.isEqual( aw.one_w, bw.one_w ));
    //logger.debug( aw.one_wo, bw.one_wo, _.isEqual( aw.one_wo, bw.one_wo ));
};
