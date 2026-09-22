.PHONY: deploy deploy-stage
deploy:
	$(MAKE) -C ../backend deploy-web
deploy-stage:
	$(MAKE) -C ../backend deploy-stage-web
