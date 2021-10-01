import pafy
import os
import time
from sys import argv
import uuid

def download_track(URL):
    print(f'Getting {URL}')
    if os.path.exists('src/music') == False:
        os.mkdir('src/music/', 755)

    for f in os.listdir('src/music/'):
        os.remove(os.path.join('src/music/', f))
    video = pafy.new(URL)
    best = video.getbestaudio()
    print(best)
 
    best.download(filepath=f'src/music/{video.title}')
    print(f'{video.title}.{best.extension} downloaded.')
    return video.title

def track_name(URL):
    print(URL)
    video = pafy.new(URL)
    print(f'{video.title} queued.')
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
    # standalone_download(argv[1])
    download_track("yeah")