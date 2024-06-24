/*
 * pwix:tenants-manager/src/client/components/TenantsList/TenantsList.js
 *
 * Parms:
 * - see README
 */

import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/pwix:roles';
import { Tolert } from 'meteor/pwix:tolert';

import { Tenants } from '../../../common/collections/tenants/index.js';

import '../TenantEditPanel/TenantEditPanel.js';

import './TenantsList.html';

Template.TenantsList.onCreated( function(){
    const self = this;

    self.TM = {
        tenants: {
            handle: self.subscribe( 'tenants.listAll' ),
            list: new ReactiveVar( [] )
        }
    };

    // load the tenant's list
    self.autorun(() => {
        if( self.TM.tenants.handle.ready()){
            let tenants = [];
            Tenants.find().forEachAsync(( o ) => {
                tenants.push( o );
            }).then(() => {
                self.TM.tenants.list.set( tenants );
                //console.debug( tenants );
            });
        }
    });
});

Template.TenantsList.helpers({
    // whether the current user has the permission to see the list of tenants
    canList(){
        return TenantsManager.perms.get( 'list' );
    }
});

Template.TenantsList.events({
    // delete a tenant
    'tabular-delete-event .TenantsList'( event, instance, data ){
        const label = data.item.emails.length ? data.item.emails[0].address : data.item._id;
        Meteor.callAsync( 'account.remove', data._id, ( e, res ) => {
            if( e ){
                Tolert.error({ type:e.error, message:e.reason });
            } else {
                Tolert.success( pwixI18n.label( I18N, 'delete.success', label ));
            }
        });
        return false; // doesn't propagate
    },

    // edit a tenant
    'tabular-edit-event .TenantsList'( event, instance, data ){
        Modal.run({
            mdBody: 'TenantEditPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: 'modal-lg',
            mdClassesContent: TenantsManager._conf.classes,
            mdTitle: pwixI18n.label( I18N, 'edit.modal_title' ),
            item: data.item
        });
        return false;
    }
});
