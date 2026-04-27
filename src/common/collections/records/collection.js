/*
 * pwix:tenants-manager/src/common/collections/records/collection.js
 */

import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

export const Records = {
    collection: null,
    collectionName: null,
    fieldSet: new ReactiveVar( null ),
    status: new ReactiveDict()
};

// recompute the collection name each time the package is reconfigured
Tracker.autorun(() => {
    const collectionName = TenantsManager.configure().tenantsCollection+'_r';
    check( collectionName, Match.NonEmptyString );
    if( collectionName !== Records.collectionName ){
        Records.collectionName = collectionName;
        Records.collection = new Mongo.Collection( collectionName );
        Records.status.set( 'haveCollection', true );
        Records.status.set( 'haveFieldset', false );
        Records.status.set( 'haveSchema', false );
    }
});

TenantsManager.Records = Records;
