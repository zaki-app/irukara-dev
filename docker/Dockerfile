FROM node:16.13.2

# 環境変数
ENV NODE_ENV="development"

# AWS-CLIの設定
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

RUN apt-get update
RUN apt-get install -y \
    python3-pip \
    jq
RUN pip3 install awscli --upgrade --user
RUN pip3 install yq
RUN apt-get install -y awscli
RUN npm install -g serverless
RUN npm install -g serverless-offline
RUN npm i -g wscat
RUN aws configure set region ap-northeast-1
# RUN serverless dynamodb install
# RUN sls config credentials --provider aws --key ${AWS_ACCESS_KEY_ID} --secret ${AWS_SECRET_ACCESS_KEY}

# watchman isntall
RUN apt-get install -y make libtool libssl-dev autoconf automake pkg-config g++
RUN git clone https://github.com/facebook/watchman.git -b v4.9.0 --depth 1 \
    && cd watchman \
    && ./autogen.sh \
    && ./configure --disable-dependency-tracking --without-python --without-pcre --enable-lenient \
    && make \
    && make install

CMD [ "/bin/bash" ]
