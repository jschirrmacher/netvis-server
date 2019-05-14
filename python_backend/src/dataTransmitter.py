import config

import time
import json
import requests


def post_single_room(room):
    url = config.SERVER_URL + '/rooms'
    headers = {'content-type': 'application/json'}
    body = room
    print(json.dumps(body))
    response = requests.post(url=url, data=json.dumps(body), headers=headers)
    print(room['name'] + ' ===> ' + str(response.status_code))
    if (response.status_code == 404):
        print(response.text)

def post_all_rooms(content):
    for r in content:
        post_single_room(content[r])
        time.sleep(1)