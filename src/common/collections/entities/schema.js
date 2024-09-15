/*
 * pwix:tenants-manager/src/common/collections/entities/schema.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

Tracker.autorun(() => {
    const fieldSet = Entities.fieldSet?.get();
    if( Entities.collectionReady.get() && fieldSet ){
        if( Entities.collection.attachSchema ){
            _verbose( TenantsManager.C.Verbose.ATTACHSCHEMA, '[INFO] attaching schema to Entities.collection' );
            Entities.collection.attachSchema( new SimpleSchema( fieldSet.toSchema()), { replace: true });
            Entities.collection.attachBehaviour( 'timestampable', { replace: true });
        } else {
            _verbose( TenantsManager.C.Verbose.ATTACHSCHEMA, '[WARN] Entities.collection.attachSchema is not a function' );
        }
    }
});
