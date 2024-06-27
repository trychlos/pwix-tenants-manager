/*
 * pwix:tenants-manager/src/common/collections/tenants/server/publish.js
 */

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

import { Tenants } from '../index.js';

// returns a cursor of all tenants, to be rendered in the Entities tabular display
// we publish here a 'tenants_all' pseudo collection
//  where each item is a tenant entity, which contains a DYN sub-object with:
//  - managers: the list of ids of users which are allowed to managed this tenant using a scoped role
//  - records: the list of validity records for this entity
Meteor.publish( 'pwix_tenants_manager_tenants_list_all', async function(){
    if( !await Tenants.checks.canList( this.userId )){
        throw new Meteor.Error(
            'Tenants.check.canList',
            'Unallowed to list tenants' );
    }
    const self = this;
    const collection_name = 'tenants_all';

    // find ORG_SCOPED_MANAGER allowed users, and add to each entity the list of its records
    const f_transform = function( item ){
        item.DYN = {
            managers: [],
            records: []
        };
        Meteor.roleAssignment.find({ 'role._id': 'ORG_SCOPED_MANAGER', scope: item._id }).fetchAsync().then(( fetched ) => {
            fetched.forEach(( it ) => {
                Meteor.users.findOneAsync({ _id: it.user._id }).then(( user ) => {
                    if( user ){
                        item.DYN.managers.push( user );
                    } else {
                        console.warn( 'user not found, but allowed by a scoped role', it.user._id );
                    }
                });
            });
        });
        Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            item.DYN.records = fetched;
        });
        return item;
    };

    // in order the same query may be applied on client side, we have to add to item required fields
    const observer = Entities.collection.find({}).observe({
        added: function( item ){
            self.added( collection_name, item._id, f_transform( item ));
        },
        changed: function( newItem, oldItem ){
            self.changed( collection_name, newItem._id, f_transform( newItem ));
        },
        removed: function( oldItem ){
            self.removed( collection_name, oldItem._id, oldItem );
        }
    });

    self.onStop( function(){
        observer.then(( handle ) => { handle.stop(); });
    });

    self.ready();
});
