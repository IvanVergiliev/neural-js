DATA_FILES=data/train-images-idx3-ubyte data/train-labels-idx1-ubyte

.PHONY: all
all: $(DATA_FILES) static/main.prefixed.css

$(DATA_FILES): | data
	curl http://yann.lecun.com/exdb/mnist/$(@F).gz | gunzip > $@

data:
	mkdir -p $@

static/main.prefixed.css: static/main.css
	node_modules/autoprefixer/autoprefixer static/main.css -o $@

.PHONY: clean
clean:
	rm -rf data
