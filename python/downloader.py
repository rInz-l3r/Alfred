import pafy
import os
import time
from search_youtube import search
from sys import argv

def download_track(URL):
    print(f'Getting {URL}')
    try:
        os.remove('track')
    except FileNotFoundError:
        pass
    video = pafy.new(URL)
    best = video.getbest()
    path = os.getcwd()
    path = path.split('/')
    path[len(path)-1] = "track"
    best.download(filepath='/'.join(path))
    print(f'{video.title}.{best.extension} downloaded.')
    return video.title

def track_name(URL):
    print(URL)
    video = pafy.new(URL)
    return video.title

def search_yt(user_input):
    return search(user_input)

def standalone_download(URL):
    print(f'Getting {URL}')
    video = pafy.new(URL)
    best = video.getbest()
    best.download(filepath=f'{video.title}.{best.extension}')
    print(f'{video.title}.{best.extension} downloaded.')

if __name__ == "__main__":
    standalone_download(argv[1])