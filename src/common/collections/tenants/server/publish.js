/*
 * pwix:tenants-manager/src/common/collections/tenants/server/publish.js
 */

import { Validity } from 'meteor/pwix:validity';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

import { Tenants } from '../index.js';

/*
 * returns a cursor of all tenants as a full tenants list, published here as a 'tenants_all' pseudo collection
 *  where each item is a tenant entity, which contains a DYN sub-object with:
 *  - managers: the list of ids of users which are allowed to managed this tenant using a scoped role
 *  - records: the list of validity records for this entity
 */
Meteor.publish( TenantsManager.C.pub.tenantsAll.publish, async function(){
    if( !await Tenants.checks.canList( this.userId )){
        throw new Meteor.Error(
            'Tenants.check.canList',
            'Unallowed to list tenants' );
    }
    const self = this;
    let initializing = true;

    // find ORG_SCOPED_MANAGER allowed users, and add to each entity the list of its records
    const f_transform = async function( item ){
        item.DYN = {
            managers: [],
            records: []
        };
        let promises = [];
        promises.push( Meteor.roleAssignment.find({ 'role._id': 'ORG_SCOPED_MANAGER', scope: item._id }).fetchAsync().then(( fetched ) => {
            fetched.forEach(( it ) => {
                Meteor.users.findOneAsync({ _id: it.user._id }).then(( user ) => {
                    if( user ){
                        item.DYN.managers.push( user );
                    } else {
                        console.warn( 'user not found, but allowed by a scoped role', it.user._id );
                    }
                });
            });
            return true;
        }));
        promises.push( Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            item.DYN.records = fetched;
            return true;
        }));
        return Promise.allSettled( promises ).then(() => {
            return item;
        })
    };

    // in order the same query may be applied on client side, we have to add to item required fields
    const observer = Entities.collection.find({}).observe({
        added: async function( item ){
            self.added( TenantsManager.C.pub.tenantsAll.collection, item._id, await f_transform( item ));
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( TenantsManager.C.pub.tenantsAll.collection, newItem._id, await f_transform( newItem ));
            }
        },
        removed: async function( oldItem ){
            self.removed( TenantsManager.C.pub.tenantsAll.collection, oldItem._id, oldItem );
        }
    });

    initializing = false;

    self.onStop( function(){
        observer.then(( handle ) => { handle.stop(); });
    });

    self.ready();
});

/*
 * returns a cursor of all tenants, to be rendered in the Records tabular display
 * we publish here a 'tenants_tabular' pseudo collection of records where each is the closest record of the entity
 */
/*
Meteor.publish( TenantsManager.C.pub.tenantsList.publish, async function( tableName, ids, fields ){
    if( !await Tenants.checks.canList( this.userId )){
        throw new Meteor.Error(
            'Tenants.check.canList',
            'Unallowed to list tenants' );
    }
    const self = this;
    let initializing = true;
    console.debug( TenantsManager.C.pub.tenantsList.publish, 'arguments', arguments );

    // for each entity 'item', find the closest validity record
    const f_transform = async function( item ){
        return await Records.collection.find({ entity: item._id }).fetchAsync().then(( fetched ) => {
            return Validity.closestByRecords( fetched ).record;
        });
    };

    // in order the same query may be applied on client side, we have to add to item required fields
    const observer = Records.collection.find({}).observe({
        added: async function( item ){
            self.added( Records.collectionName, item._id, await f_transform( item ));
        },
        changed: async function( newItem, oldItem ){
            if( !initializing ){
                self.changed( Records.collectionName, newItem._id, await f_transform( newItem ));
            }
        },
        removed: async function( oldItem ){
            self.removed( Records.collectionName, oldItem._id, oldItem );
        }
    });

    initializing = false;

    self.onStop( function(){
        observer.then(( handle ) => { handle.stop(); });
    });

    self.ready();
});
*/
