/*
 * pwix:accounts-manager/src/client/components/TenantNewButton/TenantNewButton.js
 *
 * Let the accounts manager create a new account.
 *
 * Parms:
 *  - none, though all plusButton parameters will be passed through
 */

import _ from 'lodash';

import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';

import '../TenantEditPanel/TenantEditPanel.js';

import './TenantNewButton.html';

Template.TenantNewButton.helpers({
    // whether the user is allowed to create new account
    canCreate(){
        return AccountsManager.perms.get( 'create' );
    },

    // parms for new tenant (plusButton)
    parmsNewTenant(){
        const parms = { ...this };
        if( !parms.label ){
            parms.label = pwixI18n.label( I18N, 'new.btn_plus_label' );
        }
        if( !parms.title ){
            parms.title = pwixI18n.label( I18N, 'new.btn_plus_title' );
        };
        return parms;
    }
});

Template.TenantNewButton.events({
    'click .plusButton'( event, instance ){
        Modal.run({
            mdBody: 'TenantEditPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: 'modal-lg',
            mdClassesContent: TenantsManager.configure().classes,
            mdTitle: pwixI18n.label( I18N, 'new.modal_title' ),
            item: null
        });
        return false;
    }
});
