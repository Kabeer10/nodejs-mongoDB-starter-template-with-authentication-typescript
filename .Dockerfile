FROM node:16-alpine
ENV NODE_ENV=production

WORKDIR /usr/src/api
COPY package.json /usr/src/api/
COPY yarn.lock /usr/src/api/
RUN yarn install --production=false
COPY . .
RUN yarn build
ENV PORT=3001
EXPOSE 3001
CMD ["yarn", "start"]