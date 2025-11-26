FROM node:22

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    curl \
    zip \
    && rm -rf /var/lib/apt/lists/*


ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH="${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/emulator:${PATH}"

RUN mkdir -p ${ANDROID_SDK_ROOT}

RUN cd ${ANDROID_SDK_ROOT} && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O commandlinetools.zip && \
    unzip commandlinetools.zip && \
    rm commandlinetools.zip && \
    mkdir -p cmdline-tools/latest && \
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true && \
    rmdir cmdline-tools/bin cmdline-tools/lib 2>/dev/null || true

RUN cd ${ANDROID_SDK_ROOT} && \
    if [ -d "cmdline-tools/cmdline-tools" ]; then \
        mv cmdline-tools/cmdline-tools/* cmdline-tools/latest/ && \
        rmdir cmdline-tools/cmdline-tools; \
    fi


RUN chmod +x ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager


RUN yes | ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager --licenses

RUN ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "ndk;25.1.8937393"


WORKDIR /app

COPY package*.json ./

RUN npm install


COPY . .


EXPOSE 8081


CMD ["npx", "react-native", "start", "--host", "0.0.0.0"]