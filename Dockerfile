FROM centos:6.6
MAINTAINER Avanza Innovations <bilal.mahroof@avanzainnovations.com>

RUN useradd -ms /bin/bash avanza


WORKDIR /home/avanza

#RUN rpm -Uvh --insecure http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm 
RUN yum groupinstall -y "Development Tools" && yum clean all && yum install -y tar
USER avanza
#RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
ADD https://rpm.nodesource.com/setup_8.x /root/
#RUN curl -sL https://rpm.nodesource.com/setup_8.x
RUN bash /root/setup_8.x ;\  
yum -y install nodejs ;\
yum -y install java-1.8.0-openjdk


RUN node -v
RUN npm -v
RUN mkdir -p /home/avanza/app/logs
WORKDIR /home/avanza/app
COPY package.json .
COPY . .
RUN npm install

USER avanza
EXPOSE 9080

CMD [ "npm", "start"]
