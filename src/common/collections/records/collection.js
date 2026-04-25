/*
 * pwix:tenants-manager/src/common/collections/records/collection.js
 */

import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

export const Records = {
    collectionName: null,
    fieldSet: new ReactiveVar( null )
};

Tracker.autorun(() => {
    const collectionName = TenantsManager.configure().tenantsCollection+'_r';
    check( collectionName, Match.NonEmptyString );
    Records.collectionName = collectionName;
    Records.collection = new Mongo.Collection( collectionName );
});

TenantsManager.Records = Records;
