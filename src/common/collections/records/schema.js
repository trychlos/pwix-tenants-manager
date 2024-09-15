/*
 * pwix:tenants-manager/src/common/collections/records/schema.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { Records } from './index.js';

Tracker.autorun(() => {
    const fieldSet = Records.fieldSet?.get();
    if( Records.collectionReady.get() && fieldSet ){
        if( Records.collection.attachSchema ){
            _verbose( TenantsManager.C.Verbose.ATTACHSCHEMA, '[INFO] attaching schema to Records.collection' );
            Records.collection.attachSchema( new SimpleSchema( fieldSet.toSchema()), { replace: true });
            Records.collection.attachBehaviour( 'timestampable', { replace: true });
        } else {
            _verbose( TenantsManager.C.Verbose.ATTACHSCHEMA, '[WARN] Records.collection.attachSchema is not a function' );
        }
    }
});
