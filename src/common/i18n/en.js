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
                }
            },
            tabs: {
                //ident_title: 'Identity',
            },
            tenants: {
                check: {
                }
            }
        }
    }
};
