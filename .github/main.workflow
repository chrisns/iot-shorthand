workflow "build and publish" {
  on = "push"
  resolves = ["test", "publish"]
}

action "install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}

action "test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "test"
  needs = ["install"]
}

action "filter to only master" {
  uses = "actions/bin/filter@d820d56839906464fb7a57d1b4e1741cf5183efa"
  needs = ["test"]
  args = "branch master"
}

action "version bump" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "version prepatch"
  needs = ["filter to only master"]
}

action "publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "publish"
  secrets = ["NPM_AUTH_TOKEN"]
  needs = ["version bump"]
}
