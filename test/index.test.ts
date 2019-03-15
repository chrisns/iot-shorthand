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
      unregister: sinon.stub()
    }
    awsIot = {
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

  })

  describe("upsert_thing", () => {
    it("should update the thing")
    it("should create the thing if the update fails")
  })

  describe("subscribe_to_thing", () => {
    it("should register an interest in the thing")
    it("should add the thing to the subscriptions if an event handler is provided")
    it("should not add to the subscriptions if an event handler is not provided")
  })

  describe("report", () => {
    var payload = { foo: "bar" }
    beforeEach(() => {
      app.thingShadows.update = sinon.stub()
      app.report("foo", payload)
    })
    it("should update the thing shadow", () =>
      expect(app.thingShadows.update).to.have.been.calledOnceWith("foo", { state: { reported: payload } })
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
