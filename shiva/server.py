import mimetypes
import urllib

from flask import Flask, request, Response, abort

app = Flask(__name__)
DEFAULT_PATH = 'index.html'
API_URI = 'http://localhost:9002'

@app.route('/')
@app.route('/<path:path>')
def serve(path=DEFAULT_PATH):
    try:
        content = file(path, 'r').read()
    except:
        abort(404)
    mimetype = mimetypes.guess_type(path)[0]

    return Response(content, status=200, mimetype=mimetype)


@app.route('/api/<path:path>')
def proxy(path):
    uri = '%s/%s' % (API_URI, path)

    if request.query_string:
        uri = '?'.join((uri, request.query_string))

    _request = urllib.urlopen(uri)

    mimetype = _request.headers.get('Content-Type', 'text/html')
    mimetype = mimetype.split(';')[0].strip()

    return Response(_request.read(), status=_request.getcode(),
                    mimetype=mimetype)

if __name__ == '__main__':
    app.run('0.0.0.0', port=9001, debug=True)
