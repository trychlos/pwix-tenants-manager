/*
 * pwix:tenants-manager/src/common/collections/records/collection.js
 */

import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

export const Records = {
    collectionReady: new ReactiveVar( false ),
    fieldSet: new ReactiveVar( null )
};

Tracker.autorun(() => {
    const collectionName = TenantsManager.configure().tenantsCollection+'_r';
    const ready = Records.collectionReady.get();
    if( collectionName && !ready ){
        Records.collectionName = collectionName;
        Records.collection = new Mongo.Collection( collectionName );
        Records.collectionReady.set( true );
    }
});

console.debug( 'defining Records' );
