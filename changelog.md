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
