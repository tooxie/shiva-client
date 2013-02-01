import os

from flask import Flask, request, Response, abort

app = Flask(__name__)
DEFAULT_PATH = 'index.html'
MIMES = {
    'css': 'text/css',
    'html': 'text/html',
    'ico': 'image-x-icon',
    'jpg': 'image/jpeg',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
}


@app.route('/')
@app.route('/<path:path>')
def serve(path=DEFAULT_PATH):
    """ Petit flask-based test server for angular-phonecat app """

    if not os.path.exists(path):
        abort(404)

    content = file(path, 'r').read()
    mimetype = MIMES[path[path.rindex('.') + 1:]]

    return Response(content, status=200, mimetype=mimetype)


@app.route('/api/<path:path>')
def proxy(path):
    import urllib

    API_URI = 'http://localhost:9002'
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
