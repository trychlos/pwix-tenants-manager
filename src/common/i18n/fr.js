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
                edit_title: 'Edite le tenant "%s" et les collections associées',
                info_title: 'Informations sur le tenant "%s"'
            },
            delete: {
                confirmation_text: 'Vous êtes sur le point de supprimer le tenant "%s".<br />Etes-vous sûr ?',
                confirmation_title: 'Supprimer un tenant',
                success: 'Le tenant "%s" a été supprimé avec succès'
            },
            edit: {
                edit_success: 'Le tenant "%s" a été mis à jour avec succès',
                emails_dialog_title: 'Toutes les adresses de messagerie',
                error: 'Une erreur s\'est malheureusement produite. Merci de réessayer ultérieurement',
                modal_title: 'Editer un tenant',
                new_success: 'Le tenant "%s"  été créé avec succès',
                urls_dialog_title: 'Toutes les URLs'
            },
            list: {
                contact_email_th: 'Contact',
                effect_end_th: 'Au',
                effect_start_th: 'Du',
                emails_more_title: 'Affiche toutes les addresses de messagerie',
                emails_th: 'Emails',
                entity_notes_th: 'Notes du tenant',
                home_page_th: 'Site principal',
                label_th: 'Label',
                managers_th: 'Managers',
                not_allowed: '<p>Vous n\'êtes malheureusement pas autorisé à consulter la liste des tenants.</p>'
                    +'<p>Vous pouvez vous rapprocher de votre administrateur pour demander les habilitations nécessaires.<p>',
                notes_th: 'Notes',
                urls_more_title: 'Affiche toutes les URLs',
                urls_th: 'URLs'
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
                    emails_email_invalid: 'L\'adresse de messagerie spécifiée est invalide',
                    emails_email_missing: 'Une adresse de messagerie doit être spécifiée',
                    emails_label_missing: 'Un label doit être spécifié pour l\'adresse de messagerie',
                    emails_neither_dedicated_generalized: 'Erreur de configuration: les adresses de messagerie dédiées ne sont pas configurées, non plus que les adresses généralisées',
                    emails_wants_one: 'Au moins une adresse de messagerie est requise',
                    home_url_invalid: 'L\'URL de la page d\'accueil est invalide',
                    label_exists: 'L\'intitulé est déjà utilisé par un autre tenant',
                    label_unset: 'L\'intitulé n\'est pas renseigné',
                    logo_url_invalid: 'L\'URL du logo est invalide',
                    name_done: 'Contrôle %s=%s: OK',
                    name_item_done: 'Contrôle de \'%s\' (%s) OK',
                    urls_label_missing: 'Un label doit être spécifié pour l\'URL',
                    urls_url_invalid: 'L\'URL spécifiée est invalide',
                    urls_url_missing: 'Une URL doit être spécifiée'
                },
                panel: {
                    notes_tab: 'Notes',
                    properties_tab: 'Propriétés'
                },
                properties: {
                    contact_email_label: 'Adresse email de contact :',
                    contact_email_ph: 'contact@example.com',
                    contact_email_title: 'Adresse email de contact',
                    contact_url_label: 'URL de la page de contact :',
                    contact_url_ph: 'https://www.example.com/contact',
                    contact_url_title: 'URL de la page de contact',
                    emails_add_title: 'Ajouter une nouvelle adresse de messagerie',
                    emails_email_ph: 'me@example.com',
                    emails_email_th: 'Adresse de messagerie',
                    emails_label_ph: 'Contact ou Support ou MonAdresseAMoi',
                    emails_label_th: 'Label',
                    emails_preamble: '<p class="title">Adresses de messagerie</p><p class="content">'
                        +'Définissez ci-dessous autant d\'adresses de messagerie que vous le souhaitez, tant que vous posez un label pour chacune d\'entre elles.<br />'
                        +'Pour le confort de tous, nous avons besoin que vous définissiez au moins une adresse de messagerie qui sera utilisée comme adresse de contact.</p>',
                    emails_remove_title: 'Supprimer cette adresse de la liste',
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
                    support_email_label: 'Adresse email de support :',
                    support_email_ph: 'support@example.com',
                    support_email_title: 'Adresse email de contact',
                    support_url_label: 'URL de la page de support :',
                    support_url_ph: 'https://www.example.com/support',
                    support_url_title: 'URL de la page de support',
                    urls_add_title: 'Ajouter une nouvelle URL',
                    urls_label_ph: 'Page d\'accueil',
                    urls_label_th: 'Label',
                    urls_url_ph: 'https://www.example.com',
                    urls_url_th: 'URL',
                    urls_preamble: '<p class="title">URLs</p><p class="content">'
                        +'Définissez ci-dessous autant d\'URLs que vous le souhaitez, tant que vous posez un label pour chacune d\'entre elles.<br />'
                        +'Il peut s\'agir par exemple de la page d\'accueil de votre organisation, d\'une page de contact, d\'une page où vous décrivez vos réalisations, '
                        +'ou bien même d\'une liste complète de toutes les pages de tous vos sites Web.<br />'
                        +'Vraiment autant d\'URLs que vous le souhaitez comme nous le disions !</p>',
                    urls_remove_title: 'Supprimer cette URL de la liste'
                }
            },
            tabs: {
                entity_properties_title: 'Propriétés communes',
                entity_notes_title: 'Notes communes',
                entity_scoped_title: 'Rôles sur le périmètre',
                entity_validities_title: 'Les enregistrements de validité',
            }
        }
    }
};
