/*
 * pwix:tenants-manager/src/common/collections/entities/server/publish.js
 */

import { Entities } from '../index.js';

// returns a cursor of all tenants
// Publish function can only return a Cursor or an array of Cursors
Meteor.publish( 'pwix_tenants_manager_entities_list_all', async function(){
    if( !await Entities.checks.canList( this.userId )){
        throw new Meteor.Error(
            'Entities.check.canList',
            'Unallowed to list entities' );
    }
    return Entities.collection.find();
});
