DATA_FILES=data/train-images-idx3-ubyte data/train-labels-idx1-ubyte

.PHONY: all
all: $(DATA_FILES)

$(DATA_FILES): | data
	curl --compressed http://yann.lecun.com/exdb/mnist/$(@F).gz > $@

data:
	mkdir -p $@

.PHONY: clean
clean:
	rm -rf data
