const AWS = require("aws-sdk")

const { AWS_IOT_ENDPOINT_HOST } = process.env
const AWSiot = new AWS.Iot()
const awsIot = require('aws-iot-device-sdk')
const _ = {
  filter: require("lodash.filter"),
  remove: require("lodash.remove")
}

interface Thing {
  name: string
  type: string
  attributes: object
}

interface Subscription {
  thing_name: String
  event_handler: Function
}

interface StateObject {
  state: Object
  metadata: Object
}

class iot {
  subscriptions: Array<Subscription> = []
  thingShadows: any
  constructor() {
    this.thingShadows = awsIot.thingShadow({
      host: AWS_IOT_ENDPOINT_HOST,
      protocol: 'wss'
    })
    this.thingShadows.on('delta', this.event_handler.bind(this))
  }

  public async discovered(thing: Thing, event_handler?: Function) {
    console.log(`DISCOVERED: ${JSON.stringify(thing)}`)
    await this.upsert_thing(thing)
    await this.subscribe_to_thing(thing.name, event_handler)
  }

  private event_handler(thing_name: String, state_object: StateObject) {
    console.log(`RECEIVED: ${thing_name}, PAYLOAD: ${JSON.stringify(state_object)}`)
    _.filter(this.subscriptions, { thing_name: thing_name })
      .forEach(subscriber => subscriber.event_handler(state_object.state))

    this.thingShadows.update(thing_name, { state: { desired: null } })
  }

  async upsert_thing(thing: Thing) {
    let aws_thing = {
      thingName: thing.name,
      thingTypeName: thing.type,
      attributePayload: {
        attributes: thing.attributes
      }
    }
    try {
      await AWSiot.updateThing(aws_thing).promise()
    } catch (error) {
      await AWSiot.createThing(aws_thing).promise()
    }
  }

  private subscribe_to_thing(thing_name: string, event_handler?: Function) {
    this.thingShadows.register(thing_name)
    if (event_handler) {
      this.subscriptions.push({ thing_name: thing_name, event_handler: event_handler })
    }

  }

  public report(thing_name: string, payload: Object) {
    console.log(`UPDATE: ${thing_name}, PAYLOAD: ${JSON.stringify(payload)}`)
    return this.thingShadows.update(thing_name, { state: { reported: payload } })
  }

  async destroy_thing(thing_name: String) {
    await this.thingShadows.unregister(thing_name)
    await AWSiot.deleteThing({ thingName: thing_name }).promise()
    _.remove(this.subscriptions, { thing_name: thing_name })
  }

}
module.exports = iot