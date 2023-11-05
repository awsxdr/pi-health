# pi-health
Health reporting service for Raspberry Pi (and similar devices)

## Usage

`./pi-health [--port=8002] [--logLevel=info]`

| Switch     | Description                  |
|------------|------------------------------|
| --port, -p | Set the port that the health API is exposed on. Defaults to 8002. |
| --logLevel | The level of logging to use. Valid values are `trace`, `debug`, `info`, `warn`, `error`, `none`. Defaults to `info`. |

## Compiling

### Client

The client requires the Rust compiler. Instructions for installing the compiler can be found in the official [Rust getting started guide](https://www.rust-lang.org/learn/get-started).

To compile, navigate to the `/client` directory and run

```cargo build --release```

This will build the client in the `/client/target/release` directory.

### UI

The UI requires NodeJS to build. Instructions for installing Node can be found at the [official NodeJS site](https://nodejs.org/) (Select LTS, not Current!)

To build, navigate to the `/ui` directory and run

```npm run build```

This will build the UI in the `/ui/dist` directory.

### Build script

To build both the UI and client at once, use the `build.sh` build script. This is Linux only - other platforms should build the components individually.
