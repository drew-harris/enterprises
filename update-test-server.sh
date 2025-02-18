#!/usr/bin/env bash

ssh test-server "cd enterprises && git pull && docker compose up --build -d"
