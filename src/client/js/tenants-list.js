/*
 * pwix:tenants-manager/src/client/js/tenants-list.js
 *
 * Maintain the list of the tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having its DYN sub-object with DYN.managers and DYN.records arrays
 * 
 * The DYN.managers array is provided by a server transformation.
 * We replace it with a reactive subscription to the Roles corresponding publication, so that - at least on client-side - the DYN.managers is reactive.
 */

import { Logger } from 'meteor/pwix:logger';
import { Tracker } from 'meteor/tracker';

import { setDataReady } from '../../common/js/data-ready.js';

const logger = Logger.get();
const self = TenantsManager.list;
let _tenantsHandle = null;
let _tenantsObserver = null;
let _subscriptionUserId = undefined;
let _fetchGeneration = 0;
let _listFetchSequence = 0;
let _lastUserId = undefined;

// client-side: keep the tenant subscription scoped to the current login

Tracker.autorun(() => {
    const userId = Meteor.userId();
    const loggingIn = Meteor.loggingIn();

    if( _subscriptionUserId !== userId ){
        _subscriptionUserId = userId;
        _fetchGeneration += 1;
        if( _tenantsHandle ){
            _tenantsHandle.stop();
            _tenantsHandle = null;
        }
        if( _tenantsObserver ){
            _tenantsObserver.stop();
            _tenantsObserver = null;
        }
    }

    const generation = _fetchGeneration;

    if( _lastUserId !== userId ){
        _lastUserId = userId;
        self._array.set( [] );
        setDataReady( false );
    }

    if( loggingIn ){
        self._array.set( [] );
        setDataReady( false );
        return;
    }

    if( userId && !_tenantsHandle ){
        Tracker.nonreactive(() => {
            _tenantsHandle = Meteor.subscribe( TenantsManager.C.pub.tenantsAll.publish );
        });
    }

    if( userId && ( !_tenantsHandle || !_tenantsHandle.ready())){
        setDataReady( false );
        return;
    }

    if( !userId ){
        self._array.set( [] );
        setDataReady( true );
        return;
    }

    const collection = TenantsManager.collections.get( TenantsManager.C.pub.tenantsAll.collection );
    const refreshList = async function(){
        const sequence = ++_listFetchSequence;
        if( generation !== _fetchGeneration || userId !== Meteor.userId() || Meteor.loggingIn()){
            return;
        }
        try {
            const fetched = await collection.find().fetchAsync();
            if( sequence !== _listFetchSequence || generation !== _fetchGeneration || userId !== Meteor.userId() || Meteor.loggingIn()){
                return;
            }
            logger.debug( 'tenants', fetched );
            self._array.set( fetched );
            setDataReady( true );
        } catch( error ){
            if( sequence === _listFetchSequence && generation === _fetchGeneration && userId === Meteor.userId() && !Meteor.loggingIn()){
                logger.error( 'unable to fetch tenant data', error );
                setDataReady( false );
            }
        }
    };

    if( !_tenantsObserver ){
        let initializing = true;
        const onTenantChange = function(){
            if( !initializing ){
                refreshList();
            }
        };
        _tenantsObserver = collection.find().observeChanges({
            added: onTenantChange,
            changed: onTenantChange,
            removed: onTenantChange
        });
        initializing = false;
    }
    refreshList();
});

