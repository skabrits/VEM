#!/bin/bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

docker-compose -f "${SCRIPTPATH}/app.yaml" up -d