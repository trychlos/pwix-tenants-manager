/*
 * pwix:tenants-manager/src/client/components/tm_email_addresses_dt/tm_email_addresses_dt.js
 *
 * This template is used to display the first email address of the organization, plus a 'more' button
 * 
 * Only display the first email address + the 'more' button
 * The 'more' button is used to display all label+address tuples
 */

import { Logger } from 'meteor/pwix:logger';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';

import '../tm_email_addresses_dialog/tm_email_addresses_dialog.js';

import './tm_email_addresses_dt.html';

const logger = Logger.get();

Template.tm_email_addresses_dt.helpers({
    // list the first email address if any
    address(){
        return ( this.item.emails || [] ).length ? this.item.emails[0].email : '';
    },

    // have a blue button if active, or gray else
    colorBtnClass(){
        return ( this.item.emails || [] ).length > 0 ? 'btn-outline-primary' : 'btn-outline-secondary';
    },

    // disable the button if zero email address
    disabled(){
        return ( this.item.emails || [] ).length > 0 ? '' : 'disabled';
    },

    // whether we have several email addresses
    haveMore(){
        return ( this.item.emails || [] ).length > 0;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // whether we want display the 'more' button
    showMore(){
        const showIfEmpty = TenantsManager.configure().showEmptyGeneralizedUrls;
        const haveItems = Boolean(( this.item.urls || [] ).length > 0 );
        return haveItems || showIfEmpty;
    },

    // list the first email address if any
    label(){
        return ( this.item.emails || [] ).length ? this.item.emails[0].label : '';
    }
});

Template.tm_email_addresses_dt.events({
    'click .tm-more'( event, instance ){
        Modal.run({
            ...this,
            mdBody: 'tm_email_addresses_dialog',
            mdButtons: [ Modal.C.Button.CLOSE ],
            mdClasses: 'modal-lg',
            mdTitle: pwixI18n.label( I18N, 'edit.emails_dialog_title' )
        });
    }
});
