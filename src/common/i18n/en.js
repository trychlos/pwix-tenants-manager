/*
 * pwix:tenants-manager/src/common/i18n/en.js
 */

TenantsManager.i18n = {
    ...TenantsManager.i18n,
    ...{
        en: {
            buttons: {
                delete_title: 'Delete the "%s" account',
                edit_title: 'Edit the "%s" account',
                info_title: 'Informations about the "%s" account record'
            },
            check: {
                email_exists: 'This email address already exists',
                email_invalid: 'This email address is not valid',
                email_unset: 'An email address is mandatory',
                username_exists: 'This username already exists'
            },
            delete: {
                success: 'The "%s" has been successfully deleted'
            },
            edit: {
                modal_title: 'Editing an account'
            },
            list: {
                admin_notes_th: 'Admin Notes',
                email_address_th: 'Email address',
                email_verified_th: 'Is verified',
                last_connection_th: 'Last connection',
                login_allowed_th: 'Is connection allowed',
                more_title: 'Display more email addresses...',
                user_notes_th: 'User Notes',
                username_th: 'Username'
            },
            panel: {
                add_title: 'Add an email address',
                email_label: 'Email :',
                email_ph: 'you@example.com',
                last_login_label: 'Last connection :',
                line_valid: 'Whether this line is valid',
                login_allowed_label: 'Is connection allowed :',
                remove_title: 'Remove this email address',
                username_label: 'Username :',
                username_ph: 'John42',
                verified_label: 'Is email verified :'
            },
            tabs: {
                ident_title: 'Identity',
                roles_title: 'Roles'
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
