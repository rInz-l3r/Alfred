from youtube_search import YoutubeSearch
from sys import argv
import pafy

def search(user_input):
    final_list = []
    url_list = pull_results(user_input)
    cleaned_url_list = remove_compliations(url_list)
    for url in cleaned_url_list:
        try:
            final_list.append(url)
        except OSError:
            pass
    return final_list

# Search youtube for an artist
def pull_results(user_input):
    results = YoutubeSearch(user_input, max_results=50).to_dict()
    url_list = ["https://www.youtube.com"+element['url_suffix'] for element in results]
    return url_list

# remove compilation videos that are really long, just get specific tracks.
def remove_compliations(url_list):
    cleaned_url_list = []
    for url in url_list:
        try:
            song = pafy.new(url)
            if get_sec(song.duration) < 540:
                cleaned_url_list.append(url)
        except OSError:
            pass
    return cleaned_url_list

# translate hh:mm:ss to seconds
def get_sec(song_duration):
    h, m, s = song_duration.split(':')
    return int(h) * 3600 + int(m) * 60 + int(s)

if __name__ == '__main__':
    search(argv)