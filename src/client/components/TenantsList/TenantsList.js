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
        const res = TenantsManager.isAllowed( 'pwix.tenants_manager.pub.list_all' );
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
    // delete a tenant - this will delete all the validity records too
    'tabular-delete-event .TenantsList'( event, instance, data ){
        const label = data.item.label;
        Meteor.callAsync( 'pwix_tenants_manager_tenants_delete_tenant', data.item.entity )
            .then(( res ) => {
                Tolert.success( pwixI18n.label( I18N, 'delete.success', label ));
            })
            .catch(( e ) => {
                Tolert.error({ type:e.error, message:e.reason });
            });
        return false; // doesn't propagate
    },

    // edit a tenant
    //  the buttons from tabular provide the entity document
    'tabular-edit-event .TenantsList'( event, instance, data ){
        const tenant = TenantsManager.list.byEntity( data.item._id );
        Modal.run({
            ...this,
            mdBody: 'TenantEditPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: this.mdClasses || 'modal-xl',
            mdClassesContent: TenantsManager.configure().classes,
            mdTitle: pwixI18n.label( I18N, 'edit.modal_title', tenant.DYN.closest.label ),
            item: tenant
        });
        return false;
    }
});
