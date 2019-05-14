FROM python:2.7

RUN pip install requests
RUN pip install nltk
RUN pip install pymongo

ADD src /home
RUN chmod +x /home/main.py

WORKDIR /home
CMD ["python", "main.py", "--datac=1000", "--mongo_url=mongodb://host.docker.internal:27017", "--server_url=http://host.docker.internal:3002"]