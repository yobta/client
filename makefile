build: clean
	pnpm build

clean:
	rm -rf @yobta/**/lib
	rm -rf @yobta/**/tsconfig.tsbuildinfo

i:
	pnpm i

typecheck:
	pnpm tsc --noEmit

watch:
	pnpm tsc --watch