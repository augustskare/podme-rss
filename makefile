DENON := $(shell command -v denon 2> /dev/null)

dev:
ifndef DENON
	deno install -qAf --unstable https://deno.land/x/denon/denon.ts; 
endif
	denon run --allow-net --inspect ./mod.ts 
