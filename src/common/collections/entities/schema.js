/*
 * pwix:tenants-manager/src/common/collections/entities/schema.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

Tracker.autorun(() => {
    if( Entities.collectionReady.get()){
        Entities.collection.attachSchema( new SimpleSchema( Entities.fieldSet?.get().toSchema()), { replace: true });
        if( !Entities.timestampableAttached ){
            Entities.collection.attachBehaviour( 'timestampable' );
            Entities.timestampableAttached = true;
        }
    }
});
