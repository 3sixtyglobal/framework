# Changelog

## [0.9.2-next.1](https://github.com/iotaledger/twin-framework/compare/web-v0.9.2-next.0...web-v0.9.2-next.1) (2026-07-28)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))
* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add IEntitySchemaDiff and entitySchemaDiff utility ([#282](https://github.com/iotaledger/twin-framework/issues/282)) ([9d63e94](https://github.com/iotaledger/twin-framework/commit/9d63e94021ee2ffc138004ee68cf53d08a6b17f9))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))
* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))
* additional http header extraction ([#262](https://github.com/iotaledger/twin-framework/issues/262)) ([124fa3f](https://github.com/iotaledger/twin-framework/commit/124fa3fdd118ed17f973d4b46842f5b7f35365c2))
* additional http link feature support ([b68b4cc](https://github.com/iotaledger/twin-framework/commit/b68b4cc6a6e3cf02f91e794353714e26a49fe66c))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* improve signatures ([cdd24be](https://github.com/iotaledger/twin-framework/commit/cdd24be6fb898d33955b6f2f93c3ddbd73582269))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* typescript 6 update ([1d10f31](https://github.com/iotaledger/twin-framework/commit/1d10f31e6516ec622773f45e88af82fe749b384a))
* update dependencies ([4da77ab](https://github.com/iotaledger/twin-framework/commit/4da77ab30f499e52825ac5a76f51436ceb59c26e))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* urn and header helper extensions ([#395](https://github.com/iotaledger/twin-framework/issues/395)) ([5976756](https://github.com/iotaledger/twin-framework/commit/5976756886d22e5063671052abc4dfa04ce23a53))
* use body on patch verb ([28627e5](https://github.com/iotaledger/twin-framework/commit/28627e527d033d433acefe0e9fde52ba88c0d047))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))


### Bug Fixes

* ensure __decorate is defined for decorators ([103a563](https://github.com/iotaledger/twin-framework/commit/103a563ce01ebdef6240d2e590e7b026e8692684))
* settle AsyncCache waiters correctly when a request resolves undefined or null ([#401](https://github.com/iotaledger/twin-framework/issues/401)) ([6ae3f8a](https://github.com/iotaledger/twin-framework/commit/6ae3f8aca688ca76d93ec3964178a3b1a8895453))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.2-next.0 to 0.9.2-next.1
    * @twin.org/crypto bumped from 0.9.2-next.0 to 0.9.2-next.1
    * @twin.org/nameof bumped from 0.9.2-next.0 to 0.9.2-next.1
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.2-next.0 to 0.9.2-next.1
    * @twin.org/nameof-vitest-plugin bumped from 0.9.2-next.0 to 0.9.2-next.1
    * @twin.org/validate-locales bumped from 0.9.2-next.0 to 0.9.2-next.1

## [0.9.1](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1...web-v0.9.1) (2026-07-26)


### Features

* release to production ([b24cba1](https://github.com/iotaledger/twin-framework/commit/b24cba1b6a969278d638e632590602ec881e49fb))
* release to production ([787287d](https://github.com/iotaledger/twin-framework/commit/787287d06ea8319657401589d61fff369310c422))
* release to production ([53f4843](https://github.com/iotaledger/twin-framework/commit/53f484326b2851d7a506d2620db24c4a65cee7b3))
* release to production ([56cda4d](https://github.com/iotaledger/twin-framework/commit/56cda4da93e978c5be19ec7cfd421ae2a7fe4147))
* release to production ([f7c6586](https://github.com/iotaledger/twin-framework/commit/f7c6586f6976b903b647b4c5ac5ad9421e0c9051))
* release to production ([829d53d](https://github.com/iotaledger/twin-framework/commit/829d53d3953b1e1b40b0243c04cfdfd3842aac7b))
* release to production ([5cf3a76](https://github.com/iotaledger/twin-framework/commit/5cf3a76a09eff2e6414d0cba846c7c37400a11d6))
* release to production ([#330](https://github.com/iotaledger/twin-framework/issues/330)) ([d73f565](https://github.com/iotaledger/twin-framework/commit/d73f565588d156d23ef49b2a5718973756f7a696))
* release to production ([#382](https://github.com/iotaledger/twin-framework/issues/382)) ([bbed01a](https://github.com/iotaledger/twin-framework/commit/bbed01a605ee9724bda77a0f7feab249118c2d90))
* release to production ([#417](https://github.com/iotaledger/twin-framework/issues/417)) ([59727e7](https://github.com/iotaledger/twin-framework/commit/59727e73903a137310ca48fe469189cf29879cb9))


### Miscellaneous Chores

* release to production ([63cae24](https://github.com/iotaledger/twin-framework/commit/63cae2401f6c11f93b2a01260b665064e8bd28e0))

## [0.9.1-next.10](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.9...web-v0.9.1-next.10) (2026-07-20)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.9 to 0.9.1-next.10
    * @twin.org/crypto bumped from 0.9.1-next.9 to 0.9.1-next.10
    * @twin.org/nameof bumped from 0.9.1-next.9 to 0.9.1-next.10
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.9 to 0.9.1-next.10
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.9 to 0.9.1-next.10
    * @twin.org/validate-locales bumped from 0.9.1-next.9 to 0.9.1-next.10

## [0.9.1-next.9](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.8...web-v0.9.1-next.9) (2026-07-20)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.8 to 0.9.1-next.9
    * @twin.org/crypto bumped from 0.9.1-next.8 to 0.9.1-next.9
    * @twin.org/nameof bumped from 0.9.1-next.8 to 0.9.1-next.9
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.8 to 0.9.1-next.9
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.8 to 0.9.1-next.9
    * @twin.org/validate-locales bumped from 0.9.1-next.8 to 0.9.1-next.9

## [0.9.1-next.8](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.7...web-v0.9.1-next.8) (2026-07-20)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.7 to 0.9.1-next.8
    * @twin.org/crypto bumped from 0.9.1-next.7 to 0.9.1-next.8
    * @twin.org/nameof bumped from 0.9.1-next.7 to 0.9.1-next.8
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.7 to 0.9.1-next.8
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.7 to 0.9.1-next.8
    * @twin.org/validate-locales bumped from 0.9.1-next.7 to 0.9.1-next.8

## [0.9.1-next.7](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.6...web-v0.9.1-next.7) (2026-07-09)


### Bug Fixes

* settle AsyncCache waiters correctly when a request resolves undefined or null ([#401](https://github.com/iotaledger/twin-framework/issues/401)) ([6ae3f8a](https://github.com/iotaledger/twin-framework/commit/6ae3f8aca688ca76d93ec3964178a3b1a8895453))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.6 to 0.9.1-next.7
    * @twin.org/crypto bumped from 0.9.1-next.6 to 0.9.1-next.7
    * @twin.org/nameof bumped from 0.9.1-next.6 to 0.9.1-next.7
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.6 to 0.9.1-next.7
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.6 to 0.9.1-next.7
    * @twin.org/validate-locales bumped from 0.9.1-next.6 to 0.9.1-next.7

## [0.9.1-next.6](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.5...web-v0.9.1-next.6) (2026-07-03)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.5 to 0.9.1-next.6
    * @twin.org/crypto bumped from 0.9.1-next.5 to 0.9.1-next.6
    * @twin.org/nameof bumped from 0.9.1-next.5 to 0.9.1-next.6
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.5 to 0.9.1-next.6
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.5 to 0.9.1-next.6
    * @twin.org/validate-locales bumped from 0.9.1-next.5 to 0.9.1-next.6

## [0.9.1-next.5](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.4...web-v0.9.1-next.5) (2026-06-29)


### Features

* urn and header helper extensions ([#395](https://github.com/iotaledger/twin-framework/issues/395)) ([5976756](https://github.com/iotaledger/twin-framework/commit/5976756886d22e5063671052abc4dfa04ce23a53))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.4 to 0.9.1-next.5
    * @twin.org/crypto bumped from 0.9.1-next.4 to 0.9.1-next.5
    * @twin.org/nameof bumped from 0.9.1-next.4 to 0.9.1-next.5
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.4 to 0.9.1-next.5
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.4 to 0.9.1-next.5
    * @twin.org/validate-locales bumped from 0.9.1-next.4 to 0.9.1-next.5

## [0.9.1-next.4](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.3...web-v0.9.1-next.4) (2026-06-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.3 to 0.9.1-next.4
    * @twin.org/crypto bumped from 0.9.1-next.3 to 0.9.1-next.4
    * @twin.org/nameof bumped from 0.9.1-next.3 to 0.9.1-next.4
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.3 to 0.9.1-next.4
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.3 to 0.9.1-next.4
    * @twin.org/validate-locales bumped from 0.9.1-next.3 to 0.9.1-next.4

## [0.9.1-next.3](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.2...web-v0.9.1-next.3) (2026-06-26)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))
* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add IEntitySchemaDiff and entitySchemaDiff utility ([#282](https://github.com/iotaledger/twin-framework/issues/282)) ([9d63e94](https://github.com/iotaledger/twin-framework/commit/9d63e94021ee2ffc138004ee68cf53d08a6b17f9))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))
* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))
* additional http header extraction ([#262](https://github.com/iotaledger/twin-framework/issues/262)) ([124fa3f](https://github.com/iotaledger/twin-framework/commit/124fa3fdd118ed17f973d4b46842f5b7f35365c2))
* additional http link feature support ([b68b4cc](https://github.com/iotaledger/twin-framework/commit/b68b4cc6a6e3cf02f91e794353714e26a49fe66c))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* improve signatures ([cdd24be](https://github.com/iotaledger/twin-framework/commit/cdd24be6fb898d33955b6f2f93c3ddbd73582269))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* typescript 6 update ([1d10f31](https://github.com/iotaledger/twin-framework/commit/1d10f31e6516ec622773f45e88af82fe749b384a))
* update dependencies ([4da77ab](https://github.com/iotaledger/twin-framework/commit/4da77ab30f499e52825ac5a76f51436ceb59c26e))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use body on patch verb ([28627e5](https://github.com/iotaledger/twin-framework/commit/28627e527d033d433acefe0e9fde52ba88c0d047))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))


### Bug Fixes

* ensure __decorate is defined for decorators ([103a563](https://github.com/iotaledger/twin-framework/commit/103a563ce01ebdef6240d2e590e7b026e8692684))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.2 to 0.9.1-next.3
    * @twin.org/crypto bumped from 0.9.1-next.2 to 0.9.1-next.3
    * @twin.org/nameof bumped from 0.9.1-next.2 to 0.9.1-next.3
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.2 to 0.9.1-next.3
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.2 to 0.9.1-next.3
    * @twin.org/validate-locales bumped from 0.9.1-next.2 to 0.9.1-next.3

## [0.9.1-next.2](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.1...web-v0.9.1-next.2) (2026-06-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.1 to 0.9.1-next.2
    * @twin.org/crypto bumped from 0.9.1-next.1 to 0.9.1-next.2
    * @twin.org/nameof bumped from 0.9.1-next.1 to 0.9.1-next.2
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.1 to 0.9.1-next.2
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.1 to 0.9.1-next.2
    * @twin.org/validate-locales bumped from 0.9.1-next.1 to 0.9.1-next.2

## [0.9.1-next.1](https://github.com/iotaledger/twin-framework/compare/web-v0.9.1-next.0...web-v0.9.1-next.1) (2026-06-25)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))
* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add IEntitySchemaDiff and entitySchemaDiff utility ([#282](https://github.com/iotaledger/twin-framework/issues/282)) ([9d63e94](https://github.com/iotaledger/twin-framework/commit/9d63e94021ee2ffc138004ee68cf53d08a6b17f9))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))
* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))
* additional http header extraction ([#262](https://github.com/iotaledger/twin-framework/issues/262)) ([124fa3f](https://github.com/iotaledger/twin-framework/commit/124fa3fdd118ed17f973d4b46842f5b7f35365c2))
* additional http link feature support ([b68b4cc](https://github.com/iotaledger/twin-framework/commit/b68b4cc6a6e3cf02f91e794353714e26a49fe66c))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* improve signatures ([cdd24be](https://github.com/iotaledger/twin-framework/commit/cdd24be6fb898d33955b6f2f93c3ddbd73582269))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* typescript 6 update ([1d10f31](https://github.com/iotaledger/twin-framework/commit/1d10f31e6516ec622773f45e88af82fe749b384a))
* update dependencies ([4da77ab](https://github.com/iotaledger/twin-framework/commit/4da77ab30f499e52825ac5a76f51436ceb59c26e))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use body on patch verb ([28627e5](https://github.com/iotaledger/twin-framework/commit/28627e527d033d433acefe0e9fde52ba88c0d047))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))


### Bug Fixes

* ensure __decorate is defined for decorators ([103a563](https://github.com/iotaledger/twin-framework/commit/103a563ce01ebdef6240d2e590e7b026e8692684))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.1-next.0 to 0.9.1-next.1
    * @twin.org/crypto bumped from 0.9.1-next.0 to 0.9.1-next.1
    * @twin.org/nameof bumped from 0.9.1-next.0 to 0.9.1-next.1
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.1-next.0 to 0.9.1-next.1
    * @twin.org/nameof-vitest-plugin bumped from 0.9.1-next.0 to 0.9.1-next.1
    * @twin.org/validate-locales bumped from next to 0.9.1-next.1

## [0.9.0](https://github.com/iotaledger/twin-framework/compare/web-v0.9.0...web-v0.9.0) (2026-06-22)


### Features

* release to production ([b24cba1](https://github.com/iotaledger/twin-framework/commit/b24cba1b6a969278d638e632590602ec881e49fb))
* release to production ([787287d](https://github.com/iotaledger/twin-framework/commit/787287d06ea8319657401589d61fff369310c422))
* release to production ([53f4843](https://github.com/iotaledger/twin-framework/commit/53f484326b2851d7a506d2620db24c4a65cee7b3))
* release to production ([56cda4d](https://github.com/iotaledger/twin-framework/commit/56cda4da93e978c5be19ec7cfd421ae2a7fe4147))
* release to production ([f7c6586](https://github.com/iotaledger/twin-framework/commit/f7c6586f6976b903b647b4c5ac5ad9421e0c9051))
* release to production ([829d53d](https://github.com/iotaledger/twin-framework/commit/829d53d3953b1e1b40b0243c04cfdfd3842aac7b))
* release to production ([5cf3a76](https://github.com/iotaledger/twin-framework/commit/5cf3a76a09eff2e6414d0cba846c7c37400a11d6))
* release to production ([#330](https://github.com/iotaledger/twin-framework/issues/330)) ([d73f565](https://github.com/iotaledger/twin-framework/commit/d73f565588d156d23ef49b2a5718973756f7a696))
* release to production ([#382](https://github.com/iotaledger/twin-framework/issues/382)) ([bbed01a](https://github.com/iotaledger/twin-framework/commit/bbed01a605ee9724bda77a0f7feab249118c2d90))


### Miscellaneous Chores

* release to production ([63cae24](https://github.com/iotaledger/twin-framework/commit/63cae2401f6c11f93b2a01260b665064e8bd28e0))

## [0.9.0-next.1](https://github.com/iotaledger/twin-framework/compare/web-v0.9.0-next.0...web-v0.9.0-next.1) (2026-06-22)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))
* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add IEntitySchemaDiff and entitySchemaDiff utility ([#282](https://github.com/iotaledger/twin-framework/issues/282)) ([9d63e94](https://github.com/iotaledger/twin-framework/commit/9d63e94021ee2ffc138004ee68cf53d08a6b17f9))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))
* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))
* additional http header extraction ([#262](https://github.com/iotaledger/twin-framework/issues/262)) ([124fa3f](https://github.com/iotaledger/twin-framework/commit/124fa3fdd118ed17f973d4b46842f5b7f35365c2))
* additional http link feature support ([b68b4cc](https://github.com/iotaledger/twin-framework/commit/b68b4cc6a6e3cf02f91e794353714e26a49fe66c))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* improve signatures ([cdd24be](https://github.com/iotaledger/twin-framework/commit/cdd24be6fb898d33955b6f2f93c3ddbd73582269))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* typescript 6 update ([1d10f31](https://github.com/iotaledger/twin-framework/commit/1d10f31e6516ec622773f45e88af82fe749b384a))
* update dependencies ([4da77ab](https://github.com/iotaledger/twin-framework/commit/4da77ab30f499e52825ac5a76f51436ceb59c26e))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use body on patch verb ([28627e5](https://github.com/iotaledger/twin-framework/commit/28627e527d033d433acefe0e9fde52ba88c0d047))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))


### Bug Fixes

* ensure __decorate is defined for decorators ([103a563](https://github.com/iotaledger/twin-framework/commit/103a563ce01ebdef6240d2e590e7b026e8692684))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.9.0-next.0 to 0.9.0-next.1
    * @twin.org/crypto bumped from 0.9.0-next.0 to 0.9.0-next.1
    * @twin.org/nameof bumped from 0.9.0-next.0 to 0.9.0-next.1
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.9.0-next.0 to 0.9.0-next.1
    * @twin.org/nameof-vitest-plugin bumped from 0.9.0-next.0 to 0.9.0-next.1
    * @twin.org/validate-locales bumped from 0.9.0-next.0 to 0.9.0-next.1

## [0.0.4-next.15](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.14...web-v0.0.4-next.15) (2026-06-19)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.14 to 0.0.4-next.15
    * @twin.org/crypto bumped from 0.0.4-next.14 to 0.0.4-next.15
    * @twin.org/nameof bumped from 0.0.4-next.14 to 0.0.4-next.15
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.14 to 0.0.4-next.15
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.14 to 0.0.4-next.15
    * @twin.org/validate-locales bumped from 0.0.4-next.14 to 0.0.4-next.15

## [0.0.4-next.14](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.13...web-v0.0.4-next.14) (2026-06-18)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.13 to 0.0.4-next.14
    * @twin.org/crypto bumped from 0.0.4-next.13 to 0.0.4-next.14
    * @twin.org/nameof bumped from 0.0.4-next.13 to 0.0.4-next.14
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.13 to 0.0.4-next.14
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.13 to 0.0.4-next.14
    * @twin.org/validate-locales bumped from 0.0.4-next.13 to 0.0.4-next.14

## [0.0.4-next.13](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.12...web-v0.0.4-next.13) (2026-06-18)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.12 to 0.0.4-next.13
    * @twin.org/crypto bumped from 0.0.4-next.12 to 0.0.4-next.13
    * @twin.org/nameof bumped from 0.0.4-next.12 to 0.0.4-next.13
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.12 to 0.0.4-next.13
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.12 to 0.0.4-next.13
    * @twin.org/validate-locales bumped from 0.0.4-next.12 to 0.0.4-next.13

## [0.0.4-next.12](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.11...web-v0.0.4-next.12) (2026-06-18)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.11 to 0.0.4-next.12
    * @twin.org/crypto bumped from 0.0.4-next.11 to 0.0.4-next.12
    * @twin.org/nameof bumped from 0.0.4-next.11 to 0.0.4-next.12
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.11 to 0.0.4-next.12
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.11 to 0.0.4-next.12
    * @twin.org/validate-locales bumped from 0.0.4-next.11 to 0.0.4-next.12

## [0.0.4-next.11](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.10...web-v0.0.4-next.11) (2026-06-15)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.10 to 0.0.4-next.11
    * @twin.org/crypto bumped from 0.0.4-next.10 to 0.0.4-next.11
    * @twin.org/nameof bumped from 0.0.4-next.10 to 0.0.4-next.11
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.10 to 0.0.4-next.11
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.10 to 0.0.4-next.11
    * @twin.org/validate-locales bumped from 0.0.4-next.10 to 0.0.4-next.11

## [0.0.4-next.10](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.9...web-v0.0.4-next.10) (2026-06-15)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))
* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))
* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add IEntitySchemaDiff and entitySchemaDiff utility ([#282](https://github.com/iotaledger/twin-framework/issues/282)) ([9d63e94](https://github.com/iotaledger/twin-framework/commit/9d63e94021ee2ffc138004ee68cf53d08a6b17f9))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))
* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))
* additional http header extraction ([#262](https://github.com/iotaledger/twin-framework/issues/262)) ([124fa3f](https://github.com/iotaledger/twin-framework/commit/124fa3fdd118ed17f973d4b46842f5b7f35365c2))
* additional http link feature support ([b68b4cc](https://github.com/iotaledger/twin-framework/commit/b68b4cc6a6e3cf02f91e794353714e26a49fe66c))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* improve signatures ([cdd24be](https://github.com/iotaledger/twin-framework/commit/cdd24be6fb898d33955b6f2f93c3ddbd73582269))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* typescript 6 update ([1d10f31](https://github.com/iotaledger/twin-framework/commit/1d10f31e6516ec622773f45e88af82fe749b384a))
* update dependencies ([4da77ab](https://github.com/iotaledger/twin-framework/commit/4da77ab30f499e52825ac5a76f51436ceb59c26e))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use body on patch verb ([28627e5](https://github.com/iotaledger/twin-framework/commit/28627e527d033d433acefe0e9fde52ba88c0d047))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))


### Bug Fixes

* ensure __decorate is defined for decorators ([103a563](https://github.com/iotaledger/twin-framework/commit/103a563ce01ebdef6240d2e590e7b026e8692684))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.9 to 0.0.4-next.10
    * @twin.org/crypto bumped from 0.0.4-next.9 to 0.0.4-next.10
    * @twin.org/nameof bumped from 0.0.4-next.9 to 0.0.4-next.10
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.9 to 0.0.4-next.10
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.9 to 0.0.4-next.10
    * @twin.org/validate-locales bumped from 0.0.4-next.9 to 0.0.4-next.10

## [0.0.4-next.9](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.8...web-v0.0.4-next.9) (2026-06-15)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.8 to 0.0.4-next.9
    * @twin.org/crypto bumped from 0.0.4-next.8 to 0.0.4-next.9
    * @twin.org/nameof bumped from 0.0.4-next.8 to 0.0.4-next.9
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.8 to 0.0.4-next.9
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.8 to 0.0.4-next.9
    * @twin.org/validate-locales bumped from 0.0.4-next.8 to 0.0.4-next.9

## [0.0.4-next.8](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.7...web-v0.0.4-next.8) (2026-06-10)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.7 to 0.0.4-next.8
    * @twin.org/crypto bumped from 0.0.4-next.7 to 0.0.4-next.8
    * @twin.org/nameof bumped from 0.0.4-next.7 to 0.0.4-next.8
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.7 to 0.0.4-next.8
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.7 to 0.0.4-next.8
    * @twin.org/validate-locales bumped from 0.0.4-next.7 to 0.0.4-next.8

## [0.0.4-next.7](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.6...web-v0.0.4-next.7) (2026-06-10)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.6 to 0.0.4-next.7
    * @twin.org/crypto bumped from 0.0.4-next.6 to 0.0.4-next.7
    * @twin.org/nameof bumped from 0.0.4-next.6 to 0.0.4-next.7
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.6 to 0.0.4-next.7
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.6 to 0.0.4-next.7
    * @twin.org/validate-locales bumped from 0.0.4-next.6 to 0.0.4-next.7

## [0.0.4-next.6](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.5...web-v0.0.4-next.6) (2026-06-05)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.5 to 0.0.4-next.6
    * @twin.org/crypto bumped from 0.0.4-next.5 to 0.0.4-next.6
    * @twin.org/nameof bumped from 0.0.4-next.5 to 0.0.4-next.6
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.5 to 0.0.4-next.6
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.5 to 0.0.4-next.6
    * @twin.org/validate-locales bumped from 0.0.4-next.5 to 0.0.4-next.6

## [0.0.4-next.5](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.4...web-v0.0.4-next.5) (2026-06-04)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.4 to 0.0.4-next.5
    * @twin.org/crypto bumped from 0.0.4-next.4 to 0.0.4-next.5
    * @twin.org/nameof bumped from 0.0.4-next.4 to 0.0.4-next.5
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.4 to 0.0.4-next.5
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.4 to 0.0.4-next.5
    * @twin.org/validate-locales bumped from 0.0.4-next.4 to 0.0.4-next.5

## [0.0.4-next.4](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.3...web-v0.0.4-next.4) (2026-06-02)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.3 to 0.0.4-next.4
    * @twin.org/crypto bumped from 0.0.4-next.3 to 0.0.4-next.4
    * @twin.org/nameof bumped from 0.0.4-next.3 to 0.0.4-next.4
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.3 to 0.0.4-next.4
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.3 to 0.0.4-next.4
    * @twin.org/validate-locales bumped from 0.0.4-next.3 to 0.0.4-next.4

## [0.0.4-next.3](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.2...web-v0.0.4-next.3) (2026-05-28)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.2 to 0.0.4-next.3
    * @twin.org/crypto bumped from 0.0.4-next.2 to 0.0.4-next.3
    * @twin.org/nameof bumped from 0.0.4-next.2 to 0.0.4-next.3
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.2 to 0.0.4-next.3
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.2 to 0.0.4-next.3
    * @twin.org/validate-locales bumped from 0.0.4-next.2 to 0.0.4-next.3

## [0.0.4-next.2](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.1...web-v0.0.4-next.2) (2026-05-28)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.1 to 0.0.4-next.2
    * @twin.org/crypto bumped from 0.0.4-next.1 to 0.0.4-next.2
    * @twin.org/nameof bumped from 0.0.4-next.1 to 0.0.4-next.2
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.1 to 0.0.4-next.2
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.1 to 0.0.4-next.2
    * @twin.org/validate-locales bumped from 0.0.4-next.1 to 0.0.4-next.2

## [0.0.4-next.1](https://github.com/iotaledger/twin-framework/compare/web-v0.0.4-next.0...web-v0.0.4-next.1) (2026-05-27)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))
* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))
* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add IEntitySchemaDiff and entitySchemaDiff utility ([#282](https://github.com/iotaledger/twin-framework/issues/282)) ([9d63e94](https://github.com/iotaledger/twin-framework/commit/9d63e94021ee2ffc138004ee68cf53d08a6b17f9))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))
* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))
* additional http header extraction ([#262](https://github.com/iotaledger/twin-framework/issues/262)) ([124fa3f](https://github.com/iotaledger/twin-framework/commit/124fa3fdd118ed17f973d4b46842f5b7f35365c2))
* additional http link feature support ([b68b4cc](https://github.com/iotaledger/twin-framework/commit/b68b4cc6a6e3cf02f91e794353714e26a49fe66c))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* improve signatures ([cdd24be](https://github.com/iotaledger/twin-framework/commit/cdd24be6fb898d33955b6f2f93c3ddbd73582269))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* typescript 6 update ([1d10f31](https://github.com/iotaledger/twin-framework/commit/1d10f31e6516ec622773f45e88af82fe749b384a))
* update dependencies ([4da77ab](https://github.com/iotaledger/twin-framework/commit/4da77ab30f499e52825ac5a76f51436ceb59c26e))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use body on patch verb ([28627e5](https://github.com/iotaledger/twin-framework/commit/28627e527d033d433acefe0e9fde52ba88c0d047))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* ensure __decorate is defined for decorators ([103a563](https://github.com/iotaledger/twin-framework/commit/103a563ce01ebdef6240d2e590e7b026e8692684))
* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.4-next.0 to 0.0.4-next.1
    * @twin.org/crypto bumped from 0.0.4-next.0 to 0.0.4-next.1
    * @twin.org/nameof bumped from 0.0.4-next.0 to 0.0.4-next.1
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.4-next.0 to 0.0.4-next.1
    * @twin.org/nameof-vitest-plugin bumped from 0.0.4-next.0 to 0.0.4-next.1
    * @twin.org/validate-locales bumped from 0.0.4-next.0 to 0.0.4-next.1

## [0.0.3](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3...web-v0.0.3) (2026-05-27)


### Features

* release to production ([b24cba1](https://github.com/iotaledger/twin-framework/commit/b24cba1b6a969278d638e632590602ec881e49fb))
* release to production ([787287d](https://github.com/iotaledger/twin-framework/commit/787287d06ea8319657401589d61fff369310c422))
* release to production ([53f4843](https://github.com/iotaledger/twin-framework/commit/53f484326b2851d7a506d2620db24c4a65cee7b3))
* release to production ([56cda4d](https://github.com/iotaledger/twin-framework/commit/56cda4da93e978c5be19ec7cfd421ae2a7fe4147))
* release to production ([f7c6586](https://github.com/iotaledger/twin-framework/commit/f7c6586f6976b903b647b4c5ac5ad9421e0c9051))
* release to production ([829d53d](https://github.com/iotaledger/twin-framework/commit/829d53d3953b1e1b40b0243c04cfdfd3842aac7b))
* release to production ([5cf3a76](https://github.com/iotaledger/twin-framework/commit/5cf3a76a09eff2e6414d0cba846c7c37400a11d6))
* release to production ([#330](https://github.com/iotaledger/twin-framework/issues/330)) ([d73f565](https://github.com/iotaledger/twin-framework/commit/d73f565588d156d23ef49b2a5718973756f7a696))


### Miscellaneous Chores

* release to production ([63cae24](https://github.com/iotaledger/twin-framework/commit/63cae2401f6c11f93b2a01260b665064e8bd28e0))

## [0.0.3-next.47](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.46...web-v0.0.3-next.47) (2026-05-25)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.46 to 0.0.3-next.47
    * @twin.org/crypto bumped from 0.0.3-next.46 to 0.0.3-next.47
    * @twin.org/nameof bumped from 0.0.3-next.46 to 0.0.3-next.47
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.46 to 0.0.3-next.47
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.46 to 0.0.3-next.47
    * @twin.org/validate-locales bumped from 0.0.3-next.46 to 0.0.3-next.47

## [0.0.3-next.46](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.45...web-v0.0.3-next.46) (2026-05-22)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.45 to 0.0.3-next.46
    * @twin.org/crypto bumped from 0.0.3-next.45 to 0.0.3-next.46
    * @twin.org/nameof bumped from 0.0.3-next.45 to 0.0.3-next.46
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.45 to 0.0.3-next.46
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.45 to 0.0.3-next.46
    * @twin.org/validate-locales bumped from 0.0.3-next.45 to 0.0.3-next.46

## [0.0.3-next.45](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.44...web-v0.0.3-next.45) (2026-05-21)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.44 to 0.0.3-next.45
    * @twin.org/crypto bumped from 0.0.3-next.44 to 0.0.3-next.45
    * @twin.org/nameof bumped from 0.0.3-next.44 to 0.0.3-next.45
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.44 to 0.0.3-next.45
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.44 to 0.0.3-next.45
    * @twin.org/validate-locales bumped from 0.0.3-next.44 to 0.0.3-next.45

## [0.0.3-next.44](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.43...web-v0.0.3-next.44) (2026-05-19)


### Features

* update dependencies ([4da77ab](https://github.com/iotaledger/twin-framework/commit/4da77ab30f499e52825ac5a76f51436ceb59c26e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.43 to 0.0.3-next.44
    * @twin.org/crypto bumped from 0.0.3-next.43 to 0.0.3-next.44
    * @twin.org/nameof bumped from 0.0.3-next.43 to 0.0.3-next.44
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.43 to 0.0.3-next.44
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.43 to 0.0.3-next.44
    * @twin.org/validate-locales bumped from 0.0.3-next.43 to 0.0.3-next.44

## [0.0.3-next.43](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.42...web-v0.0.3-next.43) (2026-05-18)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.42 to 0.0.3-next.43
    * @twin.org/crypto bumped from 0.0.3-next.42 to 0.0.3-next.43
    * @twin.org/nameof bumped from 0.0.3-next.42 to 0.0.3-next.43
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.42 to 0.0.3-next.43
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.42 to 0.0.3-next.43
    * @twin.org/validate-locales bumped from 0.0.3-next.42 to 0.0.3-next.43

## [0.0.3-next.42](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.41...web-v0.0.3-next.42) (2026-05-15)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.41 to 0.0.3-next.42
    * @twin.org/crypto bumped from 0.0.3-next.41 to 0.0.3-next.42
    * @twin.org/nameof bumped from 0.0.3-next.41 to 0.0.3-next.42
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.41 to 0.0.3-next.42
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.41 to 0.0.3-next.42
    * @twin.org/validate-locales bumped from 0.0.3-next.41 to 0.0.3-next.42

## [0.0.3-next.41](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.40...web-v0.0.3-next.41) (2026-05-13)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.40 to 0.0.3-next.41
    * @twin.org/crypto bumped from 0.0.3-next.40 to 0.0.3-next.41
    * @twin.org/nameof bumped from 0.0.3-next.40 to 0.0.3-next.41
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.40 to 0.0.3-next.41
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.40 to 0.0.3-next.41
    * @twin.org/validate-locales bumped from 0.0.3-next.40 to 0.0.3-next.41

## [0.0.3-next.40](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.39...web-v0.0.3-next.40) (2026-05-13)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.39 to 0.0.3-next.40
    * @twin.org/crypto bumped from 0.0.3-next.39 to 0.0.3-next.40
    * @twin.org/nameof bumped from 0.0.3-next.39 to 0.0.3-next.40
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.39 to 0.0.3-next.40
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.39 to 0.0.3-next.40
    * @twin.org/validate-locales bumped from 0.0.3-next.39 to 0.0.3-next.40

## [0.0.3-next.39](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.38...web-v0.0.3-next.39) (2026-05-13)


### Features

* improve signatures ([cdd24be](https://github.com/iotaledger/twin-framework/commit/cdd24be6fb898d33955b6f2f93c3ddbd73582269))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.38 to 0.0.3-next.39
    * @twin.org/crypto bumped from 0.0.3-next.38 to 0.0.3-next.39
    * @twin.org/nameof bumped from 0.0.3-next.38 to 0.0.3-next.39
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.38 to 0.0.3-next.39
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.38 to 0.0.3-next.39
    * @twin.org/validate-locales bumped from 0.0.3-next.38 to 0.0.3-next.39

## [0.0.3-next.38](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.37...web-v0.0.3-next.38) (2026-05-11)


### Features

* typescript 6 update ([1d10f31](https://github.com/iotaledger/twin-framework/commit/1d10f31e6516ec622773f45e88af82fe749b384a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.37 to 0.0.3-next.38
    * @twin.org/crypto bumped from 0.0.3-next.37 to 0.0.3-next.38
    * @twin.org/nameof bumped from 0.0.3-next.37 to 0.0.3-next.38
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.37 to 0.0.3-next.38
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.37 to 0.0.3-next.38
    * @twin.org/validate-locales bumped from 0.0.3-next.37 to 0.0.3-next.38

## [0.0.3-next.37](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.36...web-v0.0.3-next.37) (2026-05-07)


### Features

* add IEntitySchemaDiff and entitySchemaDiff utility ([#282](https://github.com/iotaledger/twin-framework/issues/282)) ([9d63e94](https://github.com/iotaledger/twin-framework/commit/9d63e94021ee2ffc138004ee68cf53d08a6b17f9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.36 to 0.0.3-next.37
    * @twin.org/crypto bumped from 0.0.3-next.36 to 0.0.3-next.37
    * @twin.org/nameof bumped from 0.0.3-next.36 to 0.0.3-next.37
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.36 to 0.0.3-next.37
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.36 to 0.0.3-next.37
    * @twin.org/validate-locales bumped from 0.0.3-next.36 to 0.0.3-next.37

## [0.0.3-next.36](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.35...web-v0.0.3-next.36) (2026-05-07)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.35 to 0.0.3-next.36
    * @twin.org/crypto bumped from 0.0.3-next.35 to 0.0.3-next.36
    * @twin.org/nameof bumped from 0.0.3-next.35 to 0.0.3-next.36
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.35 to 0.0.3-next.36
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.35 to 0.0.3-next.36
    * @twin.org/validate-locales bumped from 0.0.3-next.35 to 0.0.3-next.36

## [0.0.3-next.35](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.34...web-v0.0.3-next.35) (2026-05-06)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.34 to 0.0.3-next.35
    * @twin.org/crypto bumped from 0.0.3-next.34 to 0.0.3-next.35
    * @twin.org/nameof bumped from 0.0.3-next.34 to 0.0.3-next.35
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.34 to 0.0.3-next.35
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.34 to 0.0.3-next.35
    * @twin.org/validate-locales bumped from 0.0.3-next.34 to 0.0.3-next.35

## [0.0.3-next.34](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.33...web-v0.0.3-next.34) (2026-05-06)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.33 to 0.0.3-next.34
    * @twin.org/crypto bumped from 0.0.3-next.33 to 0.0.3-next.34
    * @twin.org/nameof bumped from 0.0.3-next.33 to 0.0.3-next.34
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.33 to 0.0.3-next.34
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.33 to 0.0.3-next.34
    * @twin.org/validate-locales bumped from 0.0.3-next.33 to 0.0.3-next.34

## [0.0.3-next.33](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.32...web-v0.0.3-next.33) (2026-05-05)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.32 to 0.0.3-next.33
    * @twin.org/crypto bumped from 0.0.3-next.32 to 0.0.3-next.33
    * @twin.org/nameof bumped from 0.0.3-next.32 to 0.0.3-next.33
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.32 to 0.0.3-next.33
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.32 to 0.0.3-next.33
    * @twin.org/validate-locales bumped from 0.0.3-next.32 to 0.0.3-next.33

## [0.0.3-next.32](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.31...web-v0.0.3-next.32) (2026-04-30)


### Features

* use body on patch verb ([28627e5](https://github.com/iotaledger/twin-framework/commit/28627e527d033d433acefe0e9fde52ba88c0d047))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.31 to 0.0.3-next.32
    * @twin.org/crypto bumped from 0.0.3-next.31 to 0.0.3-next.32
    * @twin.org/nameof bumped from 0.0.3-next.31 to 0.0.3-next.32
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.31 to 0.0.3-next.32
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.31 to 0.0.3-next.32
    * @twin.org/validate-locales bumped from 0.0.3-next.31 to 0.0.3-next.32

## [0.0.3-next.31](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.30...web-v0.0.3-next.31) (2026-04-14)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.30 to 0.0.3-next.31
    * @twin.org/crypto bumped from 0.0.3-next.30 to 0.0.3-next.31
    * @twin.org/nameof bumped from 0.0.3-next.30 to 0.0.3-next.31
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.30 to 0.0.3-next.31
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.30 to 0.0.3-next.31
    * @twin.org/validate-locales bumped from 0.0.3-next.30 to 0.0.3-next.31

## [0.0.3-next.30](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.29...web-v0.0.3-next.30) (2026-04-14)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.29 to 0.0.3-next.30
    * @twin.org/crypto bumped from 0.0.3-next.29 to 0.0.3-next.30
    * @twin.org/nameof bumped from 0.0.3-next.29 to 0.0.3-next.30
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.29 to 0.0.3-next.30
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.29 to 0.0.3-next.30
    * @twin.org/validate-locales bumped from 0.0.3-next.29 to 0.0.3-next.30

## [0.0.3-next.29](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.28...web-v0.0.3-next.29) (2026-04-14)


### Features

* additional http header extraction ([#262](https://github.com/iotaledger/twin-framework/issues/262)) ([124fa3f](https://github.com/iotaledger/twin-framework/commit/124fa3fdd118ed17f973d4b46842f5b7f35365c2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.28 to 0.0.3-next.29
    * @twin.org/crypto bumped from 0.0.3-next.28 to 0.0.3-next.29
    * @twin.org/nameof bumped from 0.0.3-next.28 to 0.0.3-next.29
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.28 to 0.0.3-next.29
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.28 to 0.0.3-next.29
    * @twin.org/validate-locales bumped from 0.0.3-next.28 to 0.0.3-next.29

## [0.0.3-next.28](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.27...web-v0.0.3-next.28) (2026-03-27)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.27 to 0.0.3-next.28
    * @twin.org/crypto bumped from 0.0.3-next.27 to 0.0.3-next.28
    * @twin.org/nameof bumped from 0.0.3-next.27 to 0.0.3-next.28
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.27 to 0.0.3-next.28
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.27 to 0.0.3-next.28
    * @twin.org/validate-locales bumped from 0.0.3-next.27 to 0.0.3-next.28

## [0.0.3-next.27](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.26...web-v0.0.3-next.27) (2026-03-27)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.26 to 0.0.3-next.27
    * @twin.org/crypto bumped from 0.0.3-next.26 to 0.0.3-next.27
    * @twin.org/nameof bumped from 0.0.3-next.26 to 0.0.3-next.27
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.26 to 0.0.3-next.27
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.26 to 0.0.3-next.27
    * @twin.org/validate-locales bumped from 0.0.3-next.26 to 0.0.3-next.27

## [0.0.3-next.26](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.25...web-v0.0.3-next.26) (2026-03-24)


### Features

* additional http link feature support ([b68b4cc](https://github.com/iotaledger/twin-framework/commit/b68b4cc6a6e3cf02f91e794353714e26a49fe66c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.25 to 0.0.3-next.26
    * @twin.org/crypto bumped from 0.0.3-next.25 to 0.0.3-next.26
    * @twin.org/nameof bumped from 0.0.3-next.25 to 0.0.3-next.26
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.25 to 0.0.3-next.26
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.25 to 0.0.3-next.26
    * @twin.org/validate-locales bumped from 0.0.3-next.25 to 0.0.3-next.26

## [0.0.3-next.25](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.24...web-v0.0.3-next.25) (2026-03-23)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.24 to 0.0.3-next.25
    * @twin.org/crypto bumped from 0.0.3-next.24 to 0.0.3-next.25
    * @twin.org/nameof bumped from 0.0.3-next.24 to 0.0.3-next.25
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.24 to 0.0.3-next.25
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.24 to 0.0.3-next.25
    * @twin.org/validate-locales bumped from 0.0.3-next.24 to 0.0.3-next.25

## [0.0.3-next.24](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.23...web-v0.0.3-next.24) (2026-03-19)


### Bug Fixes

* ensure __decorate is defined for decorators ([103a563](https://github.com/iotaledger/twin-framework/commit/103a563ce01ebdef6240d2e590e7b026e8692684))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.23 to 0.0.3-next.24
    * @twin.org/crypto bumped from 0.0.3-next.23 to 0.0.3-next.24
    * @twin.org/nameof bumped from 0.0.3-next.23 to 0.0.3-next.24
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.23 to 0.0.3-next.24
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.23 to 0.0.3-next.24
    * @twin.org/validate-locales bumped from 0.0.3-next.23 to 0.0.3-next.24

## [0.0.3-next.23](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.22...web-v0.0.3-next.23) (2026-03-17)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.22 to 0.0.3-next.23
    * @twin.org/crypto bumped from 0.0.3-next.22 to 0.0.3-next.23
    * @twin.org/nameof bumped from 0.0.3-next.22 to 0.0.3-next.23
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.22 to 0.0.3-next.23
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.22 to 0.0.3-next.23
    * @twin.org/validate-locales bumped from 0.0.3-next.22 to 0.0.3-next.23

## [0.0.3-next.22](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.21...web-v0.0.3-next.22) (2026-02-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.21 to 0.0.3-next.22
    * @twin.org/crypto bumped from 0.0.3-next.21 to 0.0.3-next.22
    * @twin.org/nameof bumped from 0.0.3-next.21 to 0.0.3-next.22
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.21 to 0.0.3-next.22
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.21 to 0.0.3-next.22
    * @twin.org/validate-locales bumped from 0.0.3-next.21 to 0.0.3-next.22

## [0.0.3-next.21](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.20...web-v0.0.3-next.21) (2026-02-26)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))
* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))
* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))
* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.20 to 0.0.3-next.21
    * @twin.org/crypto bumped from 0.0.3-next.20 to 0.0.3-next.21
    * @twin.org/nameof bumped from 0.0.3-next.20 to 0.0.3-next.21
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.20 to 0.0.3-next.21
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.20 to 0.0.3-next.21
    * @twin.org/validate-locales bumped from 0.0.3-next.20 to 0.0.3-next.21

## [0.0.3-next.20](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.19...web-v0.0.3-next.20) (2026-02-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.19 to 0.0.3-next.20
    * @twin.org/crypto bumped from 0.0.3-next.19 to 0.0.3-next.20
    * @twin.org/nameof bumped from 0.0.3-next.19 to 0.0.3-next.20
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.19 to 0.0.3-next.20
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.19 to 0.0.3-next.20
    * @twin.org/validate-locales bumped from 0.0.3-next.19 to 0.0.3-next.20

## [0.0.3-next.19](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.18...web-v0.0.3-next.19) (2026-02-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.18 to 0.0.3-next.19
    * @twin.org/crypto bumped from 0.0.3-next.18 to 0.0.3-next.19
    * @twin.org/nameof bumped from 0.0.3-next.18 to 0.0.3-next.19
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.18 to 0.0.3-next.19
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.18 to 0.0.3-next.19
    * @twin.org/validate-locales bumped from 0.0.3-next.18 to 0.0.3-next.19

## [0.0.3-next.18](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.17...web-v0.0.3-next.18) (2026-02-23)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.17 to 0.0.3-next.18
    * @twin.org/crypto bumped from 0.0.3-next.17 to 0.0.3-next.18
    * @twin.org/nameof bumped from 0.0.3-next.17 to 0.0.3-next.18
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.17 to 0.0.3-next.18
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.17 to 0.0.3-next.18
    * @twin.org/validate-locales bumped from 0.0.3-next.17 to 0.0.3-next.18

## [0.0.3-next.17](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.16...web-v0.0.3-next.17) (2026-02-09)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.16 to 0.0.3-next.17
    * @twin.org/crypto bumped from 0.0.3-next.16 to 0.0.3-next.17
    * @twin.org/nameof bumped from 0.0.3-next.16 to 0.0.3-next.17
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.16 to 0.0.3-next.17
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.16 to 0.0.3-next.17
    * @twin.org/validate-locales bumped from 0.0.3-next.16 to 0.0.3-next.17

## [0.0.3-next.16](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.15...web-v0.0.3-next.16) (2026-02-06)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.15 to 0.0.3-next.16
    * @twin.org/crypto bumped from 0.0.3-next.15 to 0.0.3-next.16
    * @twin.org/nameof bumped from 0.0.3-next.15 to 0.0.3-next.16
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.15 to 0.0.3-next.16
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.15 to 0.0.3-next.16
    * @twin.org/validate-locales bumped from 0.0.3-next.15 to 0.0.3-next.16

## [0.0.3-next.15](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.14...web-v0.0.3-next.15) (2026-01-29)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.14 to 0.0.3-next.15
    * @twin.org/crypto bumped from 0.0.3-next.14 to 0.0.3-next.15
    * @twin.org/nameof bumped from 0.0.3-next.14 to 0.0.3-next.15
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.14 to 0.0.3-next.15
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.14 to 0.0.3-next.15
    * @twin.org/validate-locales bumped from 0.0.3-next.14 to 0.0.3-next.15

## [0.0.3-next.14](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.13...web-v0.0.3-next.14) (2026-01-22)


### Features

* add/update http and mime types ([#229](https://github.com/iotaledger/twin-framework/issues/229)) ([d50154a](https://github.com/iotaledger/twin-framework/commit/d50154a484711b67feb42ea20a94e4415e53d392))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.13 to 0.0.3-next.14
    * @twin.org/crypto bumped from 0.0.3-next.13 to 0.0.3-next.14
    * @twin.org/nameof bumped from 0.0.3-next.13 to 0.0.3-next.14
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.13 to 0.0.3-next.14
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.13 to 0.0.3-next.14
    * @twin.org/validate-locales bumped from 0.0.3-next.13 to 0.0.3-next.14

## [0.0.3-next.13](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.12...web-v0.0.3-next.13) (2026-01-08)


### Features

* add Link header array support ([aff32a3](https://github.com/iotaledger/twin-framework/commit/aff32a3ff8ad3d076cade7c889444220706bfb1e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.12 to 0.0.3-next.13
    * @twin.org/crypto bumped from 0.0.3-next.12 to 0.0.3-next.13
    * @twin.org/nameof bumped from 0.0.3-next.12 to 0.0.3-next.13
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.12 to 0.0.3-next.13
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.12 to 0.0.3-next.13
    * @twin.org/validate-locales bumped from 0.0.3-next.12 to 0.0.3-next.13

## [0.0.3-next.12](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.11...web-v0.0.3-next.12) (2026-01-08)


### Features

* adding link header helper ([#225](https://github.com/iotaledger/twin-framework/issues/225)) ([703c072](https://github.com/iotaledger/twin-framework/commit/703c0725aceac6b6ec0c4fa729ef832d12fb3fd7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.11 to 0.0.3-next.12
    * @twin.org/crypto bumped from 0.0.3-next.11 to 0.0.3-next.12
    * @twin.org/nameof bumped from 0.0.3-next.11 to 0.0.3-next.12
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.11 to 0.0.3-next.12
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.11 to 0.0.3-next.12
    * @twin.org/validate-locales bumped from 0.0.3-next.11 to 0.0.3-next.12

## [0.0.3-next.11](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.10...web-v0.0.3-next.11) (2026-01-07)


### Features

* add additional header types ([#222](https://github.com/iotaledger/twin-framework/issues/222)) ([05f01cf](https://github.com/iotaledger/twin-framework/commit/05f01cf34b7bcec561ee989f679281b1cacdf032))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.10 to 0.0.3-next.11
    * @twin.org/crypto bumped from 0.0.3-next.10 to 0.0.3-next.11
    * @twin.org/nameof bumped from 0.0.3-next.10 to 0.0.3-next.11
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.10 to 0.0.3-next.11
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.10 to 0.0.3-next.11
    * @twin.org/validate-locales bumped from 0.0.3-next.10 to 0.0.3-next.11

## [0.0.3-next.10](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.9...web-v0.0.3-next.10) (2026-01-07)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.9 to 0.0.3-next.10
    * @twin.org/crypto bumped from 0.0.3-next.9 to 0.0.3-next.10
    * @twin.org/nameof bumped from 0.0.3-next.9 to 0.0.3-next.10
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.9 to 0.0.3-next.10
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.9 to 0.0.3-next.10
    * @twin.org/validate-locales bumped from 0.0.3-next.9 to 0.0.3-next.10

## [0.0.3-next.9](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.8...web-v0.0.3-next.9) (2026-01-05)


### Features

* add cookie helper method to web package ([#217](https://github.com/iotaledger/twin-framework/issues/217)) ([043c632](https://github.com/iotaledger/twin-framework/commit/043c63298bff96f70bdefed56b82afef42ec3f44))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.8 to 0.0.3-next.9
    * @twin.org/crypto bumped from 0.0.3-next.8 to 0.0.3-next.9
    * @twin.org/nameof bumped from 0.0.3-next.8 to 0.0.3-next.9
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.8 to 0.0.3-next.9
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.8 to 0.0.3-next.9
    * @twin.org/validate-locales bumped from 0.0.3-next.8 to 0.0.3-next.9

## [0.0.3-next.8](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.7...web-v0.0.3-next.8) (2025-11-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.7 to 0.0.3-next.8
    * @twin.org/crypto bumped from 0.0.3-next.7 to 0.0.3-next.8
    * @twin.org/nameof bumped from 0.0.3-next.7 to 0.0.3-next.8
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.7 to 0.0.3-next.8
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.7 to 0.0.3-next.8
    * @twin.org/validate-locales bumped from 0.0.3-next.7 to 0.0.3-next.8

## [0.0.3-next.7](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.6...web-v0.0.3-next.7) (2025-11-25)


### Features

* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.6 to 0.0.3-next.7
    * @twin.org/crypto bumped from 0.0.3-next.6 to 0.0.3-next.7
    * @twin.org/nameof bumped from 0.0.3-next.6 to 0.0.3-next.7
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.6 to 0.0.3-next.7
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.6 to 0.0.3-next.7
    * @twin.org/validate-locales bumped from 0.0.3-next.6 to 0.0.3-next.7

## [0.0.3-next.6](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.5...web-v0.0.3-next.6) (2025-11-25)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.5 to 0.0.3-next.6
    * @twin.org/crypto bumped from 0.0.3-next.5 to 0.0.3-next.6
    * @twin.org/nameof bumped from 0.0.3-next.5 to 0.0.3-next.6
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.5 to 0.0.3-next.6
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.5 to 0.0.3-next.6
    * @twin.org/validate-locales bumped from 0.0.3-next.5 to 0.0.3-next.6

## [0.0.3-next.5](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.4...web-v0.0.3-next.5) (2025-11-20)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.4 to 0.0.3-next.5
    * @twin.org/crypto bumped from 0.0.3-next.4 to 0.0.3-next.5
    * @twin.org/nameof bumped from 0.0.3-next.4 to 0.0.3-next.5
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.4 to 0.0.3-next.5
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.4 to 0.0.3-next.5
    * @twin.org/validate-locales bumped from 0.0.3-next.4 to 0.0.3-next.5

## [0.0.3-next.4](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.3...web-v0.0.3-next.4) (2025-11-13)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.3 to 0.0.3-next.4
    * @twin.org/crypto bumped from 0.0.3-next.3 to 0.0.3-next.4
    * @twin.org/nameof bumped from 0.0.3-next.3 to 0.0.3-next.4
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.3 to 0.0.3-next.4
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.3 to 0.0.3-next.4
    * @twin.org/validate-locales bumped from 0.0.3-next.3 to 0.0.3-next.4

## [0.0.3-next.3](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.2...web-v0.0.3-next.3) (2025-11-12)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.2 to 0.0.3-next.3
    * @twin.org/crypto bumped from 0.0.3-next.2 to 0.0.3-next.3
    * @twin.org/nameof bumped from 0.0.3-next.2 to 0.0.3-next.3
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.2 to 0.0.3-next.3
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.2 to 0.0.3-next.3
    * @twin.org/validate-locales bumped from 0.0.3-next.2 to 0.0.3-next.3

## [0.0.3-next.2](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.1...web-v0.0.3-next.2) (2025-11-12)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.1 to 0.0.3-next.2
    * @twin.org/crypto bumped from 0.0.3-next.1 to 0.0.3-next.2
    * @twin.org/nameof bumped from 0.0.3-next.1 to 0.0.3-next.2
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.1 to 0.0.3-next.2
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.1 to 0.0.3-next.2
    * @twin.org/validate-locales bumped from 0.0.3-next.1 to 0.0.3-next.2

## [0.0.3-next.1](https://github.com/iotaledger/twin-framework/compare/web-v0.0.3-next.0...web-v0.0.3-next.1) (2025-11-10)


### Features

* add context id features ([#206](https://github.com/iotaledger/twin-framework/issues/206)) ([ef0d4ee](https://github.com/iotaledger/twin-framework/commit/ef0d4ee11a4f5fc6cc6f52a4958ce905c04ee13b))
* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))
* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))
* improve bearer creation and extraction ([b9ddd6d](https://github.com/iotaledger/twin-framework/commit/b9ddd6dae0cb558e2227f0ec5e9cd21f85957400))
* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))
* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.3-next.0 to 0.0.3-next.1
    * @twin.org/crypto bumped from 0.0.3-next.0 to 0.0.3-next.1
    * @twin.org/nameof bumped from 0.0.3-next.0 to 0.0.3-next.1
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.3-next.0 to 0.0.3-next.1
    * @twin.org/nameof-vitest-plugin bumped from 0.0.3-next.0 to 0.0.3-next.1
    * @twin.org/validate-locales bumped from 0.0.3-next.0 to 0.0.3-next.1

## [0.0.2-next.22](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.21...web-v0.0.2-next.22) (2025-10-10)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.21 to 0.0.2-next.22
    * @twin.org/crypto bumped from 0.0.2-next.21 to 0.0.2-next.22
    * @twin.org/nameof bumped from 0.0.2-next.21 to 0.0.2-next.22
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.21 to 0.0.2-next.22
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.21 to 0.0.2-next.22
    * @twin.org/validate-locales bumped from 0.0.2-next.21 to 0.0.2-next.22

## [0.0.2-next.21](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.20...web-v0.0.2-next.21) (2025-10-09)


### Features

* locales validation ([#197](https://github.com/iotaledger/twin-framework/issues/197)) ([55fdadb](https://github.com/iotaledger/twin-framework/commit/55fdadb13595ce0047f787bd1d4135d429a99f12))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.20 to 0.0.2-next.21
    * @twin.org/crypto bumped from 0.0.2-next.20 to 0.0.2-next.21
    * @twin.org/nameof bumped from 0.0.2-next.20 to 0.0.2-next.21
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.20 to 0.0.2-next.21
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.20 to 0.0.2-next.21
    * @twin.org/validate-locales bumped from 0.0.2-next.20 to 0.0.2-next.21

## [0.0.2-next.20](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.19...web-v0.0.2-next.20) (2025-10-02)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.19 to 0.0.2-next.20
    * @twin.org/crypto bumped from 0.0.2-next.19 to 0.0.2-next.20
    * @twin.org/nameof bumped from 0.0.2-next.19 to 0.0.2-next.20
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.19 to 0.0.2-next.20
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.19 to 0.0.2-next.20

## [0.0.2-next.19](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.18...web-v0.0.2-next.19) (2025-09-30)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.18 to 0.0.2-next.19
    * @twin.org/crypto bumped from 0.0.2-next.18 to 0.0.2-next.19
    * @twin.org/nameof bumped from 0.0.2-next.18 to 0.0.2-next.19
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.18 to 0.0.2-next.19
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.18 to 0.0.2-next.19

## [0.0.2-next.18](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.17...web-v0.0.2-next.18) (2025-09-29)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.17 to 0.0.2-next.18
    * @twin.org/crypto bumped from 0.0.2-next.17 to 0.0.2-next.18
    * @twin.org/nameof bumped from 0.0.2-next.17 to 0.0.2-next.18
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.17 to 0.0.2-next.18
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.17 to 0.0.2-next.18

## [0.0.2-next.17](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.16...web-v0.0.2-next.17) (2025-09-29)


### Features

* additional nameof operators ([a5aab60](https://github.com/iotaledger/twin-framework/commit/a5aab60bf66a86f1b7ff8af7c4f044cb03706d50))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.16 to 0.0.2-next.17
    * @twin.org/crypto bumped from 0.0.2-next.16 to 0.0.2-next.17
    * @twin.org/nameof bumped from 0.0.2-next.16 to 0.0.2-next.17
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.16 to 0.0.2-next.17
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.16 to 0.0.2-next.17

## [0.0.2-next.16](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.15...web-v0.0.2-next.16) (2025-09-28)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.15 to 0.0.2-next.16
    * @twin.org/crypto bumped from 0.0.2-next.15 to 0.0.2-next.16
    * @twin.org/nameof bumped from 0.0.2-next.15 to 0.0.2-next.16
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.15 to 0.0.2-next.16
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.15 to 0.0.2-next.16

## [0.0.2-next.15](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.14...web-v0.0.2-next.15) (2025-09-22)


### Features

* improve bearer creation and extraction ([29a347a](https://github.com/iotaledger/twin-framework/commit/29a347a760cb3bc5eb819112e84f1ac99430e72b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.14 to 0.0.2-next.15
    * @twin.org/crypto bumped from 0.0.2-next.14 to 0.0.2-next.15
    * @twin.org/nameof bumped from 0.0.2-next.14 to 0.0.2-next.15
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.14 to 0.0.2-next.15
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.14 to 0.0.2-next.15

## [0.0.2-next.14](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.13...web-v0.0.2-next.14) (2025-09-22)


### Features

* add header helper for common bearer support ([0c940b2](https://github.com/iotaledger/twin-framework/commit/0c940b29cccf0c3bb5b4aa8a01f1998010e44d51))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.13 to 0.0.2-next.14
    * @twin.org/crypto bumped from 0.0.2-next.13 to 0.0.2-next.14
    * @twin.org/nameof bumped from 0.0.2-next.13 to 0.0.2-next.14
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.13 to 0.0.2-next.14
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.13 to 0.0.2-next.14

## [0.0.2-next.13](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.12...web-v0.0.2-next.13) (2025-09-22)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.12 to 0.0.2-next.13
    * @twin.org/crypto bumped from 0.0.2-next.12 to 0.0.2-next.13
    * @twin.org/nameof bumped from 0.0.2-next.12 to 0.0.2-next.13
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.12 to 0.0.2-next.13
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.12 to 0.0.2-next.13

## [0.0.2-next.12](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.11...web-v0.0.2-next.12) (2025-09-15)


### Features

* add jwk enc property overrides ([18b6309](https://github.com/iotaledger/twin-framework/commit/18b63092a386b56ea7fcd7e12865ac6e1b47cc1e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.11 to 0.0.2-next.12
    * @twin.org/crypto bumped from 0.0.2-next.11 to 0.0.2-next.12
    * @twin.org/nameof bumped from 0.0.2-next.11 to 0.0.2-next.12
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.11 to 0.0.2-next.12
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.11 to 0.0.2-next.12

## [0.0.2-next.11](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.10...web-v0.0.2-next.11) (2025-09-15)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.10 to 0.0.2-next.11
    * @twin.org/crypto bumped from 0.0.2-next.10 to 0.0.2-next.11
    * @twin.org/nameof bumped from 0.0.2-next.10 to 0.0.2-next.11
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.10 to 0.0.2-next.11
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.10 to 0.0.2-next.11

## [0.0.2-next.10](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.9...web-v0.0.2-next.10) (2025-09-11)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.9 to 0.0.2-next.10
    * @twin.org/crypto bumped from 0.0.2-next.9 to 0.0.2-next.10
    * @twin.org/nameof bumped from 0.0.2-next.9 to 0.0.2-next.10
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.9 to 0.0.2-next.10
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.9 to 0.0.2-next.10

## [0.0.2-next.9](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.8...web-v0.0.2-next.9) (2025-09-08)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.8 to 0.0.2-next.9
    * @twin.org/crypto bumped from 0.0.2-next.8 to 0.0.2-next.9
    * @twin.org/nameof bumped from 0.0.2-next.8 to 0.0.2-next.9
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.8 to 0.0.2-next.9
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.8 to 0.0.2-next.9

## [0.0.2-next.8](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.7...web-v0.0.2-next.8) (2025-09-05)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.7 to 0.0.2-next.8
    * @twin.org/crypto bumped from 0.0.2-next.7 to 0.0.2-next.8
    * @twin.org/nameof bumped from 0.0.2-next.7 to 0.0.2-next.8
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.7 to 0.0.2-next.8
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.7 to 0.0.2-next.8

## [0.0.2-next.7](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.6...web-v0.0.2-next.7) (2025-08-29)


### Features

* eslint migration to flat config ([74427d7](https://github.com/iotaledger/twin-framework/commit/74427d78d342167f7850e49ab87269326355befe))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.6 to 0.0.2-next.7
    * @twin.org/crypto bumped from 0.0.2-next.6 to 0.0.2-next.7
    * @twin.org/nameof bumped from 0.0.2-next.6 to 0.0.2-next.7
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.6 to 0.0.2-next.7
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.6 to 0.0.2-next.7

## [0.0.2-next.6](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.5...web-v0.0.2-next.6) (2025-08-27)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.5 to 0.0.2-next.6
    * @twin.org/crypto bumped from 0.0.2-next.5 to 0.0.2-next.6
    * @twin.org/nameof bumped from 0.0.2-next.5 to 0.0.2-next.6
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.5 to 0.0.2-next.6
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.5 to 0.0.2-next.6

## [0.0.2-next.5](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.4...web-v0.0.2-next.5) (2025-08-19)


### Features

* use cause instead of inner for errors ([1f4acc4](https://github.com/iotaledger/twin-framework/commit/1f4acc4d7a6b71a134d9547da9bf40de1e1e49da))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.4 to 0.0.2-next.5
    * @twin.org/crypto bumped from 0.0.2-next.4 to 0.0.2-next.5
    * @twin.org/nameof bumped from 0.0.2-next.4 to 0.0.2-next.5
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.4 to 0.0.2-next.5
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.4 to 0.0.2-next.5

## [0.0.2-next.4](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.3...web-v0.0.2-next.4) (2025-08-15)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.3 to 0.0.2-next.4
    * @twin.org/crypto bumped from 0.0.2-next.3 to 0.0.2-next.4
    * @twin.org/nameof bumped from 0.0.2-next.3 to 0.0.2-next.4
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.3 to 0.0.2-next.4
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.3 to 0.0.2-next.4

## [0.0.2-next.3](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.2...web-v0.0.2-next.3) (2025-08-06)


### Features

* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.2 to 0.0.2-next.3
    * @twin.org/crypto bumped from 0.0.2-next.2 to 0.0.2-next.3
    * @twin.org/nameof bumped from 0.0.2-next.2 to 0.0.2-next.3
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.2 to 0.0.2-next.3
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.2 to 0.0.2-next.3

## [0.0.2-next.2](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.1...web-v0.0.2-next.2) (2025-08-06)


### Features

* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.1 to 0.0.2-next.2
    * @twin.org/crypto bumped from 0.0.2-next.1 to 0.0.2-next.2
    * @twin.org/nameof bumped from 0.0.2-next.1 to 0.0.2-next.2
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.1 to 0.0.2-next.2
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.1 to 0.0.2-next.2

## [0.0.2-next.1](https://github.com/iotaledger/twin-framework/compare/web-v0.0.2-next.0...web-v0.0.2-next.1) (2025-08-06)


### Features

* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add rsa cipher support ([7af6cc6](https://github.com/iotaledger/twin-framework/commit/7af6cc67512d3363bd4a2f2e87bd7733c2800147))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* update dependencies ([f3bd015](https://github.com/iotaledger/twin-framework/commit/f3bd015efd169196b7e0335f5cab876ba6ca1d75))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.2-next.0 to 0.0.2-next.1
    * @twin.org/crypto bumped from 0.0.2-next.0 to 0.0.2-next.1
    * @twin.org/nameof bumped from 0.0.2-next.0 to 0.0.2-next.1
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.2-next.0 to 0.0.2-next.1
    * @twin.org/nameof-vitest-plugin bumped from 0.0.2-next.0 to 0.0.2-next.1

## 0.0.1 (2025-07-03)


### Features

* release to production ([829d53d](https://github.com/iotaledger/twin-framework/commit/829d53d3953b1e1b40b0243c04cfdfd3842aac7b))
* release to production ([5cf3a76](https://github.com/iotaledger/twin-framework/commit/5cf3a76a09eff2e6414d0cba846c7c37400a11d6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from ^0.0.0 to ^0.0.1
    * @twin.org/crypto bumped from ^0.0.0 to ^0.0.1
    * @twin.org/nameof bumped from ^0.0.0 to ^0.0.1
  * devDependencies
    * @twin.org/nameof-transformer bumped from ^0.0.0 to ^0.0.1
    * @twin.org/nameof-vitest-plugin bumped from ^0.0.0 to ^0.0.1

## [0.0.1-next.70](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.69...web-v0.0.1-next.70) (2025-07-02)


### Features

* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.69 to 0.0.1-next.70
    * @twin.org/crypto bumped from 0.0.1-next.69 to 0.0.1-next.70
    * @twin.org/nameof bumped from 0.0.1-next.69 to 0.0.1-next.70
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.1-next.69 to 0.0.1-next.70
    * @twin.org/nameof-vitest-plugin bumped from 0.0.1-next.69 to 0.0.1-next.70

## [0.0.1-next.69](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.68...web-v0.0.1-next.69) (2025-07-02)


### Features

* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.68 to 0.0.1-next.69
    * @twin.org/crypto bumped from 0.0.1-next.68 to 0.0.1-next.69
    * @twin.org/nameof bumped from 0.0.1-next.68 to 0.0.1-next.69
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.1-next.68 to 0.0.1-next.69
    * @twin.org/nameof-vitest-plugin bumped from 0.0.1-next.68 to 0.0.1-next.69

## [0.0.1-next.68](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.67...web-v0.0.1-next.68) (2025-07-02)


### Features

* relocate core packages from tools ([bcab8f3](https://github.com/iotaledger/twin-framework/commit/bcab8f3160442ea4fcaf442947462504f3d6a17d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.67 to 0.0.1-next.68
    * @twin.org/crypto bumped from 0.0.1-next.67 to 0.0.1-next.68
    * @twin.org/nameof bumped from 0.0.1-next.67 to 0.0.1-next.68
  * devDependencies
    * @twin.org/nameof-transformer bumped from 0.0.1-next.67 to 0.0.1-next.68
    * @twin.org/nameof-vitest-plugin bumped from 0.0.1-next.67 to 0.0.1-next.68

## [0.0.1-next.67](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.66...web-v0.0.1-next.67) (2025-06-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.66 to 0.0.1-next.67
    * @twin.org/crypto bumped from 0.0.1-next.66 to 0.0.1-next.67

## [0.0.1-next.66](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.65...web-v0.0.1-next.66) (2025-06-26)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.65 to 0.0.1-next.66
    * @twin.org/crypto bumped from 0.0.1-next.65 to 0.0.1-next.66

## [0.0.1-next.65](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.64...web-v0.0.1-next.65) (2025-06-19)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.64 to 0.0.1-next.65
    * @twin.org/crypto bumped from 0.0.1-next.64 to 0.0.1-next.65

## [0.0.1-next.64](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.63...web-v0.0.1-next.64) (2025-06-19)


### Features

* add zlib/deflate mime types detection ([72c472b](https://github.com/iotaledger/twin-framework/commit/72c472b5a35a973e7109336f5b6cdd84dbb8bbcb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.63 to 0.0.1-next.64
    * @twin.org/crypto bumped from 0.0.1-next.63 to 0.0.1-next.64

## [0.0.1-next.63](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.62...web-v0.0.1-next.63) (2025-06-18)


### Features

* add kid method to Jwk ([bc9239e](https://github.com/iotaledger/twin-framework/commit/bc9239ed9896a053d83e00ca221e962704ebc277))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.62 to 0.0.1-next.63
    * @twin.org/crypto bumped from 0.0.1-next.62 to 0.0.1-next.63

## [0.0.1-next.62](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.61...web-v0.0.1-next.62) (2025-06-17)


### Features

* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))
* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))
* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))
* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))
* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.61 to 0.0.1-next.62
    * @twin.org/crypto bumped from 0.0.1-next.61 to 0.0.1-next.62

## [0.0.1-next.61](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.60...web-v0.0.1-next.61) (2025-06-17)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.60 to 0.0.1-next.61
    * @twin.org/crypto bumped from 0.0.1-next.60 to 0.0.1-next.61

## [0.0.1-next.60](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.59...web-v0.0.1-next.60) (2025-06-17)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.59 to 0.0.1-next.60
    * @twin.org/crypto bumped from 0.0.1-next.59 to 0.0.1-next.60

## [0.0.1-next.59](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.58...web-v0.0.1-next.59) (2025-06-17)


### Features

* propagate includeStackTrace on error conversion ([098fc72](https://github.com/iotaledger/twin-framework/commit/098fc729939ea3127f2bdcc0ddb6754096c5f919))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.58 to 0.0.1-next.59
    * @twin.org/crypto bumped from 0.0.1-next.58 to 0.0.1-next.59

## [0.0.1-next.58](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.57...web-v0.0.1-next.58) (2025-06-13)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.57 to 0.0.1-next.58
    * @twin.org/crypto bumped from 0.0.1-next.57 to 0.0.1-next.58

## [0.0.1-next.57](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.56...web-v0.0.1-next.57) (2025-06-10)


### Features

* add guards arrayEndsWith and arrayStartsWith ([95d875e](https://github.com/iotaledger/twin-framework/commit/95d875ec8ccb4713c145fdde941d4cfedcec2ed3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.56 to 0.0.1-next.57
    * @twin.org/crypto bumped from 0.0.1-next.56 to 0.0.1-next.57

## [0.0.1-next.56](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.55...web-v0.0.1-next.56) (2025-05-08)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.55 to 0.0.1-next.56
    * @twin.org/crypto bumped from 0.0.1-next.55 to 0.0.1-next.56

## [0.0.1-next.55](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.54...web-v0.0.1-next.55) (2025-05-07)


### Features

* ensure the alg is the correct one when generating JWK or JWS ([#136](https://github.com/iotaledger/twin-framework/issues/136)) ([46a5af1](https://github.com/iotaledger/twin-framework/commit/46a5af127192d7048068275d14f555f09add3642))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.54 to 0.0.1-next.55
    * @twin.org/crypto bumped from 0.0.1-next.54 to 0.0.1-next.55

## [0.0.1-next.54](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.53...web-v0.0.1-next.54) (2025-05-06)


### Bug Fixes

* wrap inner error within FetchError / 2 ([#134](https://github.com/iotaledger/twin-framework/issues/134)) ([2ddb101](https://github.com/iotaledger/twin-framework/commit/2ddb101c3778be4e99559e37aa036cd7101585fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.53 to 0.0.1-next.54
    * @twin.org/crypto bumped from 0.0.1-next.53 to 0.0.1-next.54

## [0.0.1-next.53](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.52...web-v0.0.1-next.53) (2025-05-01)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.52 to 0.0.1-next.53
    * @twin.org/crypto bumped from 0.0.1-next.52 to 0.0.1-next.53

## [0.0.1-next.52](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.51...web-v0.0.1-next.52) (2025-04-17)


### Features

* use new shared store mechanism ([#131](https://github.com/iotaledger/twin-framework/issues/131)) ([934385b](https://github.com/iotaledger/twin-framework/commit/934385b2fbaf9f5c00a505ebf9d093bd5a425f55))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.51 to 0.0.1-next.52
    * @twin.org/crypto bumped from 0.0.1-next.51 to 0.0.1-next.52

## [0.0.1-next.51](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.50...web-v0.0.1-next.51) (2025-03-27)


### Miscellaneous Chores

* **web:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.50 to 0.0.1-next.51
    * @twin.org/crypto bumped from 0.0.1-next.50 to 0.0.1-next.51

## [0.0.1-next.50](https://github.com/iotaledger/twin-framework/compare/web-v0.0.1-next.49...web-v0.0.1-next.50) (2025-03-26)


### Features

* add set method for async caches ([ba34b55](https://github.com/iotaledger/twin-framework/commit/ba34b55e651ad56ab8fc59e139e4af631c19cda0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/core bumped from 0.0.1-next.49 to 0.0.1-next.50
    * @twin.org/crypto bumped from 0.0.1-next.49 to 0.0.1-next.50

## 0.0.1-next.49

- Initial Release
