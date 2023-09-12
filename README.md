Cloud Developer Nanodegree - Final Project
Serverless project: TODO application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

# How to run the application

## Backend

```
cd backend
npm install
npx sls deploy -v
```

## Frontend

To run client application first edit the `client/src/config.ts` file to set correct parameters. And then run:

```
cd client
npm install
npm run start
```
