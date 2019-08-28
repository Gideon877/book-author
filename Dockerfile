FROM tarampampam/node:alpine
LABEL MAINTAINER 'Thabang Gideon Magaola <gideon877@github.com>'

WORKDIR /home/app

COPY package.json /home/app/
COPY yarn.lock /home/app/
COPY . /home/app
RUN yarn
EXPOSE 8000 443 9229 5432
COPY files/startscript.sh /root/startscript.sh
RUN chmod +x /root/startscript.sh
ENTRYPOINT ["bash", "/root/startscript.sh"]
