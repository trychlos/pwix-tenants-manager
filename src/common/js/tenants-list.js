/*
 * pwix:tenants-manager/src/common/js/tenants-list.js
 *
 * Maintain the application-facing list of tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having its DYN sub-object with DYN.managers and DYN.records arrays (of ReactiveVar's on the client)
 * 
 * This list is intended for application code which needs transformed tenant documents.
 * It is maintained independently from the publications used by the TenantsList tabular component.
 * 
 * Client and server each maintain their own list instance.
 */

import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';

const logger = Logger.get();

TenantsManager.list = {
    _array: new ReactiveVar( [] ),
    _warned: {},

    // returns the entity document and its DYN arrays
    byEntity( entity ){
        //logger.debug( 'byEntity', entity );
        if( !TenantsManager.dataReady()){
            return null;
        }
        const list = TenantsManager.list.get();
        let found = null;
        list.every(( it ) => {
            if( it._id === entity ){
                found = it;
            }
            return found === null;
        });
        if( !found && !TenantsManager.list._warned[entity] ){
            TenantsManager.list._warned[entity] = true,
            logger.warn( 'byEntity() unable to find tenant by entity', entity );
        }
        return found;
    },

    // returns the list content
    // reactive data source
    get(){
        return TenantsManager.list._array.get();
    }
};
