/*
 * pwix:tenants-manager/src/common/collections/tenants/accounts.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';

// add behaviours to our collection
//Meteor.users.attachSchema( TenantsManager.fieldsSet.toSchema());
//Meteor.users.attachBehaviour( 'timestampable' );

// extends the above default schema with an application-provided piece
/*
const schema = TenantsManager._conf.schema;
if( schema ){
    if( typeof schema === 'function' ){
        const o = schema();
        check( o, Object );
        Meteor.users.attachSchema( new SimpleSchema( o ));
    } else if( typeof schema === 'Object' ){
        Meteor.users.attachSchema( new SimpleSchema( schema ));
    } else {
        console.error( 'expected a function or an Object, found', schema );
    }
}
*/