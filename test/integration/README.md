# Prerequisites for the mira.spec to run


1. Create an attachable overlay network called `mira-integration-test`
2. Either one of: 
 * The DEBUG-flag set to true inside the spec file to start mira inside the test process
 * The mira-stack.yml started with docker stack deploy.
		