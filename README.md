# iot shorthand

[![Build Status](https://travis-ci.org/chrisns/iot-shorthand.svg?branch=master)](https://travis-ci.org/chrisns/iot-shorthand)
[![npm downloads](https://img.shields.io/npm/dt/@chrisns/iot-shorthand.svg)](https://img.shields.io/npm/dt/@chrisns/iot-shorthand.svg "View this project on npm")
[![npm licence](https://img.shields.io/npm/l/@chrisns/iot-shorthand.svg)](https://img.shields.io/npm/l/@chrisns/iot-shorthand.svg "View this project on npm")
[![Coverage Status](https://coveralls.io/repos/github/chrisns/iot-shorthand/badge.svg?branch=master)](https://coveralls.io/github/chrisns/iot-shorthand?branch=master)

This is really just a self serving repo for me, I'm not sure who else will use it.
I've written a load of other things that all talk to AWS-IoT which has been a lot of copy paste and deviation between them.
The point of this repo is just to reduce that copy paste and different ways they all work.

More docs on usage to follow

Features
 - [x] Register a thing
 - [ ] Define a thing type
 - [x] Publish updates to thing shadow (`reported`)
 - [ ] Subscribe and publish events to thing shadow deltas (`desired`)
 - [ ] Delete a thing and unsubscribe to it
