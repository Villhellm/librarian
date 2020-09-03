FROM node:12

WORKDIR /usr/src/bot/src

RUN mkdir -p /.ssh

RUN mkdir -p /.store