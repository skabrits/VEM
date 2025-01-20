Get-job | Remove-Job

cd ..\vem_server
docker build . -t skabrits/vem_server:dev

docker-compose -f "$PSScriptRoot\app.yaml" up -d db phpmyadmin back

#Start-Job -Init ([ScriptBlock]::Create("Set-Location '$pwd'")) -Name SERVER -ScriptBlock {
#    ..\.venv\Scripts\activate.ps1
#    cd "..\vem_server\vem_server"
#    $env:PYTHONPATH="$pwd\.." | Resolve-Path
#    $env:DB_PROVIDER="MySQL"
#    $env:DB_CONNECTIONS=5
#    waitress-serve --listen=*:5000 --threads=4 controller:app 2>&1 | Out-File ..\experimental\__debug__.log
#}

Start-Job -Name REACT -ScriptBlock {react-devtools}

$env:REACT_APP_API_BASE_URL="http://localhost:8000"

cd ..\vem_front
yarn start
