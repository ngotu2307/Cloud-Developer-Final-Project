Cloud Developer Nanodegree - Final Project
Serverless project: TODO application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

# New features

- Sort todo list by CreatedAt property with order: Asc, Desc
- Filter items with "Done" status and "Not done"

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

## Screenshots

Sort by CreatedAt:
![Screenshot 2023-09-14 105944](https://github.com/ngotu2307/Cloud-Developer-Final-Project/assets/9153265/3e855369-6a32-4974-bfd2-a9592d9705db)



Done Filter:

![Screenshot 2023-09-14 110042](https://github.com/ngotu2307/Cloud-Developer-Final-Project/assets/9153265/633154b2-5b27-4d34-bb61-bcd54443e9c5)


