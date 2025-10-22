# Multiplayer Texas Hold'em home game

This is a place you can quickly play poker with your friends.

## Usage

Install dependencies for server and client with:

`npm run install-deps`

Before moving forward, if you are using linux, replace `package.json` with `package.linux.json`

## Build and run local

Build project with:

`npm run build`

Run project with:

`npm run start`

Run CLI client with:

`npm run cli`

Clean build folder with:

`npm run clean`

## Build Docker image

Build docker image using:

`docker build -t thoai495/texas-holdem:<tag> .`

## Development

Start server with:

`npm run server`

Run client with:

`npm run client`