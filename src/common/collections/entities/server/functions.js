/*
 * pwix:tenants-manager/src/common/collections/entities/server/functions.js
 *
 * Server-only functions
 */

import { Entities } from '../index.js';

Entities.server = {};

/*
Entities.server.removeAccount = async function( id, userId ){
    let ret = null;
    if( !await TenantsManager.checks.canDelete( userId )){
        throw new Meteor.Error(
            'TenantsManager.check.canDelete',
            'Unallowed to remove "'+id+'" account' );
    }
    try {
        ret = await Meteor.users.removeAsync({ _id: id });
    } catch( e ){
        throw new Meteor.Error(
            'TenantsManager.server.removeAccount',
            'Unable to remove "'+id+'" account' );
    }
    return ret;
};
*/
