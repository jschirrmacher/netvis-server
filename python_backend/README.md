# Python program for loading and filtering data from RC database

## Requirements
- Docker
- MongoDB with RC database
- Netvis server

## Configuration
The container can be configured with the following environment variables:

| Name | Description | Example |
| ---- | ----------- | ------- |
| DATA_COUNT | Number of Messages processed | 500000 | 
| FILTERW | Threshold for word occurance | 10 |
| MONGO_DB | Name of RC Database | Team |
| MONGO_URL | URL of the MongoDB | mongodb://host.docker.internal:27017 |
| SERVER_URL | Netvis server URL | http://host.docker.internal:3002 |

Create an `.env` file with the desired variables.

## Build & Run
`docker build -t rcanalysis .`
`docker run --env-file=.env rcanalysis`
