import pafy
import os
import time
from search_youtube import search
from sys import argv

def download_track(URL):
    print(URL)
    try:
        os.remove('track')
    except FileNotFoundError:
        pass
    video = pafy.new(URL)
    best = video.getbestaudio()
    print(best.extension)
    best.download(filepath='track')
    return video.title

def track_name(URL):
    print(URL)
    video = pafy.new(URL)
    return video.title

def search_yt(user_input):
    return search(user_input)

def standalone_download(URL):
    print(URL)
    video = pafy.new(URL)
    best = video.getbest()
    best.download(filepath='manual'+best.extension)
    return video.title

if __name__ == "__main__":
    standalone_download(argv[1])