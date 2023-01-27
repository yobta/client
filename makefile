
build: clean
	pnpm build

clean:
	rm -rf @yobta/**/lib
	rm -rf @yobta/**/tsconfig.tsbuildinfo

dev-backend:
	cd dev/backend && pnpm dev

dev-next:
	cd dev/next && pnpm dev

d:
	make -j 3 dev-backend dev-next watch

i:
	pnpm i


typecheck:
	pnpm tsc --noEmit

watch:
	pnpm tsc --watch