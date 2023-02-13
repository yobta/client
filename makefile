
build: clean
	pnpm build

clean:
	rm -rf @yobta/**/lib
	rm -rf @yobta/**/*.tsbuildinfo
	rm -rf dev/**/lib
	rm -rf dev/**/*.tsbuildinfo
	rm -f *.tsbuildinfo

dev-backend:
	cd dev/backend && pnpm dev

dev-next:
	cd dev/next && pnpm dev

d:
	make -j 2 dev-backend dev-next

i:
	pnpm i

typecheck:
	pnpm tsc -p tsconfig.check.json

lint:
	pnpm lint

watch:
	pnpm tsc --watch
