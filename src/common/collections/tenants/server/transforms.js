/*
 * pwix:tenants-manager/src/common/collections/tenants/server/transforms.js
 *
 * These are transformation functions which are only called-from and executed server-side.
 */

import _ from 'lodash';

import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from '../index.js';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

const logger = Logger.get();

Tenants.Transforms = {
    _publish: {
    },
    _read: [
    ],
    _update: [
    ],

    // add a DYN sub-object to documents sent to the client
    // @param {Object} itemDoc
    //  read transformation
    //  publish transformation
    async addDyn( itemDoc, options={} ){
        check( itemDoc, Object );
        check( options, Object );
        itemDoc.DYN = itemDoc.DYN || {};
        return itemDoc;
    },

    // add the list of ids of users which are allowed to managed this tenant using the configured scoped role
    // @param {Object} itemDoc an entity document
    //  read transformation
    //  publish transformation
    async addManagersFromEntity( itemDoc, options={} ){
        check( itemDoc, Match.ObjectIncluding({ DYN: Object }));
        check( options, Object );
        itemDoc.DYN.managers = await Tenants.s.getManagers( itemDoc._id );
        return itemDoc;
    },

    // add the list of all validity records + the closest one
    // @param {Object} itemDoc an entity document
    //  read transformation
    //  publish transformation
    async addRecordsFromEntity( itemDoc, options={} ){
        check( itemDoc, Match.ObjectIncluding({ DYN: Object }));
        check( options, Object );
        const fetched = await Records.collection.find({ entity: itemDoc._id }).fetchAsync();
        itemDoc.DYN.records = fetched;
        itemDoc.DYN.closest = Validity.closestByRecords( fetched ).record;
        return itemDoc;
    },

    // when publishing for tabular display, we try to identify the fields which are different between validity records
    //  so that they will be displayed with a specific class on client side
    // This must be run *after* the addRecords() transformation
    // @param {Object} itemDoc the closest record
    //  publish transformation for tabular
    async addTabularAnalyze( itemDoc, options={} ){
        check( itemDoc, Match.ObjectIncluding({ DYN: Match.ObjectIncluding({ records: [Object] }) }));
        check( options, Object );
        itemDoc.DYN.analyze = Validity.analyzeByRecords( itemDoc.DYN.records );
        return itemDoc;
    },

    // when publishing for tabular display, we add the englobing start and end dates
    // This must be run *after* the addRecords() transformation
    // @param {Object} itemDoc the closest record
    //  publish transformation for tabular
    async addTabularEnglobingPeriod( itemDoc, options={} ){
        check( itemDoc, Match.ObjectIncluding({ DYN: Match.ObjectIncluding({ records: [Object] }) }));
        check( options, Object );
        const res = Validity.englobingPeriodByRecords( itemDoc.DYN.records );
        itemDoc.DYN.effectStart = res.start;
        itemDoc.DYN.effectEnd = res.end;
        return itemDoc;
    },

    // when publishing for tabular display, we install the relevant entity and its managers for this record
    // This must be run *after* the addRecords() transformation
    // @param {Object} itemDoc the closest record
    //  publish transformation for tabular
    async addTabularEntity( itemDoc, options={} ){
        check( itemDoc, Match.ObjectIncluding({ DYN: Object }));
        check( options, Object );
        itemDoc.DYN.entity = await Entities.collection.findOneAsync({ _id: itemDoc.entity });
        itemDoc.DYN.managers = await Tenants.s.getManagers( itemDoc.entity );
        return itemDoc;
    },

    // add the list of all validity records + the closest one
    // @param {Object} itemDoc a record document
    //  publish transformation for tabular
    async addTabularRecords( itemDoc, options={} ){
        check( itemDoc, Match.ObjectIncluding({ DYN: Object }));
        check( options, Object );
        const fetched = await Records.collection.find({ entity: itemDoc.entity }).fetchAsync();
        itemDoc.DYN.records = fetched;
        return itemDoc;
    },

    // make sure that each defined field appears in the returned item, as least as 'undefined' when unset
    // Rationale: when a publication send a record where not all fields are set, the unset fields are just not part of the sent document
    //  on client-side, the field which is not present is not modified in the minimongo
    //  in tabular displays, field presence is not affected
    //  e.g. notes indicator in tabular display doesn't disappear when the unset 'notes' field is not published
    //  => so the reason fo why the 'notes' field must be published as undefined
    // see https://docs.meteor.com/api/meteor#Subscription-changed
    //  publish transformation
    async addUndefined( itemDoc, options={} ){
        check( itemDoc, Object );
        check( options, Object );
        for( const name of Tenants.fieldSet.get().names()){
            if( name.indexOf( '.' ) === -1 && !Object.keys( itemDoc ).includes( name )){
                itemDoc[name] = undefined;
            }
        }
        return itemDoc;
    },

    // remove the DYN sub-object so that it doesn't go to the database
    //  update transformation
    async removeDyn( itemDoc, options={} ){
        const clone = _.cloneDeep( itemDoc );
        delete clone.DYN;
        return clone;
    }
};

// at evaluation time, setup the initial transformations

//for( const pub of [ TenantsManager.C.pub.tenantsAll.publish, TenantsManager.C.pub.closests.publish, pwix.TenantsManager.p.Tenants.tabularLast, TenantsManager.C.pub.getScopes.publish, TenantsManager.C.pub.selecting.publish ])

Tenants.Transforms._read.push( Tenants.Transforms.addDyn );
Tenants.Transforms._read.push( Tenants.Transforms.addManagersFromEntity );
Tenants.Transforms._read.push( Tenants.Transforms.addRecordsFromEntity );

for( const pub of [ TenantsManager.C.pub.tenantsAll.publish ]){
    Tenants.Transforms._publish[pub] = _.cloneDeep( Tenants.Transforms._read );
}

// tabular display needs its own transformations because publication is driven from the closest record rather than by entity
// only the tabular publication is interested in undefined fields
for( const pub of [ 'pwix.TenantsManager.p.Tenants.tabularLast' ]){
    Tenants.Transforms._publish[pub] = [];
    Tenants.Transforms._publish[pub].push( Tenants.Transforms.addDyn );
    Tenants.Transforms._publish[pub].push( Tenants.Transforms.addTabularEntity );
    Tenants.Transforms._publish[pub].push( Tenants.Transforms.addTabularRecords );
    Tenants.Transforms._publish[pub].push( Tenants.Transforms.addTabularAnalyze );
    Tenants.Transforms._publish[pub].push( Tenants.Transforms.addTabularEnglobingPeriod );
    Tenants.Transforms._publish[pub].push( Tenants.Transforms.addUndefined );
}

Tenants.Transforms._update.push( Tenants.Transforms.removeDyn );
