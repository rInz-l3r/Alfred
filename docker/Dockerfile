FROM ubuntu:bionic

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get upgrade \
    && apt -y install ffmpeg \
    && apt install -y software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt update \
    && apt install -y python3-pip\
    && python3 -m pip install -U pip\
    && apt install -y curl\
    && curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh\
    && bash nodesource_setup.sh\
    && apt install -y nodejs\
    && apt install -y ffmpeg


COPY . .
RUN python3 -m pip install --no-cache-dir -r requirements.txt \ 
    && npm install

CMD ["bash", "alfred.sh"]