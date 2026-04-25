/*
 * pwix:tenants-manager/src/common/js/constants.js
 */

TenantsManager.C = {

    // publication names and the collection they publish
    pub: {
        closests: {
            collection: 'pwix_tenants_manager_closests_ids',
            publish: 'pwix.TenantsManager.p.Tenants.closests'
        },
        getScopes: {
            collection: 'pwix_tenants_manager_get_scopes',
            publish: 'pwix.TenantsManager.p.Tenants.getScopes'
        },
        selecting: {
            collection: 'pwix_tenants_manager_selecting',
            publish: 'pwix.TenantsManager.p.Tenants.selecting'
        },
        tabular: {
            collection: 'pwix_tenants_manager_tenants_tabular_last',
            publish: 'pwix.TenantsManager.p.Tenants.TabularLast'
        },
        tenantsAll: {
            collection: 'pwix_tenants_manager_tenants_all',
            publish: 'pwix.TenantsManager.p.Tenants.listAll'
        }
    },

    // verbosity levels
    Verbose: {
        NONE: 0,
        CONFIGURE:      0x01 <<  0,
        FUNCTIONS:      0x01 <<  1,
        ATTACHSCHEMA:   0x01 <<  2
    }
};

// non exported variables

// tabular identifier
TABULAR_ID = 'pwix:tenants-manager/tabular';

// i18n namespace
I18N = 'pwix:tenants-manager:i18n:namespace';
