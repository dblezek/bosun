#!/bin/sh

while echo "(RE)STARTING BOSUN"; do
	go run main.go -w -dev -r -q || exit
done
