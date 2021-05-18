from bottle import run, post, request, response, get, route, default_app
import json
import validators
import downloader

@post('/alfred/track')
def download_track():
    for word in request.json['link'].split(' '):
        if validators.url(word):
            try:
                track_name = downloader.download_track(word)
                response.status = 200
                response.headers['Content-Type'] = 'application/json'
                return {'track': json.dumps(track_name)}
            except OSError:
                response.status = 404
                return {}
                
@post('/alfred/trackname')
def track_name():
    for word in request.json['link'].split(' '):
        if validators.url(word):
            track_name = downloader.track_name(word)
            response.status = 200
            response.headers['Content-Type'] = 'application/json'
            return {'track': json.dumps(track_name)}

# Disconnected
# @post('/alfred/search')
# def search():
#     if 'asearch' in request.json['link']:
#         words = [word for word in request.json['link'].split(' ')]
#         words.remove('asearch')
#         track_list = downloader.search_yt(' '.join(words))
#         response.status = 200
#         response.headers['Content-Type'] = 'application/json'
#         return {'track_list': track_list}

run(host='localhost', port=8080, reloader=True)
