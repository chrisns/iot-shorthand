var proxyquire = require("proxyquire").noCallThru()
const chai = require("chai")
const sinon = require("sinon")
chai.use(require("sinon-chai"))
const expect = chai.expect

describe("app", () => {
  var app
  var stubs
  var myapp
  var thingShadow
  var awsIot
  beforeEach(() => {
    thingShadow = {
      register: sinon.stub(),
      unregister: sinon.stub(),
      update: sinon.stub()
    }
    awsIot = {
      updateThing: sinon.stub().returns({ promise: sinon.stub() }),
      createThing: sinon.stub().returns({ promise: sinon.stub() }),
      deleteThing: sinon.stub().returns({ promise: sinon.stub() })
    }
    stubs = {
      'aws-sdk': {
        Iot: sinon.stub().returns(awsIot)
      },
      'aws-iot-device-sdk': { thingShadow: sinon.stub().returns(thingShadow) }
    }
    myapp = proxyquire('../index.ts', stubs)
    app = new myapp()

  })

  it("adds thingShadows to the class on construction", () =>
    expect(stubs["aws-iot-device-sdk"].thingShadow).to.have.been.calledOnce
  )

  describe("discovered", () => {
    var thing = { name: "foo", type: "bar", attributes: { foo: "bar" } }
    var event_handler = sinon.stub()
    beforeEach(() => {
      app.upsert_thing = sinon.stub()
      app.subscribe_to_thing = sinon.stub()
      app.discovered(thing, event_handler)
    })
    it("should upsert the thing", () =>
      expect(app.upsert_thing).to.have.been.calledOnceWith(thing)
    )
    xit("should subscribe to the thing", () =>
      expect(app.subscribe_to_thing).to.have.been.calledOnceWith(thing.name, event_handler)
    )
  })

  describe("event_handler", () => {
    beforeEach(() => {
      app.subscriptions = [{ thing_name: "foo", event_handler: sinon.stub() }, { thing_name: "foo", event_handler: sinon.stub() }, { thing_name: "bar", event_handler: sinon.stub() }]
      app.event_handler("foo", { state: "some state here" })
    })
    it("should dispatch the event to the handlers", () =>
      expect(app.subscriptions[0].event_handler).to.have.been.calledOnceWith("some state here")
    )
    it("should dispatch the event to multiple handlers", () =>
      expect(app.subscriptions[1].event_handler).to.have.been.calledOnceWith("some state here")
    )
    it("should not dispatch the event to handlers that aren't subscribing", () =>
      expect(app.subscriptions[2].event_handler).to.not.have.been.called
    )
  })

  describe("upsert_thing", () => {
    let thing = { name: "foo", type: "bar", attributes: { joe: "smith", john: "james" } }
    let awsThing = {
      thingName: "foo",
      thingTypeName: "bar",
      attributePayload: {
        attributes: { joe: "smith", john: "james" }
      }
    }
    it("should update the thing", () => {
      app.upsert_thing(thing)
      expect(awsIot.updateThing).to.have.been.calledWith(awsThing)
      expect(awsIot.createThing).to.not.have.been.called
    })
    it("should create the thing if the update fails", () => {
      awsIot.updateThing.throws("exception")
      app.upsert_thing(thing)
      expect(awsIot.createThing).to.have.been.calledWith(awsThing)

    })
  })

  describe("subscribe_to_thing", () => {
    beforeEach(() => {
      app.subscribe_to_thing("foo")
      // app.thingShadows.register = sinon.stub()
    })
    it("should register an interest in the thing", () =>
      expect(thingShadow.register).to.be.have.been.calledOnceWith("foo")
    )
    it("should add the thing to the subscriptions if an event handler is provided", () =>
      expect(app.subscriptions).to.be.empty
    )
    it("should not add to the subscriptions if an event handler is not provided", () => {
      app.subscribe_to_thing("foo", "bar")
      return expect(app.subscriptions[0]).to.eql({ thing_name: "foo", event_handler: "bar" })
    })
  })

  describe("report", () => {
    var payload = { foo: "bar" }
    beforeEach(() => {
      app.report("foo", payload)
    })
    it("should update the thing shadow", () =>
      expect(thingShadow.update).to.have.been.calledOnceWith("foo", { state: { reported: payload } })
    )
  })

  describe("destroy_thing", () => {
    beforeEach(async () => app.destroy_thing("foo"))

    it("should unregister the subscription", () =>
      expect(thingShadow.unregister).to.have.been.calledOnceWith("foo")
    )
    it("should delete the thing in AWS", () =>
      expect(awsIot.deleteThing).to.have.been.calledOnceWith({ thingName: "foo" })
    )
    it("should remove it from the list of subscriptions")
  })

})
