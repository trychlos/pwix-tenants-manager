/*
 * pwix:tenants-manager/src/common/i18n/en.js
 */

TenantsManager.i18n = {
    ...TenantsManager.i18n,
    ...{
        en: {
            buttons: {
                count_badge_title: 'The "%s" tenant has %s validity periods',
                delete_title: 'Delete the "%s" tenant',
                edit_title: 'Edit the "%s" tenant',
                info_modal: 'Informations about the "%s" tenant',
                info_title: 'Informations about the "%s" tenant'
            },
            delete: {
                confirmation_text: 'You are about to delete the "%s" tenant.<br />Are you sure ?',
                confirmation_title: 'Deleting a tenant',
                success: 'The "%s" tenant has been successfully deleted'
            },
            edit: {
                edit_success: 'The tenant "%s" has been successfully updated',
                error: 'An unknown error unfortunately occurred. Please retry later',
                modal_title: 'Editing the "%s" tenant',
                new_success: 'The tenant "%s" has been successfully created'
            },
            list: {
                contact_email_th: 'Contact email',
                contact_page_th: 'Contact page',
                effect_end_th: 'Last ending',
                entity_notes_th: 'Tenant notes',
                home_page_th: 'Home page',
                label_th: 'Label',
                not_allowed: '<p>You are unfortunately not allowed to list the tenants.</p>'
                    +'<p>Please contact the application administrator.</p>',
                notes_th: 'Notes',
                effect_start_th: 'First starting',
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
                check: {
                    contact_email_invalid: 'The contact email address is invalid',
                    contact_url_invalid: 'The contact page URL is invalid',
                    gtu_url_invalid: 'The General Terms of Use page URL is invalid',
                    home_url_invalid: 'The home page URL is invalid',
                    label_exists: 'The label is already used by another tenant',
                    label_unset: 'The label is not set',
                    legals_url_invalid: 'The Legals page URL is invalid',
                    logo_url_invalid: 'The logo URL is invalid',
                    pdmp_url_invalid: 'The Personal Data Management Policy page URL is invalid',
                    support_email_invalid: 'The support email address is invalid',
                    support_url_invalid: 'The support page URL is invalid'
                },
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
                    logo_label: 'Logo URL :',
                    logo_ph: 'https://www.example.com/logo',
                    logo_title: 'Logo image URL',
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
