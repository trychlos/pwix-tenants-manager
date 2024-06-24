/*
 * pwix:tenants-manager/src/common/collections/tenants/schema.js
 */

import { Forms } from 'meteor/pwix:forms';
import SimpleSchema from 'meteor/aldeed:simple-schema';

import { Tenants } from './collection.js';

// add behaviours to our collection
Tenants.attachSchema( new SimpleSchema( TenantsManager.fieldSet.toSchema()));
Tenants.attachBehaviour( 'timestampable' );

// extends the above default schema with an application-provided piece
const fieldsSet = TenantsManager._conf.fieldsSet;
if( fieldsSet ){
    if( typeof fieldsSet === 'function' ){
        const o = fieldsSet();
        check( o, Forms.FieldsSet );
        Tenants.attachSchema( new SimpleSchema( o ));
    } else if( fieldsSet instanceof Forms.FieldsSet ){
        Tenants.attachSchema( new SimpleSchema( schema ));
    } else {
        console.error( 'expected a function or a FieldsSet, found', fieldsSet );
    }
}
