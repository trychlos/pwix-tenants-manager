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

TenantsManager.Entities = Entities;
