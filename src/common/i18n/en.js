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
            entity: {
                check: {
                    label_unset: 'Label is not set (but maybe should ?)'
                }
            },
            list: {
                contact_email_th: 'Contact',
                homepage_th: 'Home',
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
            },
            tabs: {
                //ident_title: 'Identity',
            }
        /*
            accounts: {
                manager: {
                    allowed_th: 'Login allowed',
                    api_allowed_th: 'API allowed',
                    btn_plus_label: 'New account',
                    btn_plus_title: 'Define a new account',
                    delete_btn: 'Delete the "%s" account',
                    delete_confirm: 'You are about to delete the "%s" account.<br />Are you sure ?',
                    delete_title: 'Deleting an account',
                    edit_btn: 'Edit the "%s" account',
                    email_th: 'Email address',
                    ident_title: 'Identity',
                    last_th: 'Last seen',
                    new_title: 'Defining a new account',
                    preamble: 'Register and manage here the accounts allowed to connect to the applications.',
                    roles_btn: 'Edit the roles',
                    roles_th: 'Roles',
                    set_allowed_false: 'The "%s" email address is no more allowed to log in',
                    set_allowed_true: 'The "%s" email address is now allowed to log in',
                    set_api_allowed_false: 'The "%s" email address is no more allowed to access the API',
                    set_api_allowed_true: 'The "%s" email address is now allowed to access the API',
                    set_verified_false: 'The "%s" email address has been reset as "not verified"',
                    set_verified_true: 'The "%s" email address has been set as "verified"',
                    settings_title: 'Settings',
                    tab_title: 'Accounts Management',
                    total_count: '%s registered account(s)',
                    username_th: 'Username',
                    verified_th: 'Verified',
                    verify_resend: 'Resend an email verification link',
                    verify_sent: 'Email verification link has been sent'
                },
                panel: {
                    add_title: 'Add a role',
                    allowed_label: 'Is login allowed',
                    api_allowed_label: 'Is API allowed',
                    email_label: 'Email:',
                    email_ph: 'you@example.com',
                    line_valid: 'Whether this line is valid',
                    no_role: 'No selected role',
                    remove_title: 'Remove this role',
                    role_option: 'Choose a role',
                    role_th: 'Role',
                    scope_th: 'Scope',
                    select_title: 'Select desired accounts',
                    settings_preamble: 'A placeholder for various settings available to the user',
                    username_label: 'Username:',
                    username_ph: 'An optional username',
                    verified_label: 'Is email verified',
                    with_scope: 'Select a scope',
                    without_scope: 'Role is not scoped'
                }
            }
            */
        }
    }
};
