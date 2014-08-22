# example-geocodeer-json

## Objective

Example RESTFul JSON API based on the PDOK Geocodeerservice. Besides the standard RD (Rijksdriehoekcoördinaten) geometry points, this service will
also give the GPS points based on the WGS84 standard.

## Usage

* npm install
* node app.js
* http://localhost:3003/

### Tools

The function RD2GPS(x, y) is based on a Python implementation by Kilian Valkhof (https://github.com/Kilian) which is based 
on a function made by Henkjan Faber (henkjan.faber@blue-chips.nl). This function converts RD points to GPS points. 

Nodeclipse is free open-source project that grows with your contributions.
