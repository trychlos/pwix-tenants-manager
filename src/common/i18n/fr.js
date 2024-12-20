/*
 * pwix:tenants-manager/src/common/i18n/fr.js
 */

TenantsManager.i18n = {
    ...TenantsManager.i18n,
    ...{
        fr: {
            buttons: {
                count_badge_title: 'Le tenant "%s" a %s périodes de validité',
                delete_title: 'Supprime le tenant "%s"',
                edit_title: 'Edite le tenant "%s"',
                info_title: 'Informations sur le tenant "%s"'
            },
            delete: {
                confirmation_text: 'Vous êtes sur le point de supprimer le tenant "%s".<br />Etes-vous sûr ?',
                confirmation_title: 'Supprimer un tenant',
                success: 'Le tenant "%s" a été supprimé avec succès'
            },
            edit: {
                edit_success: 'Le tenant "%s" a été mis à jour avec succès',
                error: 'Une erreur s\'est malheureusement produite. Merci de réessayer ultérieurement',
                modal_title: 'Editer un tenant',
                new_success: 'Le tenant "%s"  été créé avec succès'
            },
            list: {
                contact_email_th: 'Contact',
                contact_page_th: 'Page de contact',
                effect_end_th: 'Au',
                entity_notes_th: 'Notes du tenant',
                home_page_th: 'Site principal',
                label_th: 'Label',
                managers_th: 'Managers',
                notes_th: 'Notes',
                not_allowed: '<p>Vous n\'êtes malheureusement pas autorisé à consulter la liste des tenants.</p>'
                    +'<p>Merci de vous rapprocher de l\'administrateur de l\'application.<p>',
                effect_start_th: 'Du',
            },
            new: {
                btn_plus_label: 'Nouveau tenant',
                btn_plus_title: 'Définit un nouveau tenant',
                modal_title: 'Crée un nouveau tenant'
            },
            panel: {
                create_btn: 'Nouveau',
                notes_tab: 'Notes',
                roles_preamble: 'Gérez ici les comptes utilisateur de l\'application qui ont un rôle sur le périmètre de ce tenant.'
            },
            records: {
                check: {
                    contact_email_invalid: 'L\'adresse de contact est invalide',
                    contact_url_invalid: 'L\'URL de la page de contact est invalide',
                    gtu_url_invalid: 'L\'URL de la page des Conditions Générales d\'Utilisation est invalide',
                    home_url_invalid: 'L\'URL de la page d\'accueil est invalide',
                    label_exists: 'L\'intitulé est déjà utilisé par un autre tenant',
                    label_unset: 'L\'intitulé n\'est pas renseigné',
                    legals_url_invalid: 'L\'URL de la page des informations légales est invalide',
                    logo_url_invalid: 'L\'URL du logo est invalide',
                    pdmp_url_invalid: 'L\'URL de la page de description de la Politique de Protection des Données Personnelles est invalide',
                    support_email_invalid: 'L\'adresse de support est invalide',
                    support_url_invalid: 'L\'URL de la page de support est invalide'
                },
                panel: {
                    properties_tab: 'Propriétés'
                },
                properties: {
                    contact_email_label: 'Addresse email de contact :',
                    contact_email_ph: 'contact@example.com',
                    contact_email_title: 'Addresse email de contact',
                    contact_url_label: 'URL de la page de contact :',
                    contact_url_ph: 'https://www.example.com/contact',
                    contact_url_title: 'URL de la page de contact',
                    gtu_label: 'URL de la page des Conditions Générales d\'Utilisation :',
                    gtu_ph: 'https://www.example.com/gtu',
                    gtu_title: 'URL de la page des Conditions Générales d\'Utilisation',
                    home_label: 'URL de la page d\'accueil :',
                    home_ph: 'https://www.example.com',
                    home_title: 'URL de la page d\'accueil',
                    label_label: 'Intitulé :',
                    label_ph: 'L\'intitulé doit permettre d\'identifier le tenant',
                    label_title: 'Intitulé identifiant le tenant',
                    legals_label: 'URL de la page des informations légales :',
                    legals_ph: 'https://www.example.com/legals',
                    legals_title: 'URL de la page des informations légales',
                    logo_label: 'URL du logo :',
                    logo_ph: 'https://www.example.com/logo',
                    logo_title: 'URL du logo',
                    pdmp_label: 'URL de la page sur la Politique de Protection des Données Personnelles :',
                    pdmp_ph: 'https://www.example.com/gdpr',
                    pdmp_title: 'URL de la page sur la Politique de Protection des Données Personnelles',
                    support_email_label: 'Addresse email de support :',
                    support_email_ph: 'support@example.com',
                    support_email_title: 'Addresse email de contact',
                    support_url_label: 'URL de la page de support :',
                    support_url_ph: 'https://www.example.com/support',
                    support_url_title: 'URL de la page de support'
                }
            },
            tabs: {
                entity_properties_title: 'Propriétés communes',
                entity_notes_title: 'Notes communes',
                entity_scoped_title: 'Rôles sur le périmètre',
                entity_validities_title: 'Les enregistrements de validité',
            },
            tenants: {
                check: {
                }
            }
        }
    }
};
