# Stage build
FROM node as build
RUN apt-get update && apt-get -y upgrade

COPY package*.json ./
RUN yarn install 

COPY . .
RUN yarn build

# Stage run 
FROM node
RUN apt-get update && apt-get -y upgrade
RUN mkdir -p "/var/www/ratior"
WORKDIR "/var/www/ratior"

COPY package*.json ./
RUN yarn install --production

COPY --from=build build build

CMD ["bash", "-c", "yarn start"]