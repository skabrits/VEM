#!/bin/bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

TAG=$1

find "${SCRIPTPATH}/../" -maxdepth 2 -name "Dockerfile" -exec bash -c 'DOCKERFILE_PATH="$1" && cd $(dirname $DOCKERFILE_PATH) && docker build . -t "skabrits/$(dirname $DOCKERFILE_PATH | xargs basename | sed "s/_/-/g"):'"${TAG}"'"' bash {} \;