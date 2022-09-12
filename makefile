build:
	npm run build

lint:
	npm run lint

size-limit: build
	npm run size-limit

typecheck:
	npm run typecheck

test:
	npm run test:watch

check:
	npm run typecheck
	npm run test
	npm run lint
	npm run size-limit

bump:
	npm version patch
	git add .
	git push

publish: check bump
	npm publish

up:
	pnpm up