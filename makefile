build: clean
	pnpm --filter {@yobta/*} run build

clean:
	rm -rf @yobta/**/lib
	rm -rf @yobta/**/*.tsbuildinfo
	rm -rf dev/**/lib
	rm -rf dev/**/*.tsbuildinfo
	rm -f *.tsbuildinfo

check: typecheck test lint

watch:
	pnpm --parallel --filter {@yobta/*} run build:watch


dev-backend:
	cd dev/backend && pnpm dev

dev-next:
	cd dev/next && pnpm dev

d: build
	make -j 3 watch dev-backend dev-next

i:
	rm -rf @yobta/**/node_modules
	rm -rf dev/**/node_modules
	rm -rf node_modules
	pnpm i

lint:
	pnpm lint

typecheck:
	pnpm tsc -p tsconfig.check.json

test-client:
	cd @yobta/client && pnpm test:watch

test-server:
	cd @yobta/server && pnpm test:watch

test-utils:
	cd @yobta/utils && pnpm test:watch

test: build
	pnpm test


up:
	pnpm up