/*
 * pwix:tenants-manager/src/client/components/TenantsList/TenantsList.js
 *
 * Parms:
 * - see README
 */

import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';

import { Tenants } from '../../../common/collections/tenants/index.js';

import '../TenantEditPanel/TenantEditPanel.js';

import './TenantsList.html';

Template.TenantsList.onCreated( function(){
    const self = this;

    self.TM = {
        closests: new ReactiveVar( [] ),
        handle: self.subscribe( TenantsManager.C.pub.closests.publish )
    };

    // subscribe to the ad-hoc publication to get the list of closest ids
    self.autorun(() => {
        if( self.TM.handle.ready()){
            let closests = [];
            TenantsManager.collections.get( TenantsManager.C.pub.closests.collection ).find().fetchAsync().then(( fetched ) => {
                fetched.forEach(( it ) => {
                    closests.push( it._id );
                });
                self.TM.closests.set( closests );
            });
        }
    });
});

Template.TenantsList.helpers({
    // whether the current user has the permission to see the list of tenants
    canList(){
        const res = TenantsManager.perms.get( 'list' );
        //console.debug( 'res', res );
        return res;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // a display selector
    selector(){
        const selector = { _id: {}};
        selector._id.$in = Template.instance().TM.closests.get();
        return selector;
},

    // tabular identifier
    tabularId(){
        return TABULAR_ID;
    }
});

Template.TenantsList.events({
    // delete a tenant - this will delete all the validity records
    'tabular-delete-event .TenantsList'( event, instance, data ){
        /*
        const label = data.item.emails.length ? data.item.emails[0].address : data.item._id;
        Meteor.callAsync( 'account.remove', data._id, ( e, res ) => {
            if( e ){
                Tolert.error({ type:e.error, message:e.reason });
            } else {
                Tolert.success( pwixI18n.label( I18N, 'delete.success', label ));
            }
        });
        */
        return false; // doesn't propagate
    },

    // edit a tenant
    //  the buttons from tabular provide the entity document
    'tabular-edit-event .TenantsList'( event, instance, data ){
        Modal.run({
            mdBody: 'TenantEditPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: 'modal-xl',
            mdClassesContent: TenantsManager.configure().classes,
            mdTitle: pwixI18n.label( I18N, 'edit.modal_title' ),
            item: TenantsManager.list.byEntity( data.item._id )
        });
        return false;
    }
});
