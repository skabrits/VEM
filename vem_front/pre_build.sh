#!/bin/bash

touch .env.tmp

while read -r line || [[ -n "$line" ]];
do
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    echo "${varname}=<<||${varname}||>>" >> .env.tmp
  fi
done < .env

mv .env.tmp .env

sed -i "\~<script src=\"http://localhost:8097\"></script>~d" public/index.html
