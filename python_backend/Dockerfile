FROM python:2.7

RUN pip install requests
RUN pip install nltk
RUN pip install pymongo

ADD src /home

WORKDIR /home
CMD python main.py --filterw=$FILTERW --datac=$DATA_COUNT --mongo_url=$MONGO_URL --server_url=$SERVER_URL --db=$MONGO_DB