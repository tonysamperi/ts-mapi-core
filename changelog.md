## 2.0.0
* Split modules
* Add toLowerCase to email schema
* Fix HttpTwoService not encoding "+", rely on manual encoding for more predictable behaviour compared to URLSearchParams / URL
* Fix signature of kikRxjsThrowOnCondition
* Switch to lodash-es for KikCommonUtils.isEqual
* Add SmpAesCryptV2 (more secure)
* Add SmpCommonUtils#stripHtml
* Add SmpCommonUtils#_decodeHtmlEntities

## 1.8.0
* Made SmpGenericConstructor GENERIC!
* Add SmpBaseJwtToken and SmpBaseJwtTokenPlain
* Improve typings in smpRxjsQueue and smpRxjsSequence
* Add SmpBaseJtwToken + SmpBaseJwtTokenPlain

## 1.7.0
* Added smpApplyMixin
* Added smpRxjsQueue + smpRxjsSequence
* Misc fixes on gift card stuff

## 1.6.2
* Fix imports
* Add check import-exports test

## 1.6.1
* Fixed missing exports in cjs build

## 1.6.0
* Make arg optional in SmpErrorResponse.create, to create a generic error by simply calling SmpErrorResponse.create()
* Add rxjs implementations of cache

## 1.5.0
* Fixed smpRxjsCatchOnly catching derived classes 
* Improved dramatically smpZodDateTime that now works like a native definition with concatenation
* Improved cache utils to support TTL (in seconds)
* Added SmpCachedValue (removed SmpSidRaw)
* Added more automatic tests

## 1.4.0
* Breaking change: SmpFirebaseService.instance now is SmpFirebaseService.INSTANCE
* Improved build to emit decorators

## 1.3.0
* Cleanup dependencies

## 1.2.0
* Add smpRxjsCatchOnly operator

## 1.1.0
* Expose SmpErrorResponseCreateOpts

## 1.0.1
* Fix SmpPrimitive name

## 1.0.0
* First release! 🎉
