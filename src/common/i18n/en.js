/*
 * pwix:tenants-manager/src/common/i18n/en.js
 */

TenantsManager.i18n = {
    ...TenantsManager.i18n,
    ...{
        en: {
            buttons: {
                delete_title: 'Delete the "%s" tenant',
                edit_title: 'Edit the "%s" tenant',
                info_title: 'Informations about the "%s" tenant record'
            },
            delete: {
                success: 'The "%s" tenant has been successfully deleted'
            },
            edit: {
                modal_title: 'Editing a tenant'
            },
            entities: {
                check: {
                    label_exists: 'The label is already used by another tenant',
                    label_unset: 'Common label is not set'
                },
                edit: {
                    label_label: 'Common label :',
                    label_ph: 'The tenant common label',
                    label_help: ''  // should be taken from the Field description
                },
            },
            list: {
                contact_email_th: 'Contact email',
                contact_page_th: 'Contact page',
                home_page_th: 'Home page',
                label_th: 'Label',
                notes_th: 'Notes'
            },
            new: {
                btn_plus_label: 'New tenant',
                btn_plus_title: 'Define a new tenant',
                modal_title: 'Define a new tenant'
            },
            panel: {
                create_btn: 'Create',
                notes_tab: 'Notes'
            },
            records: {
                panel: {
                    properties_tab: 'Properties'
                },
                properties: {
                    contact_email_label: 'Contact email address :',
                    contact_email_ph: 'contact@example.com',
                    contact_email_title: 'Contact email address',
                    contact_url_label: 'Contact URL :',
                    contact_url_ph: 'https://www.example.com/contact',
                    contact_url_title: 'Contact URL',
                    gtu_label: 'General Terms of Use URL :',
                    gtu_ph: 'https://www.example.com/gtu',
                    gtu_title: 'General Terms of Use URL',
                    home_label: 'Home page URL :',
                    home_ph: 'https://www.example.com',
                    home_title: 'Home page URL',
                    label_label: 'Label :',
                    label_ph: 'A label specific to the validity period',
                    label_title: 'A label specific to the validity period',
                    legals_label: 'Legal Terms URL :',
                    legals_ph: 'https://www.example.com/legals',
                    legals_title: 'Legal Terms URL',
                    pdmp_label: 'Personal Data Policy Management URL :',
                    pdmp_ph: 'https://www.example.com/gdpr',
                    pdmp_title: 'Personal Data Policy Management URL',
                    support_email_label: 'Support email address :',
                    support_email_ph: 'support@example.com',
                    support_email_title: 'Support email address',
                    support_url_label: 'Support URL :',
                    support_url_ph: 'https://www.example.com/support',
                    support_url_title: 'Support URL'
                }
            },
            tabs: {
                entity_properties_title: 'Common properties',
                entity_notes_title: 'Common notes',
                entity_validities_title: 'By validity period(s)',
            },
            tenants: {
                check: {
                }
            }
        }
    }
};
