/*
 * pwix:tenants-manager/src/client/components/tm_urls_dt/tm_urls_dt.js
 *
 * This template is used to display the first url of the organization, plus a 'more' button
 * 
 * Only display the first url + the 'more' button
 * The 'more' button is used to display all label+url tuples
 */

import { Logger } from 'meteor/pwix:logger';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';

import '../tm_urls_dialog/tm_urls_dialog.js';

import './tm_urls_dt.html';

const logger = Logger.get();

Template.tm_urls_dt.helpers({
    // have a blue button if active, or gray else
    colorBtnClass(){
        return ( this.item.urls || [] ).length > 0 ? 'btn-outline-primary' : 'btn-outline-secondary';
    },

    // disable the button if zero url address
    disabled(){
        return ( this.item.urls || [] ).length > 0 ? '' : 'disabled';
    },

    // whether we have several url addresses
    haveMore(){
        return ( this.item.urls || [] ).length > 0;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // list the first url address if any
    label(){
        return ( this.item.urls || [] ).length ? this.item.urls[0].label : '';
    },

    // list the first url if any
    url(){
        return ( this.item.urls || [] ).length ? this.item.urls[0].url : '';
    }
});

Template.tm_urls_dt.events({
    'click .tm-more'( event, instance ){
        Modal.run({
            ...this,
            mdBody: 'tm_urls_dialog',
            mdButtons: [ Modal.C.Button.CLOSE ],
            mdClasses: 'modal-lg',
            mdTitle: pwixI18n.label( I18N, 'edit.urls_dialog_title' )
        });
    }
});
