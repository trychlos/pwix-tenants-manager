/*
 * pwix:tenants-manager/src/common/collections/entities/collection.js
 */

import { Logger } from 'meteor/pwix:logger';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import '../../js/index.js';

const logger = Logger.get();

export const Entities = {
    collectionReady: new ReactiveVar( false ),
    fieldSet: new ReactiveVar( null )
};

Tracker.autorun(() => {
    const collectionName = TenantsManager.configure().tenantsCollection+'_e';
    const ready = Entities.collectionReady.get();
    if( collectionName && !ready ){
        Entities.collectionName = collectionName;
        Entities.collection = new Mongo.Collection( collectionName );
        Entities.collectionReady.set( true );
    }
});

Tracker.autorun(() => {
    //logger.debug( 'Entities.collectionReady', Entities.collectionReady.get());
});

TenantsManager.Entities = Entities;
