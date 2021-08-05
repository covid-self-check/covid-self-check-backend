# Comcovid-backends

The server application to handle chat bot and dealing with both patients and vonlunteers information

## Prerequesite

- Firebase CLI
- NodeJS

## Get environment variable for local development

`firebase functions:config:get > .runtimeconfig.json`

`firebase functions:config:get | ac .runtimeconfig.json`

## Local test
### Prerequesites
- firebase
- ngrok
### Steps
1. Install firebase emulators (install every emulator).
```
firebase init emulators
```
2. Start the cloud function server.
```
cd functions
yarn install
yarn test
````
3. Start the ngrok tunnel (Using region Japan).
```
ngrok http -region=jp 5001 
```
4. Connect webhook to line. 
Your webhook url should look like this: "http://localhost:5001/(project_name)/asia-southeast2/webhook" <- local webhook.
Replace local webhook domain with ngrok domain.
