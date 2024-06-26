/*
 * pwix:tenants-manager/src/common/collections/entities/server/publish.js
 */

import { Entities } from '../index.js';
import { Tenants } from '../../tenants/index.js';

// returns a cursor of all tenants
// Publish function can only return a Cursor or an array of Cursors
Meteor.publish( 'pwix_tenants_manager_entities_list_all', async function(){
    if( !await Tenants.checks.canList( this.userId )){
        throw new Meteor.Error(
            'Tenants.check.canList',
            'Unallowed to list tenants' );
    }
    return Entities.collection.find();
});
