FROM node:lts-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache git nano\
    make \
    g++ \
    sudo \
    curl \
    udev \
    ttf-freefont \
    build-base \
    libpng \
    libpng-dev \
    libtool \
    jpeg-dev \
    pango-dev \
    cairo-dev \
    giflib-dev \
    py3-pip \
    autoconf \
    automake \
    ffmpeg \
    imagemagick
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN npm ci --no-audit --no-fund
COPY ./ /usr/src/app
RUN npm run build && npm prune --production && npm cache clean --force
RUN pip3 install --break-system-packages yt-dlp==2023.7.6
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

CMD [ "npm", "start" ]