/*
 * pwix:tenants-manager/src/common/js/constants.js
 */

TenantsManager.C = {

    // publication names and the collection they publish
    pub: {
        tenantsAll: {
            collection: 'tenants_all',
            publish: 'pwix_tenants_manager_tenants_list_all'
        }
    },

    // verbosity levels
    Verbose: {
        NONE: 0,
        CONFIGURE:      0x01 <<  0,
        FUNCTIONS:      0x01 <<  1
    }
};

// non exported variables

I18N = 'pwix:tenants-manager:i18n:namespace';
