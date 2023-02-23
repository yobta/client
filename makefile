clean:
	rm -rf @yobta/**/lib
	rm -rf @yobta/**/*.tsbuildinfo
	rm -rf dev/**/lib
	rm -rf dev/**/*.tsbuildinfo
	rm -f *.tsbuildinfo

build: clean
	pnpm build

check: lint typecheck

dev-backend:
	cd dev/backend && pnpm dev

dev-next:
	cd dev/next && pnpm dev

d:
	make -j 2 dev-backend dev-next

i:
	rm -rf @yobta/**/node_modules
	rm -rf dev/**/node_modules
	rm -rf node_modules
	pnpm i

lint:
	pnpm lint

typecheck:
	pnpm tsc -p tsconfig.check.json

test-server:
	cd @yobta/server && pnpm test:watch

test: build
	pnpm test

check: lint typecheck test

watch:
	pnpm tsc --watch
