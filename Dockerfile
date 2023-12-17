FROM node:14.18.1-alpine as build
ENV E_PORT=3002
ENV DOCKER_PORT=3002
ENV EXPRESS_ENVIRONMENT=development
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY ./package*.json ./
# COPY ./jest-e2e.json ./
# COPY ./nest-cli.json ./
USER node
RUN npm install yarn
RUN yarn install
COPY --chown=node:node src ./src
# RUN npm run build
# COPY --chown=node:node *.sh ./
# RUN chmod +x ./*.sh
CMD [ "yarn", "start" ]
