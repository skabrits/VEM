#!/bin/bash

while read -r line || [[ -n "$line" ]];
do
  if printf '%s' "$line" | grep -q -e '='; then
    varname=$(printf '%s' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s' "$line" | sed -e 's/^[^=]*=//')
  fi

  value=$(printf '%s' "${!varname}")
  [[ -z $value ]] && value=${varvalue}

  safe_value=${value//[~]/\\~}
  find ./ -name "*.js" -exec bash -c 'FILE_NAME="$1" && sed -i "s~<<||'${varname}'||>>~'${safe_value}'~g" "$FILE_NAME"' bash {} \;

done < .env