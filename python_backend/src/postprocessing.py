import time
from collections import Counter

import config

def filter_nouns(content, tagged):
    start = time.time()    
    tagged_d = dict(tagged)
    for r in content:
        if (content[r]['type'] in config.SKIP_TYPES):
            del content[r]
        # content[r]['topics'] = [a for a in content[r]['topics'] if tagged_d[a][0] == 'N']
        content[r]['topics'] = [{"name": n.encode('utf-8'), "weight": w} for n, w in Counter([t for t in content[r]['topics'] if tagged_d[t][0] == 'N']).items() if int(w) >= 3]
    end = time.time()
    print('======> Filtering words done in: ' + str(end - start))
    return content