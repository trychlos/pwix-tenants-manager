/*
 * pwix:tenants-manager/src/common/collections/entities/collection.js
 */

import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

export const Entities = {
    collection: null,
    collectionName: null,
    fieldSet: new ReactiveVar( null ),
    status: new ReactiveDict()
};

// recompute the collection name each time the package is reconfigured
Tracker.autorun(() => {
    const collectionName = TenantsManager.configure().tenantsCollection+'_e';
    check( collectionName, Match.NonEmptyString );
    if( collectionName !== Entities.collectionName ){
        Entities.collectionName = collectionName;
        Entities.collection = new Mongo.Collection( collectionName );
        Entities.status.set( 'haveCollection', true );
        Entities.status.set( 'haveFieldset', false );
        Entities.status.set( 'haveSchema', false );
    }
});

TenantsManager.Entities = Entities;
