from bottle import run, post, request, response, get, route, default_app
import json


alfreds = {}

@post('/manager/child')
def identifyChild():
    req = request.json
    instance = req.get('instance')
    if instance not in alfreds:
        alfreds[instance] = True
        print(f' ## new connection from Alfred:{instance}!')

@post('/manager/job')
def giveJob():
    req = request.json
    incoming_instance = req.get('instance')
    incoming_guild = req.get('guild')

    ### New Guild Request
    
    # If a guild is new and isnt linked to an instance...
    if incoming_guild not in [guild for instance, guild in alfreds.items()]:
        # If the requesting instance is available
        if alfreds.get(incoming_instance) == True:
            alfreds[incoming_instance] = incoming_guild
            print("!!! New Guild Assignment !!!")
            print(json.dumps(alfreds, indent=2))
            response.status = 200
            return {}
        # If the requesting instance is unavailable
        else:
            response.status = 401
            return {}

    # If the guild is tied to an instance
    else:
        if alfreds.get(incoming_instance) == incoming_guild:
            response.status = 200
            return {}
        else:
            response.status = 401
            return {}


@post('/manager/available')
def giveJob():
    req = request.json
    incoming_instance = req.get('instance')
    alfreds[incoming_instance] = True
    print(f' !!! {incoming_instance} available.')
    response.status = 200
    print(json.dumps(alfreds, indent=2))
    return {}

run(host='localhost', port=8081, reloader=True)
