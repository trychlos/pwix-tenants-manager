/*
 * pwix:tenants-manager/src/common/collections/records/tabular.js
 *
 * Though the Tabular display is primarily driven by Entities, it is defined in the Records collection as most (if not all) data come from there.
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';
import { Tracker } from 'meteor/tracker';

import { Records } from './index.js';

const _identifier = function( it ){
    return it.label;
};

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    if( Records.collectionReady.get() && Records.fieldSet.get()){
        Records.tabular = new Tabular.Table({
            name: 'Records',
            collection: Records.collection,
            columns: Records.fieldSet.get().toTabular(),
            tabular: {
                // display the organization label instead of the identifier in the button title
                deleteButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.delete_title', _identifier( it ));
                },
                editButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.edit_title', _identifier( it ));
                },
                infoButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_title', _identifier( it ));
                }
            },
            destroy: true
        });
    }
});
