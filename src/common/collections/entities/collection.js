/*
 * pwix:tenants-manager/src/common/collections/entities/collection.js
 */

import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

export const Entities = {
    collectionName: null,
    fieldSet: new ReactiveVar( null )
};

Tracker.autorun(() => {
    const collectionName = TenantsManager.configure().tenantsCollection+'_e';
    check( collectionName, Match.NonEmptyString );
    Entities.collectionName = collectionName;
    Entities.collection = new Mongo.Collection( collectionName );
});

TenantsManager.Entities = Entities;
