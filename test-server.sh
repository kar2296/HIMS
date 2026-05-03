#!/bin/bash
curl -s http://localhost:5173 > /dev/null
if [ $? -eq 0 ]; then
  echo "Vite is running"
else
  echo "Vite is not running"
fi
