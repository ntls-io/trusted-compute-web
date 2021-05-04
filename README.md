# trusted-compute

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Refreshing Azure signing keys

The project currently relies on local copies of the Azure attestation JWS signing keys:
refer to `src/utils/jwt.ts`

To refresh these local copies, run:

```shell
yarn refresh-azure-certs
```

Changes to the local copy should probably be committed at least whenever a `kid` (Key ID) changes.

Changes to the `x5c` (X.509 Certificate Chain) fields can probably be considered transient: these change on an ongoing basis.
