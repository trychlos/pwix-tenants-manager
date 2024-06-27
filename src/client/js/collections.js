/*
 * pwix:tenants-manager/src/client/js/collections.js
 *
 * Mongo collections can only be created once.
 * But it happens that client-only non-null collections have to be available on each page creation.
 * So we the pages which use such a collection type should ask/store their collection here.
 *
 * Use case: the 'tenants_all' collection created in Tenants/server/publish and used in TenantsList.
 */

TenantsManager.collections = {
};
