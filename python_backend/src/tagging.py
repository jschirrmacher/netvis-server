import time
import multiprocessing as mp

import config

def tag_words(word_batch, tagger, result, pos):
    print('======> Process '+str(pos)+' tagging ' + str(len(word_batch)) + ' words')
    start = time.time()
    result.put(tagger.tag(word_batch))
    end = time.time()
    print('======> Process '+str(pos)+' tagged ' + str(len(word_batch)) + ' in: ' + str(end - start))
    return


def start_tagging(to_tag, taggerp):
    tagger = taggerp
    tagged = []
    periode = 10000
    while (len(to_tag)):
        processes = []
        parts = []
        output = mp.Queue()
        for i in range(config.MPC):
            part = to_tag[i*periode:(i+1)*periode]
            parts.append(part)
            to_tag = to_tag[(i+1)*periode:]
            processes.append(mp.Process(target=tag_words, args=(parts[i], tagger, output, i)))
            if (len(to_tag) == 0): break
        for p in processes:
            p.start()
        for p in processes:
            tagged += output.get()
        for p in processes:
            p.join()
    return tagged