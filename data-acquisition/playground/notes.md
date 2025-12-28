# Schema Planning

## Figure out
    * integration with munite
    * getting recordings from returned releases
## Goals

* store data from all sources in the same tables
    * caveat!: One recording can belong to multiple releases i believe
    
## Plan and Execution

* add source field and a check for new entries
    * for instance the identifier for a spotify track will be its id
    * for musicbrainz it will be the mbids
    * will identify in albums whether the album is a release or a release group (potentially we need another table for release groups with a reference to its releases)
    * will look something like this

```sql
CREATE TABLE external_ids (
  service TEXT NOT NULL,
  external_id TEXT NOT NULL,

  CONSTRAINT service_id_format_check CHECK (
    (service = 'musicbrainz' AND external_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
 OR (service = 'spotify' AND external_id ~ '^[A-Za-z0-9]{22}$')
  )
```
* chat said that we may want to use a separate table for musicbrainz albums and albums from services, i am inclined to agree but i should do more research
* data acq will check for a given album if it exists with a musicbrainz field and if the data is super old 1 month+ ish it will reinvoke munite and refresh the cache if there is new data
