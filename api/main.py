from flask import Flask, request, Response
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)


@app.route('/', methods=["POST"])
def proxy():
    data = request.get_data()
    headers = {key: value for key, value in request.headers.items()}
    path = request.path
    params = {key: value for key, value in request.args.items()}

    resp = requests.post(f"http://localhost:8083{path}", data=data, headers=headers, params=params)
    resp_headers = {key: value for key, value in resp.headers.items()}

    # Remove the Transfer-Encoding header to let Flask set it automatically
    resp_headers.pop("Transfer-Encoding", None)

    return Response(resp.content, status=resp.status_code, headers=resp_headers)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000, debug=True)