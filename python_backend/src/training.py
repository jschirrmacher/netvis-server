import nltk
import time

import config

def train_nlp_model():
    import random
    start = time.time()
    corp = nltk.corpus.ConllCorpusReader('.', 'data/'+config.NLP_CORPUS,['ignore', 'words', 'ignore', 'ignore', 'pos'],encoding='utf-8')
    tagged_sents = list(corp.tagged_sents())
    random.shuffle(tagged_sents)
    split_perc = 0.1
    split_size = int(len(tagged_sents) * split_perc)
    train_sents, test_sents = tagged_sents[split_size:], tagged_sents[:split_size]
    from ClassifierBasedGermanTagger import ClassifierBasedGermanTagger
    tagger = ClassifierBasedGermanTagger(train=train_sents)
    accuracy = tagger.evaluate(test_sents)
    end = time.time()
    print('======> Training done in : ' + str(end - start))
    print('======> Model accuracy: ' + str(accuracy))
    return tagger