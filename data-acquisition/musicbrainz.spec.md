# Musicbrainz Integration Spec

## Summary

this is going to be really fucking hard but it will make tha app really cool

## Goals

* users can choose an album association
* album associations are updated periodically
* functional local musicbrainz instance on apple silicon (probably really hard) this can also come later.....
* cache coverart archive, with periodic cache invalidation

## Implementation details

* what happens if the system can't find the album
  * create placeholder
  * add a way for them to upload album art
  * users cant see the content uploaded by other users unless they are viewing their art display
