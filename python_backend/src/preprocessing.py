# coding=utf-8
from pymongo import MongoClient
import time
import json
import re
import nltk

import config
def init_nlp():
    nltk.download('punkt')

def filter_words(msg):
    tokens = []
    word = (" ".join(re.findall(r"[A-Za-züäöÜÄÖß]*", msg))).replace("  "," ")
    if (' ' in word):
        word = [w for w in nltk.word_tokenize(word) if len(w) > 2]
        tokens += word
    else:
        if (word != ''):
            tokens.append(word)
    return tokens

def load_all_data():
    start = time.time()
    client = MongoClient(config.MONGO_URL)
    db=client.seec
    rdata = dict([(r['_id'], {"t": r['t'], "name": r['name']}) for r in db.rocketchat_room.find({"name": { "$exists": True }, "t": { "$exists": True }}, {"t": 1, "name": 1})])
    mdata = db.rocketchat_message.find({}, {"msg": 1, "rid": 1, "u": 1}).limit(config.DATA_COUNT)

    content = {}

    for i in mdata:
        rid = i['rid'].encode('utf-8')
        if (not rid in rdata): continue
        msg = i['msg']
        user = i['u']['username'].encode('utf-8')
        tokens = filter_words(msg)
        if (rid in content):
            content[rid]['topics'] += tokens
            if (not user in content[rid]['users']):
                content[rid]['users'].append(user)
        else:
            content[rid] = {}
            content[rid]['topics'] = tokens
            content[rid]['type'] = rdata[rid]['t']
            content[rid]['users'] = [user]
            content[rid]['name'] = rdata[rid]['name']


    end = time.time()
    print('======> Loading from DB done in : ' + str(end - start))
    return content

def remove_pretagged_words(content, tagged):
    start = time.time()
    to_tag = []
    tagged_d = dict(tagged)
    to_tag = [w for r in content for w in content[r]['topics'] if not w in tagged_d]
    end = time.time()
    print('======> Removed pretagged words in '+ str(end - start))
    return to_tag