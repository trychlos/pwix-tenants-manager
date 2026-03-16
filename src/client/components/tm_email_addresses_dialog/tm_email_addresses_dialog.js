/*
 * /imports/client/components/tm_email_addresses_dialog/tm_email_addresses_dialog.js
 *
 * A modal dialog to display all the email addresses.
 * 
 * Parms:
 * - item: the closest item as displayed in the tabular list
 */

import _ from 'lodash';
import { strict as assert } from 'node:assert';

import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';

import '../tm_email_row/tm_email_row.js';

import './tm_email_addresses_dialog.html';

const logger = Logger.get();

Template.tm_email_addresses_dialog.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // emails list
    itemsList(){
        const list = this.item.emails || [];
        return list;
    },

    // passes the same data context
    parmsRow( it ){
        const parms = {
            it: it,
            edit: false
        };
        return parms;
    },
});
