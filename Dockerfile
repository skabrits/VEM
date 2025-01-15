FROM python:3.11

RUN apt update && apt install -y docker

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
RUN install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

RUN curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
RUN chmod 700 get_helm.sh
RUN ./get_helm.sh

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["gunicorn","--chdir", "app", "app:app", "-b", "0.0.0.0:8000"]