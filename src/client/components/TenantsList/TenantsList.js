/*
 * pwix:tenants-manager/src/client/components/TenantsList/TenantsList.js
 *
 * Parms:
 * - see README
 */

import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tolert } from 'meteor/pwix:tolert';

import '../TenantEditPanel/TenantEditPanel.js';

import './TenantsList.html';

Template.TenantsList.helpers({
    // whether the current user has the permission to see the list of tenants
    canList(){
        return TenantsManager.perms.get( 'list' );
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
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
