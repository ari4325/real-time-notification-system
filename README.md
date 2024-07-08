To configure and run the server-side application:
1. Create a .env file and add the following
```
PORT=
MONGO_URI=
JWT_SECRET=
RABBITMQ_URL=
```
2. Run ```npm install``` to install the dependencies. 
3. Run the custom_client.html on a local server and update server.js with PORT to allow CORS. This html file acts as the client to read notifications using a Socket.io connection.
4. Run ```npm start``` to start the server. Since nodemon is installed, the server will be listening to changes you make the code. 
5. To run this file as a Docker image, update the docker-compose.yaml file with PORT and version for Node and run ```docker-compose up --build``` on your terminal. Ensure docker is installed and is added to PATH.  
