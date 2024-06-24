/*
 * pwix:tenants-manager/src/common/js/tabular.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';

import { Tenants } from '../collections/tenants/collection.js';

const _identifier = function( it ){
    return it._id;
};

TenantsManager.tabular = new Tabular.Table({
    name: 'Tenants',
    collection: Tenants,
    columns: TenantsManager.fieldSet.toTabular()
});
