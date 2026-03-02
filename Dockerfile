FROM debian:12

ENV NODE_VERSION=24.x

RUN apt-get update
RUN apt-get install -y curl gnupg2
RUN curl -fsSL https://deb.nodesource.com/setup_"${NODE_VERSION}"| bash -
RUN apt-get install -y nodejs
RUN apt-get clean

RUN node --version && \
    npm --version

EXPOSE 3000

WORKDIR /app
COPY . /app

CMD ["npm", "run", "setup-dev"]