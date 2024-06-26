/*
 * pwix:tenants-manager/src/common/js/entities-tabular.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';

import { Entities } from '../collections/entities/index.js';

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    if( Entities.collectionReady.get() && Entities.fieldSet.get()){
        Entities.tabular = new Tabular.Table({
            name: 'Entities',
            collection: Entities.collection,
            columns: Entities.fieldSet.get().toTabular(),
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
