/*
 * pwix:tenants-manager/src/common/collections/records/collection.js
 */

import _ from 'lodash';

import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

export const Records = {
    collection: null,
    collectionName: null,
    fieldSet: new ReactiveVar( null, _.isEqual )
};

Tracker.autorun(() => {
    const collectionName = TenantsManager.configure().tenantsCollection+'_r';
    check( collectionName, Match.NonEmptyString );
    if( collectionName !== Records.collectionName ){
        Records.collectionName = collectionName;
        Records.collection = new Mongo.Collection( collectionName );
    }
});

TenantsManager.Records = Records;
