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
	pnpm i

lint:
	pnpm lint

test:
	cd @yobta/client && pnpm test
	cd @yobta/server && pnpm test

typecheck:
	pnpm tsc -p tsconfig.check.json

watch:
	pnpm tsc --watch
