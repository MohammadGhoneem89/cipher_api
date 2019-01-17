FROM centos/nodejs-8-centos7
MAINTAINER Avanza Innovations <bilal.mahroof@avanzainnovations.com>

RUN useradd -ms /bin/bash avanza


WORKDIR /home/avanza

#RUN rpm -Uvh --insecure http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm 
#RUN yum groupinstall -y "Development Tools" && yum clean all && yum install -y tar

RUN node -v
RUN npm -v
USER avanza
RUN mkdir -p /home/avanza/app/logs
WORKDIR /home/avanza/app
COPY package.json .
COPY . .
RUN npm install

USER avanza
EXPOSE 9080

CMD [ "npm", "start"]
