FROM node:6.9.5

# Create app directory
WORKDIR /cipher/application/api

# Install app dependencies
COPY package.json .


# Create app directory
WORKDIR /cipher/application/api

# Install app dependencies
# COPY package.json.
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json .

RUN npm install

# Bundle app source
COPY . .

EXPOSE 10051
CMD [ "node", "app.js"]

