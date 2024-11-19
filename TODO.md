# pwix:tenants-manager - TODO

## Summary

1. [Todo](#todo)
2. [Done](#done)

---
## Todo

|   Id | Date       | Description and comment(s) |
| ---: | :---       | :---                       |
|    2 | 2024- 6-28 | have a scheduled job which deletes tenants_e entities which do not have any tenants_r records |
|      |            | as a label - so a record - is supposed to be mandatory to save a tenant |
|    3 | 2024- 6-28 | same than #2 for tenants_r which do not have any tenants_e |
|    5 | 2024- 9-23 | Have an error on publish |
|      |            | Error: Could not find element with id yW5sXgJv4Mt3o8BAh to change
|      |            |   at SessionCollectionView.changed (packages/ddp-server/livedata_server.js:261:13)
|      |            |   at Session.changed (packages/ddp-server/livedata_server.js:485:12)
|      |            |   at Subscription.changed (packages/ddp-server/livedata_server.js:1429:19)
|      |            |   at packages/pwix:tenants-manager/src/common/collections/tenants/server/publish.js:81:30
|      |            |   at processTicksAndRejections (node:internal/process/task_queues:95:5) ignored
|      |            |   Error: Could not find element with id MgveZWDh5C8Mbsgvr to change
|    7 |  |  |

---
## Done

|   Id | Date       | Description and comment(s) |
| ---: | :---       | :---                       |
|    1 | 2024- 6-27 | effectStart and effectEnd are expected to be configured in pwix:validty package |
|      |            | should be able to get this configuration back instead of using hard coded values |
|      |            | (and do not ask to configure the same thing here a second time) |
|      | 2024- 7-17 | done |
|    4 | 2024- 7-16 | do not hardcode ORD_SCOPED_MANAGER in tenantsAll publication |
|      | 2024- 9-30 | done |
|    6 | 2024-11-16 | have tenant manager |
|      | 2024-11-16 | done |

---
P. Wieser
- Last updated on 2024, Nov. 19th
